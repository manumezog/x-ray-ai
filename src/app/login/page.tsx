'use client';

import Link from "next/link";
import { useRouter } from 'next/navigation';
import { useActionState, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/logo";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/firebase';
import { signInWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { Loader2 } from "lucide-react";

type FormState = {
  error: string | null;
}

const initialState: FormState = {
  error: null,
};

export default function LoginPage() {
  const { toast } = useToast();
  const auth = useAuth();
  const router = useRouter();

  const handleResendVerification = async (email: string) => {
      try {
          // This is a bit of a workaround. We can't get the user object directly without logging in.
          // We can't know for sure if the user exists. We'll just try to send the email.
          // A better implementation would involve a server-side function.
          // For now, we assume the user is trying to log in with an existing but unverified account.
          if(auth?.currentUser && auth.currentUser.email === email && !auth.currentUser.emailVerified){
            await sendEmailVerification(auth.currentUser);
            toast({
                title: 'Verification Email Sent',
                description: 'A new verification link has been sent to your email address.',
            });
          } else {
            toast({
              variant: "destructive",
              title: "Resend Failed",
              description: "Could not resend verification. Please try logging in again first.",
            });
          }
      } catch (error) {
          console.error("Resend Verification Error:", error);
          toast({
              variant: "destructive",
              title: "Resend Failed",
              description: "An error occurred while trying to resend the verification email.",
          });
      }
  };

  const [state, formAction, isPending] = useActionState(async (prevState, formData) => {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
  
    if (!email || !password) {
      return { error: "Please fill in all fields." };
    }
  
    try {
      if (!auth) throw new Error("Auth service not available");
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      if (!userCredential.user.emailVerified) {
        const errorMessage = 'Your email address is not verified.';
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: errorMessage,
          action: (
            <Button variant="secondary" size="sm" onClick={() => handleResendVerification(email)}>
              Resend Link
            </Button>
          ),
        });
        await auth.signOut(); // Log out the unverified user
        return { error: errorMessage };
      }

      toast({ title: 'Login successful!' });
      router.push('/dashboard');
      return { error: null };
    } catch (e: any) {
      console.error(e);
      let errorMessage = 'An unexpected error occurred.';
      if (e.code === 'auth/user-not-found' || e.code === 'auth/wrong-password' || e.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid email or password.';
      } else if (e.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      }
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: errorMessage,
      });
      return { error: errorMessage };
    }
  }, initialState);
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm mx-auto">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <Logo />
          </div>
          <CardTitle className="text-2xl font-headline">Log In</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                required
                disabled={isPending}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required disabled={isPending} />
            </div>
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isPending ? 'Logging in...' : 'Log in'}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-semibold text-primary hover:underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
