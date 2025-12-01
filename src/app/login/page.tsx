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
import { useAuth, useFirestore } from '@/firebase';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc } from 'firebase/firestore';
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
  const firestore = useFirestore();
  const router = useRouter();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const [state, formAction, isPending] = useActionState(async (prevState, formData) => {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
  
    if (!email || !password) {
      return { error: "Please fill in all fields." };
    }
  
    try {
      if (!auth) throw new Error("Auth service not available");
      await signInWithEmailAndPassword(auth, email, password);
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
  
  const handleGoogleSignIn = async () => {
    if (!auth || !firestore) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: "Firebase services are not ready.",
      });
      return;
    }
    setIsGoogleLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const userDocRef = doc(firestore, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          id: user.uid,
          email: user.email,
          fullName: user.displayName || user.email,
          registrationDate: new Date().toISOString(),
          reportCount: 0,
          lastReportDate: '',
        });
      }

      toast({ title: "Login successful!" });
      router.push('/dashboard');
    } catch (e: any) {
      console.error("Google Sign-In Error:", e);
      // Handle specific errors, like popup closed by user
      if (e.code !== 'auth/popup-closed-by-user') {
          toast({
              variant: "destructive",
              title: "Login Failed",
              description: "An error occurred during Google Sign-In.",
          });
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const isFormDisabled = isPending || isGoogleLoading;

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
          <div className="grid gap-4">
            <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isFormDisabled}>
              {isGoogleLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 
                <svg className="mr-2 h-4 w-4" viewBox="0 0 48 48" role="img" aria-hidden="true" focusable="false">
                  <path fill="#4285F4" d="M48 24.4c0-1.6-.1-3.2-.4-4.8H24v9.1h13.5c-.6 2.9-2.3 5.4-4.9 7.1v5.9h7.6c4.5-4.1 7-10.2 7-17.3z"/>
                  <path fill="#34A853" d="M24 48c6.5 0 12-2.1 16-5.7l-7.6-5.9c-2.2 1.5-5 2.3-8.4 2.3-6.5 0-12-4.4-14-10.3H2.4v6.1C6.7 43.2 14.7 48 24 48z"/>
                  <path fill="#FBBC05" d="M10 28.7c-.5-1.5-.8-3.1-.8-4.7s.3-3.2.8-4.7V13H2.4C.9 16.1 0 19.9 0 24s.9 7.9 2.4 11l7.6-6.3z"/>
                  <path fill="#EA4335" d="M24 9.8c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C36 2.2 30.5 0 24 0 14.7 0 6.7 4.8 2.4 13l7.6 6.3c2-5.9 7.5-10.3 14-10.3z"/>
                </svg>
              }
              Login with Google
            </Button>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>
            <form action={formAction} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  disabled={isFormDisabled}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" required disabled={isFormDisabled} />
              </div>
              <Button type="submit" className="w-full" disabled={isFormDisabled}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isPending ? 'Logging in...' : 'Log in'}
              </Button>
            </form>
          </div>
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
