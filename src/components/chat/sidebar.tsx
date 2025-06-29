'use client';

import { signOut } from 'next-auth/react';
import type { User } from 'next-auth';
import type { Chat } from '@prisma/client';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import {
  LogOut,
  User as UserIcon,
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Sparkles,
} from 'lucide-react';
import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '../theme-toggle';

interface SidebarProps {
  user: User | null;
  chats: (Chat & { messages: { content: string }[] })[];
  activeChatId?: string;
}

export function Sidebar({ user, chats, activeChatId }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div
      className={cn(
        'hidden md:flex flex-col bg-secondary/50 border-r transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="p-2 flex items-center justify-between">
        {!isCollapsed && (
            <Link href="/" className="flex items-center gap-2 p-2">
                <Sparkles className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-bold">Dharz AI</h1>
            </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-9 w-9"
        >
          {isCollapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
        </Button>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-2">
          <Button asChild className={cn('w-full', isCollapsed && 'justify-center')}>
            <Link href="/">
              <Plus className="mr-2 h-4 w-4" />
              {!isCollapsed && 'New Chat'}
            </Link>
          </Button>
        </div>
        <ScrollArea className="flex-1 px-2">
          <div className="space-y-1">
            {chats.map(chat => (
              <Button
                key={chat.id}
                asChild
                variant={activeChatId === chat.id ? 'secondary' : 'ghost'}
                className={cn('w-full justify-start', isCollapsed && 'justify-center')}
              >
                <Link href={`/chat/${chat.id}`} className="truncate">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  {!isCollapsed && (chat.messages[0]?.content.substring(0, 20) || 'New Chat')}
                </Link>
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>

      <div className="p-2 border-t">
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start p-2 h-auto">
                <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={user.image || ''} alt={user.name || 'User'} />
                        <AvatarFallback>
                        <UserIcon />
                        </AvatarFallback>
                    </Avatar>
                    {!isCollapsed && (
                        <div className="flex flex-col items-start text-left truncate">
                            <span className="text-sm font-medium">{user.name}</span>
                            <span className="text-xs text-muted-foreground">{user.email}</span>
                        </div>
                    )}
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 mb-2" align="start" side="right">
              <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/login' })}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className={cn("flex gap-2", isCollapsed && "flex-col")}>
            <Button asChild variant="ghost" className="flex-1">
                <Link href="/login">Login</Link>
            </Button>
            <Button asChild className="flex-1">
                <Link href="/signup">Sign Up</Link>
            </Button>
          </div>
        )}
        <div className={cn("mt-2", isCollapsed && 'flex justify-center')}>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
