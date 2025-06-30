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

    const coreMessages = messages.map((msg: any) =>
      msg.role === "tool"
        ? { role: "tool", content: JSON.parse(msg.content) }
        : (msg as any)
    );

    if (file && coreMessages.length) {
      const last = coreMessages[coreMessages.length - 1];
      if (last.role === "user") {
        last.content = [
          { type: "text", text: last.content },
          { type: "image", image: new URL(file) },
        ];
      }
    }

    const allMessages = [
      { role: "system", content: systemPrompt },
      ...coreMessages,
    ];

    const userMessageToSave = messages.at(-1)?.content;

    const toolConfig = isWebSearchEnabled
      ? {
          web_search: openai.tools.webSearchPreview(),
        }
      : undefined;

    const model = isWebSearchEnabled
      ? openai.responses("gpt-4o")
      : openai("gpt-4o");

    const result = await streamText({
      model,
      messages: allMessages,
      tools: toolConfig ? { web_search: toolConfig.web_search } : undefined,
      maxSteps: isWebSearchEnabled ? 2 : 1,
      onFinish: async ({ text }) => {
        if (userId && chat?.id) {
          await prisma.message.create({
            data: { chatId: chat.id, role: "assistant", content: text },
          });
        }
      },
    });

    let chat: Chat | null = null;
    if (userId) {
      chat = clientChatId
        ? await prisma.chat.upsert({
            where: { id: clientChatId },
            update: {},
            create: { id: clientChatId, userId },
          })
        : await prisma.chat.create({ data: { userId } });

      await prisma.message.create({
        data: { chatId: chat.id, role: "user", content: userMessageToSave },
      });
    }

    const response = result.toDataStreamResponse();
    if (chat) response.headers.set("X-Chat-ID", chat.id);
    return response;
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: (err as any).message },
      { status: 500 }
    );
  }
}
