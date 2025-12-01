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
      
      // Ensure user document exists
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

  if (isGoogleLoading) { // Show full-screen loader during Google sign-in
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg text-muted-foreground">Signing in...</p>
      </div>
    );
  }

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
                <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="#4885ed" d="M488 261.8C488 403.3 381.5 512 244 512 109.8 512 0 402.2 0 256S109.8 0 244 0c73 0 135.7 28.7 181.8 74.2L359.3 144.2c-20.7-21.5-48.4-34.4-80.3-34.4-68.5 0-124.2 55.7-124.2 124.2s55.7 124.2 124.2 124.2c76.3 0 102.7-56.4 105.7-82.4H244v-66h233.8c1.3 12.8 2.2 26.1 2.2 39.4z"></path><path fill="#EA4335" d="M488 261.8C488 403.3 381.5 512 244 512 109.8 512 0 402.2 0 256S109.8 0 244 0c73 0 135.7 28.7 181.8 74.2L359.3 144.2c-20.7-21.5-48.4-34.4-80.3-34.4-68.5 0-124.2 55.7-124.2 124.2s55.7 124.2 124.2 124.2c76.3 0 102.7-56.4 105.7-82.4H244v-66h233.8c1.3 12.8 2.2 26.1 2.2 39.4z"></path><path fill="#FBBC05" d="M488 261.8C488 403.3 381.5 512 244 512 109.8 512 0 402.2 0 256S109.8 0 244 0c73 0 135.7 28.7 181.8 74.2L359.3 144.2c-20.7-21.5-48.4-34.4-80.3-34.4-68.5 0-124.2 55.7-124.2 124.2s55.7 124.2 124.2 124.2c76.3 0 102.7-56.4 105.7-82.4H244v-66h233.8c1.3 12.8 2.2 26.1 2.2 39.4z"></path><path fill="#34A853" d="M488 261.8C488 403.3 381.5 512 244 512 109.8 512 0 402.2 0 256S109.8 0 244 0c73 0 135.7 28.7 181.8 74.2L359.3 144.2c-20.7-21.5-48.4-34.4-80.3-34.4-68.5 0-124.2 55.7-124.2 124.2s55.7 124.2 124.2 124.2c76.3 0 102.7-56.4 105.7-82.4H244v-66h233.8c1.3 12.8 2.2 26.1 2.2 39.4z"></path></svg>
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
