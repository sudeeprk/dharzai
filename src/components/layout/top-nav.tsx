"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  LogOut,
  User as UserIcon,
  Sparkles,
  LayoutDashboard,
  Compass,
  PanelLeft,
} from "lucide-react";
import type { User } from "next-auth";
import type { Chat } from "@prisma/client";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { MobileSidebar } from "@/components/chat/mobile-sidebar";

interface TopNavProps {
  user: (User & { role: "USER" | "ADMIN" }) | null;
  chats: (Chat & { messages: { content: string }[] })[];
}

export function TopNav({ user, chats }: TopNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { href: "/", label: "Chat", icon: Sparkles },
    { href: "/explore", label: "Explore", icon: Compass },
    ...(user?.role === "ADMIN"
      ? [{ href: "/admin", label: "Admin", icon: LayoutDashboard }]
      : []),
  ];

  const handleNavigate = (href: string) => {
    router.push(href);
  };

  const getActiveTab = () => {
    // Exact match for root
    if (pathname === "/") return "/";
    // More specific routes first
    for (const item of navItems.slice().reverse()) {
      if (item.href !== "/" && pathname.startsWith(item.href)) {
        return item.href;
      }
    }
    // Fallback to root if no other match (e.g., /chat/some-id should match '/')
    if (pathname.startsWith("/chat/")) return "/";
    return pathname;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-10">
      {user && (
        <MobileSidebar
          user={user}
          chats={chats}
          isOpen={isMobileMenuOpen}
          setIsOpen={setIsMobileMenuOpen}
        />
      )}

      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center">
          {/* Mobile Sidebar Trigger - Left */}
          <div className="flex md:hidden">
            {user && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <PanelLeft className="h-5 w-5" />
                <span className="sr-only">Open Menu</span>
              </Button>
            )}
          </div>

          {/* Centered Navigation */}
          <div className="flex-1 flex justify-center absolute left-1/2 -translate-x-1/2">
            <nav className="flex">
              <div className="flex space-x-1 rounded-full bg-background/50 p-1 backdrop-blur-sm">
                {navItems.map((item) => (
                  <Button
                    key={item.href}
                    variant={
                      getActiveTab() === item.href ? "secondary" : "ghost"
                    }
                    className="rounded-full px-2 md:px-4 py-2 h-auto text-xs md:text-sm"
                    onClick={() => handleNavigate(item.href)}
                  >
                    <item.icon className=" h-4 w-4" />
                    <span className="hidden sm:inline text-xs md:text-sm">
                      {item.label}
                    </span>
                    <span className="sm:hidden text-xs md:text-sm">
                      {item.label}
                    </span>
                  </Button>
                ))}
              </div>
            </nav>
          </div>

          {/* Right side controls */}
          {!user && (
            <div className="flex items-center gap-2">
              <div className="hidden md:flex items-center gap-2">
                <Button asChild variant="ghost">
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
