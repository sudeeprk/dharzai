import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { ChatMessages } from "@/components/chat/chat-messages";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface SharePageProps {
  params: Promise<{
    shareId: string;
  }>;
}

export default async function SharePage({ params }: SharePageProps) {
  const chat = await prisma.chat.findUnique({
    where: {
      sharePath: (await params).shareId,
    },
    include: {
      messages: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  if (!chat) {
    notFound();
  }

  const initialMessages = chat.messages.map((m) => ({
    id: m.id,
    content: m.content,
    role: m.role as "user" | "assistant",
  }));

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="p-4 border-b flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Image
            loading="lazy"
            src="/logo.png"
            width={1000}
            height={100}
            alt="Logo"
            className="h-auto w-[150px] mr-2 rounded"
          />
        </div>
        <div className="text-sm text-muted-foreground">Shared Chat</div>
      </header>
      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        <ChatMessages messages={initialMessages} />
      </main>
      <footer className="flex flex-col items-center justify-center gap-4 p-4 border-t text-center text-xs text-muted-foreground">
        <p>
          This is a shared conversation. You can start your own chat on the main
          site.
        </p>
        <Link
          href="/"
          className="underline font-medium text-blue-600 hover:text-blue-700"
        >
          Start Your Own Chat
        </Link>
      </footer>
    </div>
  );
}
