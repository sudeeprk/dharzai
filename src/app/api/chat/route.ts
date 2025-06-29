import { OpenAI } from 'openai';
import { StreamingTextResponse, OpenAIStream, StreamData } from 'ai';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { NextRequest } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const systemPrompt = `You are Dharz AI, an intuitive and friendly AI assistant. 
- You are helpful, creative, clever, and very friendly.
- You should provide informative and visually appealing responses.
- You must use markdown for all of your responses, including headings, lists, tables, and code blocks when appropriate.
- You can analyze images provided by the user.`;

export async function POST(req: NextRequest) {
  const json = await req.json();
  const { messages, chatId: clientChatId, file } = json;
  const session = await auth();
  const userId = session?.user?.id;

  const lastUserMessage = messages[messages.length - 1];

  if (file) {
    lastUserMessage.content = [
      { type: 'text', text: lastUserMessage.content },
      {
        type: 'image_url',
        image_url: { url: file },
      },
    ];
  }

  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo',
    stream: true,
    messages: [
      {
        role: 'system',
        content: systemPrompt,
      },
      ...messages,
    ],
  });

  // If the user is logged in, save the conversation.
  if (userId) {
    const userMessageToSave = Array.isArray(lastUserMessage.content)
      ? lastUserMessage.content.find(c => c.type === 'text')?.text || ''
      : lastUserMessage.content;

    const chat = await prisma.chat.upsert({
      where: { id: clientChatId || '' },
      create: { userId },
      update: {},
      select: { id: true },
    });
    
    await prisma.message.create({
      data: {
        chatId: chat.id,
        role: 'user',
        content: userMessageToSave,
      },
    });

    const data = new StreamData();
    data.append({ chatId: chat.id });

    const stream = OpenAIStream(response, {
      async onFinal(completion) {
        await prisma.message.create({
          data: {
            chatId: chat.id,
            role: 'assistant',
            content: completion,
          },
        });
        data.close();
      },
      experimental_streamData: true,
    });

    return new StreamingTextResponse(stream, {}, data);
  }

  // For unauthenticated users, just stream the response
  const stream = OpenAIStream(response);
  return new StreamingTextResponse(stream);
}
