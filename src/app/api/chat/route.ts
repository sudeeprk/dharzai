import { createOpenAI } from "@ai-sdk/openai";
import { CoreMessage, streamText, createDataStream } from "ai";
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

    const coreMessages: CoreMessage[] = messages.map(
      (msg: { role: "user" | "assistant"; content: string }) => ({
        role: msg.role,
        content: msg.content,
      })
    );

    if (file && coreMessages.length > 0) {
      const lastMessage = coreMessages[coreMessages.length - 1];
      if (lastMessage.role === "user") {
        lastMessage.content = [
          { type: "text", text: lastMessage.content as string },
          { type: "image", image: new URL(file) },
        ];
      }
    }

    const allMessages: CoreMessage[] = [
      { role: "system", content: systemPrompt },
      ...coreMessages,
    ];

    const userMessageToSave = messages[messages.length - 1].content;

    if (!userId) {
      const result = await streamText({
        model: openai("gpt-4o"),
        messages: allMessages,
      });

      return result.toDataStreamResponse();
    }

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
      });
    }

    await prisma.message.create({
      data: {
        chatId: chat.id,
        role: "user",
        content: userMessageToSave,
      },
    });

    const result = await streamText({
      model: openai("gpt-4o"),
      messages: allMessages,
      onFinish: async ({ text }) => {
        await prisma.message.create({
          data: {
            chatId: chat.id,
            role: "assistant",
            content: text,
          },
        });
      },
    });

    // Create a custom response that includes the chatId
    const response = result.toDataStreamResponse();
    response.headers.set("X-Chat-ID", chat.id);
    return response;
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
