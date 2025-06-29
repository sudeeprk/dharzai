import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;

    const { chatId } = await req.json();

    if (!chatId) {
      return NextResponse.json({ message: 'Chat ID is required' }, { status: 400 });
    }

    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
    });

    if (!chat || chat.userId !== userId) {
      return NextResponse.json({ message: 'Chat not found or access denied' }, { status: 404 });
    }

    // Prisma cascades delete to messages
    await prisma.chat.delete({
      where: { id: chatId },
    });

    return NextResponse.json({ message: 'Chat deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Delete chat error:', error);
    return NextResponse.json({ message: 'An internal error occurred' }, { status: 500 });
  }
}
