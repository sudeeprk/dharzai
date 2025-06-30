import { createOpenAI } from "@ai-sdk/openai";
import { CoreMessage, streamText, tool } from "ai";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

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
    const { messages, chatId: clientChatId, file, isWebSearchEnabled } = await req.json();
    const session = await auth();
    const userId = session?.user?.id;

    if (isWebSearchEnabled && !process.env.TAVILY_API_KEY) {
        return NextResponse.json(
          { message: "Tavily API key not configured." },
          { status: 500 }
        );
      }

    let systemPrompt = baseSystemPrompt;
    if (isWebSearchEnabled) {
      systemPrompt += `\n\n- Web search is enabled. When the user asks a question that requires up-to-date information or knowledge beyond your training data, you must use the 'searchTheWeb' tool to find relevant real-time information. Base your primary response on the information retrieved from the web search. Today's date is ${new Date().toLocaleDateString()}.`;
    }

    const coreMessages: CoreMessage[] = messages.map((msg: any): CoreMessage => {
        // The 'content' of a tool message is a stringified JSON array of tool results.
        // We need to parse it before sending it to the Vercel AI SDK.
        if (msg.role === 'tool') {
          return {
            role: 'tool',
            content: JSON.parse(msg.content),
            tool_call_id: msg.name // useChat hook puts toolCallId in the 'name' field for tool messages
          };
        }
        return msg as CoreMessage;
      }
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

    const searchTool = isWebSearchEnabled ? {
        searchTheWeb: tool({
            description:
            "Searches the web for the user's query. Use this for any questions about recent events, current affairs, or information not in your training data.",
            parameters: z.object({
                query: z.string().describe("The search query to use."),
            }),
            execute: async ({ query }) => {
                const apiKey = process.env.TAVILY_API_KEY;
                const response = await fetch('https://api.tavily.com/search', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        api_key: apiKey,
                        query,
                        max_results: 5,
                        search_depth: "basic",
                        include_raw_content: false,
                    })
                });
                
                if (!response.ok) {
                    throw new Error(`Tavily search failed with status: ${response.status}`);
                }
                
                const searchResult = await response.json();
                
                return searchResult.results.map((r: any) => ({
                    title: r.title,
                    url: r.url,
                    content: r.content,
                }));
            },
        }),
    } : undefined;


    if (!userId) {
      const result = await streamText({
        model: openai("gpt-4o"),
        messages: allMessages,
        tools: searchTool,
      });

      return result.toDataStreamResponse();
    }

    let chat;
    if (clientChatId) {
      chat = await prisma.chat.upsert({
        where: { id: clientChatId },
        create: { userId, id: clientChatId },
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
      tools: searchTool,
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
