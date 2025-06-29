import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

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

    // If it's already shared, return the existing path
    if (chat.sharePath) {
      return NextResponse.json({ sharePath: chat.sharePath }, { status: 200 });
    }

    const sharePath = uuidv4();

    const updatedChat = await prisma.chat.update({
      where: { id: chatId },
      data: { sharePath: sharePath },
    });

    return NextResponse.json({ sharePath: updatedChat.sharePath }, { status: 200 });
  } catch (error) {
    console.error('Share chat error:', error);
    return NextResponse.json({ message: 'An internal error occurred' }, { status: 500 });
  }
}
