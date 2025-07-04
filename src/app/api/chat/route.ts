import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { Chat } from "@prisma/client";
import { SYSTEM_PROMPTS } from "@/constants/system-prompts";

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const baseSystemPrompt = SYSTEM_PROMPTS.DEFAULT;

async function imageUrlToBase64DataUrl(imageUrl: string): Promise<string> {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    const mimeType = getMimeTypeFromUrl(imageUrl);

    const base64String = Buffer.from(uint8Array).toString("base64");
    const dataUrl = `data:${mimeType};base64,${base64String}`;

    return dataUrl;
  } catch (error) {
    console.error("❌ Error converting image URL to base64:", error);
    throw error;
  }
}

function getMimeTypeFromUrl(url: string): string {
  const extension = url.split(".").pop()?.toLowerCase();
  switch (extension) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "gif":
      return "image/gif";
    case "webp":
      return "image/webp";
    default:
      return "image/jpeg";
  }
}

export async function POST(req: NextRequest) {
  try {
    const {
      messages,
      chatId: clientChatId,
      imageUrl,
      isWebSearchEnabled,
    } = await req.json();

    const session = await auth();
    const userId = session?.user?.id;

    let systemPrompt = baseSystemPrompt;
    if (isWebSearchEnabled) {
      systemPrompt +=
        "\n\n- Web search is enabled. Use the 'web_search' tool to fetch real-time info.";
    }

    const coreMessages = messages.map((msg: any) => {
      if (msg.role === "tool") {
        return { role: "tool", content: JSON.parse(msg.content) };
      }

      return {
        role: msg.role,
        content: msg.content,
      };
    });

    if (imageUrl && coreMessages.length) {
      const last = coreMessages[coreMessages.length - 1];
      if (last.role === "user") {
        try {
          const base64DataUrl = await imageUrlToBase64DataUrl(imageUrl);

          last.content = [
            { type: "text", text: last.content },
            {
              type: "image",
              image: base64DataUrl,
            },
          ];
        } catch (error) {
          console.error("❌ Failed to convert image URL to base64:", error);

          last.content = [
            { type: "text", text: last.content },
            {
              type: "image",
              image: imageUrl,
            },
          ];
        }
      }
    }

    const allMessages = [
      { role: "system", content: systemPrompt },
      ...coreMessages,
    ];

    const lastMessage = messages.at(-1);
    let userMessageToSave = lastMessage?.content;

    if (Array.isArray(userMessageToSave)) {
      const textContent = userMessageToSave.find(
        (item) => item.type === "text"
      );
      userMessageToSave = textContent?.text || "";
    }

    const toolConfig = isWebSearchEnabled
      ? {
          web_search: openai.tools.webSearchPreview(),
        }
      : undefined;

    const model = isWebSearchEnabled
      ? openai.responses("gpt-4o")
      : openai("gpt-4o");

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
        data: {
          chatId: chat.id,
          role: "user",
          content: userMessageToSave,
          imageUrl,
        },
      });
    }

    const result = await streamText({
      model,
      messages: allMessages,
      tools: toolConfig ? { web_search: toolConfig.web_search } : undefined,
      maxSteps: isWebSearchEnabled ? 2 : 1,
      onFinish: async ({ text }) => {
        if (userId && chat?.id) {
          await prisma.message.create({
            data: {
              chatId: chat.id,
              role: "assistant",
              content: text,
              imageUrl: imageUrl ?? null,
            },
          });
        }
      },
    });

    const response = result.toDataStreamResponse();
    if (chat) response.headers.set("X-Chat-ID", chat.id);
    return response;
  } catch (err) {
    console.error("❌ Error in POST handler:", err);
    return NextResponse.json(
      { message: (err as any).message },
      { status: 500 }
    );
  }
}
