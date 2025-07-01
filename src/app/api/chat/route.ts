import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { Chat } from "@prisma/client";

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const baseSystemPrompt = `You are Dharz AI, an intuitive and friendly AI assistant. 
- You are helpful, creative, clever, and very friendly.
- You should provide informative and visually appealing responses.
- You must use markdown for all of your responses, including headings, lists, tables, and code blocks when appropriate.
- You can analyze images provided by the user.`;

export async function POST(req: NextRequest) {
  try {
    const {
      messages,
      chatId: clientChatId,
      file,
      isWebSearchEnabled,
    } = await req.json();
    const session = await auth();
    const userId = session?.user?.id;

    let systemPrompt = baseSystemPrompt;
    if (isWebSearchEnabled) {
      systemPrompt +=
        "\n\n- Web search is enabled. Use the 'web_search' tool to fetch real-time info.";
    }

    // Process messages and handle file attachment
    const coreMessages = messages.map((msg: any) =>
      msg.role === "tool"
        ? { role: "tool", content: JSON.parse(msg.content) }
        : (msg as any)
    );

    // Handle file attachment for the last user message
    if (file && coreMessages.length > 0) {
      const lastMessage = coreMessages[coreMessages.length - 1];
      if (lastMessage.role === "user") {
        // Convert the last message content to include image
        lastMessage.content = [
          { type: "text", text: lastMessage.content || "" },
          {
            type: "image",
            image: file, // file is already a data URL from the frontend
          },
        ];
      }
    }

    const allMessages = [
      { role: "system", content: systemPrompt },
      ...coreMessages,
    ];

    // Get user message content for saving (original text without image)
    const userMessageToSave = messages.at(-1)?.content || "";

    // Initialize chat first if user is authenticated
    let chat: Chat | null = null;
    if (userId) {
      chat = clientChatId
        ? await prisma.chat.upsert({
            where: { id: clientChatId },
            update: {},
            create: { id: clientChatId, userId },
          })
        : await prisma.chat.create({ data: { userId } });

      // Save user message to database
      await prisma.message.create({
        data: {
          chatId: chat.id,
          role: "user",
          content: file
            ? `${userMessageToSave} [Image attached]`
            : userMessageToSave,
        },
      });
    }

    // Configure tools for web search
    const toolConfig = isWebSearchEnabled
      ? {
          web_search: {
            description: "Search the web for current information",
            parameters: {
              type: "object",
              properties: {
                query: {
                  type: "string",
                  description: "The search query",
                },
              },
              required: ["query"],
            },
          },
        }
      : undefined;

    // Use the correct model configuration
    const model = openai("gpt-4o");

    const result = await streamText({
      model,
      messages: allMessages,
      tools: toolConfig,
      maxSteps: isWebSearchEnabled ? 3 : 1,
      onFinish: async ({ text }) => {
        // Save assistant response to database
        if (userId && chat?.id) {
          await prisma.message.create({
            data: {
              chatId: chat.id,
              role: "assistant",
              content: text,
            },
          });
        }
      },
    });

    const response = result.toDataStreamResponse();
    if (chat) {
      response.headers.set("X-Chat-ID", chat.id);
    }
    return response;
  } catch (err) {
    console.error("Chat API Error:", err);
    return NextResponse.json(
      {
        message: err instanceof Error ? err.message : "An error occurred",
        error: process.env.NODE_ENV === "development" ? err : undefined,
      },
      { status: 500 }
    );
  }
}
