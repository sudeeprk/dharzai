import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import { ChatMessages } from '@/components/chat/chat-messages';
import { Sparkles } from 'lucide-react';

interface SharePageProps {
  params: {
    shareId: string;
  };
}

export default async function SharePage({ params }: SharePageProps) {
  const chat = await prisma.chat.findUnique({
    where: {
      sharePath: params.shareId,
    },
    include: {
      messages: {
        orderBy: {
          createdAt: 'asc',
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
    role: m.role as 'user' | 'assistant',
  }));

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="p-4 border-b flex justify-between items-center">
        <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Dharz AI</h1>
        </div>
        <div className="text-sm text-muted-foreground">
          Shared Chat
        </div>
      </header>
      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        <ChatMessages messages={initialMessages} />
      </main>
      <footer className="p-4 border-t text-center text-xs text-muted-foreground">
        <p>This is a shared conversation. You can start your own chat on the main site.</p>
      </footer>
    </div>
  );
}
