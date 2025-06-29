import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { ChatLayout } from '@/components/chat/chat-layout';
import { prisma } from '@/lib/db';
import type { User } from 'next-auth';

export default async function Home() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  // Fetch the most recent chat to continue, or pass null to start a new one.
  const chat = await prisma.chat.findFirst({
    where: {
      userId: session.user.id,
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

  const initialMessages = chat?.messages.map(m => ({
    id: m.id,
    content: m.content,
    role: m.role as 'user' | 'assistant',
  })) || [];

  return <ChatLayout initialMessages={initialMessages} chatId={chat?.id} user={session.user as User} />;
}
