import { auth } from "@/auth";
import type { User } from "next-auth";
import { prisma } from "@/lib/db";
import { Sidebar } from "@/components/chat/sidebar";
import { ChatLayout } from "@/components/chat/chat-layout";
import { notFound, redirect } from "next/navigation";
import { AppLayout } from "@/components/layout/app-layout";

interface ChatPageProps {
  params: Promise<{
    chatId: string;
  }>;
}

export default async function ChatPage({ params }: ChatPageProps) {
  const session = await auth();
  const user = session?.user as User | null;

  if (!user) {
    redirect(`/login?callbackUrl=/chat/${(await params).chatId}`);
  }

  const chats = await prisma.chat.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      messages: {
        select: { content: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  const currentChat = await prisma.chat.findUnique({
    where: {
      id: (await params).chatId,
      userId: user.id,
    },
    include: {
      messages: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  if (!currentChat) {
    notFound();
  }

  const initialMessages = currentChat.messages.map((m) => ({
    id: m.id,
    content: m.content,
    role: m.role as "user" | "assistant",
  }));

  return (
    <AppLayout>
      <main className="flex h-svh md:min-h-screen bg-background">
        <Sidebar
          user={user}
          chats={chats}
          activeChatId={(await params).chatId}
        />
        <div className="flex flex-col flex-1">
          <ChatLayout
            user={user}
            initialMessages={initialMessages}
            chatId={(await params).chatId}
          />
        </div>
      </main>
    </AppLayout>
  );
}
