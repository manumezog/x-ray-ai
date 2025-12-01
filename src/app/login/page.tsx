'use client';

import Link from "next/link";
import { useRouter } from 'next/navigation';
import { useActionState, useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/logo";
import { useToast } from "@/hooks/use-toast";
import { useAuth, useFirestore } from '@/firebase';
import { signInWithEmailAndPassword, signInWithRedirect, GoogleAuthProvider, getRedirectResult } from "firebase/auth";
import { Loader2 } from "lucide-react";
import { doc, setDoc } from "firebase/firestore";

type FormState = {
  error: string | null;
}

const initialState: FormState = {
  error: null,
};

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039L38.802 12.66C34.639 8.853 29.638 6.5 24 6.5C13.228 6.5 4.5 15.228 4.5 26S13.228 45.5 24 45.5c10.455 0 19.333-8.083 20-18.579V20.083z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12.5 24 12.5c3.059 0 5.842 1.154 7.961 3.039L38.802 12.66C34.639 8.853 29.638 6.5 24 6.5C16.318 6.5 9.656 10.036 6.306 14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 45.5c5.967 0 10.993-2.618 14.244-6.829l-6.6-4.823c-1.954 2.868-5.309 4.652-9.644 4.652-5.967 0-10.993-2.618-14.244-6.829l-6.6 4.823C9.007 42.882 15.993 45.5 24 45.5z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.571 4.819c3.93-3.524 6.216-8.59 6.216-14.39z"
      />
    </svg>
  );
}


export default function LoginPage() {
  const { toast } = useToast();
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const [isCheckingRedirect, setIsCheckingRedirect] = useState(true);

  useEffect(() => {
    if (!auth || !firestore) return;

    getRedirectResult(auth)
      .then(async (result) => {
        if (result) {
          // User successfully signed in via redirect.
          const user = result.user;
          const userDocRef = doc(firestore, "users", user.uid);
          const userData = {
            id: user.uid,
            email: user.email,
            fullName: user.displayName,
            registrationDate: new Date().toISOString(),
          };
          await setDoc(userDocRef, userData, { merge: true });
          toast({ title: 'Login successful!' });
          router.push('/dashboard');
          // No need to set isCheckingRedirect to false here, as we are navigating away.
        } else {
          // No redirect result, this is a normal page load.
          setIsCheckingRedirect(false);
        }
      })
      .catch((e: any) => {
        console.error("Google Sign-In Error:", e);
        let description = "An unexpected error occurred during sign-in.";
        if (e.code === 'auth/popup-closed-by-user' || e.code === 'auth/cancelled-popup-request') {
          description = "The sign-in window was closed. Please try again.";
        }
        toast({
          variant: "destructive",
          title: "Google Sign-In Failed",
          description: description,
        });
        setIsCheckingRedirect(false); // Stop loading on error
      });
  }, [auth, firestore, router, toast]);


  const handleGoogleSignIn = async () => {
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    setIsCheckingRedirect(true); // Show loader before redirecting
    await signInWithRedirect(auth, provider);
  };

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
  
  if (isCheckingRedirect) {
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
            <form action={formAction} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" required />
              </div>
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isPending ? 'Logging in...' : 'Log in'}
              </Button>
            </form>

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
            
            <Button variant="outline" onClick={handleGoogleSignIn} disabled={isPending}>
              <GoogleIcon className="mr-2 h-4 w-4" />
              Google
            </Button>
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
