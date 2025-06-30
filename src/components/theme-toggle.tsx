'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  const toggleTheme = () => {
    const newTheme = resolvedTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  };
  
  // Render a placeholder on the server to avoid hydration mismatch.
  if (!mounted) {
    return (
        <Button variant="outline" size="icon" disabled={true}>
            <Sun className="h-[1.2rem] w-[1.2rem]"/>
        </Button>
    );
  }

  return (
    <Button variant="outline" size="icon" onClick={toggleTheme}>
        {resolvedTheme === 'dark' ? (
            <Sun className="h-[1.2rem] w-[1.2rem]" />
        ) : (
            <Moon className="h-[1.2rem] w-[1.2rem]" />
        )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
