import { auth } from "@/auth";
import type { User } from "next-auth";
import { TopNav } from "./top-nav";
import { prisma } from "@/lib/db";
import type { Chat } from "@prisma/client";

interface AppLayoutProps {
  children: React.ReactNode;
}

export async function AppLayout({ children }: AppLayoutProps) {
  const session = await auth();
  const user = (session?.user as User & { role: 'USER' | 'ADMIN' }) | null;
  
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
    <div className="flex flex-col min-h-screen bg-background">
      <TopNav user={user} chats={chats} />
      {children}
    </div>
  );
}
