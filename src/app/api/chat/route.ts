import { createOpenAI } from "@ai-sdk/openai";
import { CoreMessage, streamText, StreamData } from "ai";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const systemPrompt = `You are Dharz AI, an intuitive and friendly AI assistant. 
- You are helpful, creative, clever, and very friendly.
- You should provide informative and visually appealing responses.
- You must use markdown for all of your responses, including headings, lists, tables, and code blocks when appropriate.
- You can analyze images provided by the user.`;

export async function POST(req: NextRequest) {
  try {
    const { messages, chatId: clientChatId, file } = await req.json();
    const session = await auth();
    const userId = session?.user?.id;

    // Map client messages to the Vercel AI SDK CoreMessage format
    const coreMessages: CoreMessage[] = messages.map(
      (msg: { role: "user" | "assistant"; content: string }) => ({
        role: msg.role,
        content: msg.content,
      })
    );

    // If a file is present, update the last message's content to include the image
    if (file && coreMessages.length > 0) {
      const lastMessage = coreMessages[coreMessages.length - 1];
      if (lastMessage.role === "user") {
        lastMessage.content = [
          { type: "text", text: lastMessage.content as string },
          { type: "image", image: new URL(file) }, // The file is a data URI
        ];
      }
    }

    // Prepend the system prompt to the message history
    const allMessages: CoreMessage[] = [
      { role: "system", content: systemPrompt },
      ...coreMessages,
    ];

    // Get the text part of the original last user message to save to the database
    const userMessageToSave = messages[messages.length - 1].content;

    // For unauthenticated users, just stream the response
    if (!userId) {
      const result = await streamText({
        model: openai("gpt-4o"),
        messages: allMessages,
      });
      // The `toAIStreamResponse` helper handles the streaming response.
      return result.toDataStreamResponse();
    }

    // For authenticated users, save the conversation.
    let chat;
    if (clientChatId) {
      chat = await prisma.chat.upsert({
        where: { id: clientChatId },
        create: { userId },
        update: {},
        select: { id: true },
      });
    } else {
      chat = await prisma.chat.create({
        data: { userId },
        select: { id: true },
      });
    }

    await prisma.message.create({
      data: {
        chatId: chat.id,
        role: "user",
        content: userMessageToSave,
      },
    });

    const data = new StreamData();
    data.append({ chatId: chat.id });

    const result = await streamText({
      model: openai("gpt-4o"),
      messages: allMessages,
      onFinish: async ({ text }) => {
        // Save the final assistant response to the database
        await prisma.message.create({
          data: {
            chatId: chat.id,
            role: "assistant",
            content: text,
          },
        });
        data.close();
      },
    });

    // The `toAIStreamResponse` helper also handles streaming custom data
    return result.toDataStreamResponse({ data });
  } catch (error) {
    console.error("Chat API error:", error);
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { message: "An internal error occurred" },
      { status: 500 }
    );
  }
}
