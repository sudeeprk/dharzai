import { OpenAI } from 'openai';
import { StreamingTextResponse, OpenAIStream, StreamData } from 'ai';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { NextRequest } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  const json = await req.json();
  const { messages, chatId: clientChatId } = json;
  const session = await auth();

  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 });
  }
  const userId = session.user.id;
  const userMessage = messages[messages.length - 1];

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
      content: userMessage.content,
    },
  });

  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo',
    stream: true,
    messages,
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
