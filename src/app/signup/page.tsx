'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Sparkles } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      if (res.ok) {
        const signInResult = await signIn('credentials', {
            redirect: false,
            email,
            password,
        });
        if (signInResult?.ok) {
            router.push('/');
            router.refresh();
        } else {
            toast({
                variant: 'destructive',
                title: 'Sign-in Failed',
                description: 'Could not sign you in after registration. Please log in manually.',
            });
            router.push('/login');
        }
      } else {
        const data = await res.json();
        toast({
            variant: 'destructive',
            title: 'Signup Failed',
            description: data.message || 'An error occurred.',
        });
      }
    } catch (error) {
       toast({
            variant: 'destructive',
            title: 'Error',
            description: 'An unexpected error occurred.',
       });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-primary/20">
      <Card className="w-full max-w-sm shadow-xl">
        <CardHeader className="text-center">
            <div className="flex justify-center items-center gap-2 mb-2">
                <Sparkles className="h-6 w-6 text-primary" />
                <h1 className="text-2xl font-bold">Dharz AI</h1>
            </div>
          <CardTitle className="text-2xl">Sign Up</CardTitle>
          <CardDescription>
            Create an account to start chatting.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <Link href="/login" className="underline">
              Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
