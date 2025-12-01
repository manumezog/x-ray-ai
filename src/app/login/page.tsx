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
    } catch (e: any) => {
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
                <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                  <path fill="#4285F4" d="M488 261.8C488 403.3 381.5 512 244 512 110 512 0 402 0 256S110 0 244 0c73 0 136 28.7 182 74.2L364 144.2c-21-21.5-49-34.4-80-34.4-68.5 0-124 55.7-124 124.2s55.5 124.2 124 124.2c76.5 0 103-56.5 106-82.5H244v-66h234c2 12.8 4 26 4 39.4z" />
                  <path fill="#34A853" d="M253 490c-32-15-58-39-78-69l-72 48c41 40 96 66 156 66 73 0 136-28.7 182-74.2l-64-51c-20 28-51 46-88 46z" />
                  <path fill="#FBBC05" d="M106 290c-5-16-5-33 0-48l-72-48c-19 39-19 85 0 124l72-28z" />
                  <path fill="#EA4335" d="M253 110c37 0 68 18 88 46l64-51C380 28.7 317 0 244 0 158 0 88 47 46 124l72 48c20-30 46-52 75-52z" />
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
