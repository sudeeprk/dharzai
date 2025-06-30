'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  LogOut,
  User as UserIcon,
  Sparkles,
  LayoutDashboard,
  Compass,
  PanelLeft,
} from 'lucide-react';
import type { User } from 'next-auth';
import type { Chat } from '@prisma/client';
import { signOut } from 'next-auth/react';
import { useState } from 'react';
import { MobileSidebar } from '@/components/chat/mobile-sidebar';

interface TopNavProps {
  user: (User & { role: 'USER' | 'ADMIN' }) | null;
  chats: (Chat & { messages: { content: string }[] })[];
}

export function TopNav({ user, chats }: TopNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { href: '/', label: 'Chat', icon: Sparkles },
    { href: '/explore', label: 'Explore', icon: Compass },
    ...(user?.role === 'ADMIN'
      ? [{ href: '/admin', label: 'Admin', icon: LayoutDashboard }]
      : []),
  ];

  const handleNavigate = (href: string) => {
    router.push(href);
  };

  const getActiveTab = () => {
    // Exact match for root
    if (pathname === '/') return '/';
    // More specific routes first
    for (const item of navItems.slice().reverse()) {
        if (item.href !== '/' && pathname.startsWith(item.href)) {
            return item.href;
        }
    }
    // Fallback to root if no other match (e.g., /chat/some-id should match '/')
    if (pathname.startsWith('/chat/')) return '/';
    return pathname;
  }

  return (
    <>
      {user && (
        <MobileSidebar 
          user={user}
          chats={chats}
          isOpen={isMobileMenuOpen}
          setIsOpen={setIsMobileMenuOpen}
        />
      )}
      <header className="sticky top-0 z-40 w-full bg-transparent">
        <div className="container flex h-16 items-center">
            {/* Mobile Sidebar Trigger */}
            <div className="flex items-center md:hidden flex-1">
              {user && (
                  <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)}>
                      <PanelLeft />
                      <span className="sr-only">Open Menu</span>
                  </Button>
              )}
            </div>

            {/* Centered Navigation Tabs */}
            <nav className="hidden md:flex flex-1 justify-center">
                <div className="flex space-x-2 rounded-full bg-background/50 p-1.5 backdrop-blur-sm transition-opacity hover:bg-background/80">
                    {navItems.map((item) => (
                    <Button
                        key={item.href}
                        variant={getActiveTab() === item.href ? 'secondary' : 'ghost'}
                        className="rounded-full px-4 py-1.5 h-auto text-sm"
                        onClick={() => handleNavigate(item.href)}
                    >
                        <item.icon className="mr-2 h-4 w-4" />
                        {item.label}
                    </Button>
                    ))}
                </div>
            </nav>

            {/* Right side controls */}
            <div className="flex items-center gap-2 flex-1 justify-end">
                <ThemeToggle />
                {user ? (
                    <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={user.image || ''} alt={user.name || 'User'} />
                            <AvatarFallback><UserIcon /></AvatarFallback>
                        </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">{user.name}</p>
                            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                        </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/login' })}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                    </DropdownMenu>
                ) : (
                    <div className="hidden md:flex items-center gap-2">
                        <Button asChild variant="ghost"><Link href="/login">Login</Link></Button>
                        <Button asChild><Link href="/signup">Sign Up</Link></Button>
                    </div>
                )}
            </div>
        </div>

        {/* Mobile Navigation Tabs */}
        <nav className="md:hidden flex flex-1 justify-center pb-2">
            <div className="flex space-x-1 justify-center bg-background/50 p-1 backdrop-blur-sm rounded-full mx-auto max-w-min">
                {navItems.map((item) => (
                <Button
                    key={item.href}
                    variant={getActiveTab() === item.href ? 'secondary' : 'ghost'}
                    className="rounded-full px-3 py-1 h-auto text-xs"
                    onClick={() => handleNavigate(item.href)}
                >
                    <item.icon className="mr-1.5 h-3.5 w-3.5" />
                    {item.label}
                </Button>
                ))}
            </div>
        </nav>
      </header>
    </>
  );
}
