import { auth } from '@/auth';
import { ChatLayout } from '@/components/chat/chat-layout';
import { prisma } from '@/lib/db';
import type { User } from 'next-auth';

export default async function Home() {
  const session = await auth();
  const user = session?.user as User | null;

  let chat = null;
  if (user?.id) {
    // Fetch the most recent chat to continue, or pass null to start a new one.
    chat = await prisma.chat.findFirst({
      where: {
        userId: user.id,
      },
      include: {
        messages: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  const initialMessages = chat?.messages.map(m => ({
    id: m.id,
    content: m.content,
    role: m.role as 'user' | 'assistant',
  })) || [];

  return <ChatLayout initialMessages={initialMessages} chatId={chat?.id} user={user} />;
}
