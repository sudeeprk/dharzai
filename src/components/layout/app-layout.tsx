import { auth } from "@/auth";
import type { User } from "next-auth";
import { Header } from "./header";

interface AppLayoutProps {
  children: React.ReactNode;
}

export async function AppLayout({ children }: AppLayoutProps) {
  const session = await auth();
  const user = session?.user as User | null;

  return (
    <div className="flex flex-col min-h-screen">
      <Header user={user} />
      {children}
    </div>
  );
}
