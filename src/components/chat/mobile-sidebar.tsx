"use client";

import { Sheet, SheetContent, SheetHeader } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { LogOut, MessageSquare, Plus, Sparkles, Trash2 } from "lucide-react";
import type { User } from "next-auth";
import type { Chat } from "@prisma/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePathname, useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { signOut } from "next-auth/react";
import { UserIcon } from "lucide-react";

interface MobileSidebarProps {
  user: User;
  chats: (Chat & { messages: { content: string }[] })[];
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export function MobileSidebar({
  chats,
  isOpen,
  setIsOpen,
  user,
}: MobileSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const activeChatId = pathname.includes("/chat/")
    ? pathname.split("/").pop()
    : null;

  const handleDelete = async (chatId: string) => {
    try {
      await fetch("/api/chat/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatId }),
      });
      router.refresh();
      if (activeChatId === chatId) {
        router.push("/");
      }
    } catch (error) {
      console.error("Failed to delete chat", error);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent side="left" className="p-0 w-64">
        <div className="flex flex-col h-full">
          <SheetHeader className="p-4 border-b">
            <Link
              href="/"
              className="flex items-center gap-2"
              onClick={() => setIsOpen(false)}
            >
              <Image
                src="/logo.png"
                alt="Dharz AI"
                width={1000}
                height={100}
                className="h-auto w-[150px] mr-2 rounded"
              />
            </Link>
          </SheetHeader>
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-2">
              <Button
                asChild
                className="w-full"
                onClick={() => setIsOpen(false)}
              >
                <Link href="/">
                  <Plus className="mr-2 h-4 w-4" />
                  New Chat
                </Link>
              </Button>
            </div>
            <ScrollArea className="flex-1 px-2">
              <div className="space-y-1">
                {chats.map((chat) => (
                  <div key={chat.id} className="relative group">
                    <Button
                      asChild
                      variant={activeChatId === chat.id ? "secondary" : "ghost"}
                      className="w-full justify-start pr-8"
                      onClick={() => setIsOpen(false)}
                    >
                      <Link href={`/chat/${chat.id}`} className="truncate">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        {chat.messages[0]?.content.substring(0, 25) ||
                          "New Chat"}
                      </Link>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete your chat history.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(chat.id)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
          <div className="p-2 border-t">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-start p-2 h-auto"
                  >
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={user.image || ""}
                          alt={user.name || "User"}
                        />
                        <AvatarFallback>
                          <UserIcon />
                        </AvatarFallback>
                      </Avatar>
                      {isOpen && (
                        <div className="flex flex-col items-start text-left truncate">
                          <span className="text-sm font-medium ">
                            {user.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {user.email}
                          </span>
                        </div>
                      )}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-56 mb-2"
                  align="start"
                  side="right"
                >
                  <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => signOut({ callbackUrl: "/login" })}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className={cn("flex gap-2", isOpen && "flex-col")}>
                <Button asChild variant="ghost" className="flex-1">
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild className="flex-1">
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
