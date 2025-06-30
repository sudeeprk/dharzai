import { auth } from '@/auth';
import type { User } from 'next-auth';
import { prisma } from '@/lib/db';
import { Sidebar } from '@/components/chat/sidebar';
import { ChatLayout } from '@/components/chat/chat-layout';
import { AppLayout } from '@/components/layout/app-layout';

export default async function Home() {
  const session = await auth();
  const user = session?.user as User | null;

  const chats = user?.id
    ? await prisma.chat.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        include: {
          messages: {
            take: 1,
            orderBy: {
              createdAt: 'asc',
            },
          },
        },
      })
    : [];

  return (
    <AppLayout>
      <main className="flex h-[calc(100vh-56px)] bg-background">
        {user && <Sidebar user={user} chats={chats} />}
        <div className="flex flex-col flex-1">
          <ChatLayout user={user} initialMessages={[]} />
        </div>
      </main>
    </AppLayout>
  );
}
