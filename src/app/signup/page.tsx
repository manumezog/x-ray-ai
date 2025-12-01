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
import { createUserWithEmailAndPassword, getRedirectResult, GoogleAuthProvider, signInWithRedirect } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';

type FormState = {
  error: string | null;
}

const initialState: FormState = {
  error: null,
};

export default function SignupPage() {
  const { toast } = useToast();
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    if (!auth || !firestore) return;

    setIsSigningIn(true);
    getRedirectResult(auth)
      .then(async (result) => {
        if (result) {
          const user = result.user;
          const userDocRef = doc(firestore, "users", user.uid);
          const userDoc = await getDoc(userDocRef);

          if (!userDoc.exists()) {
            const userData = {
              id: user.uid,
              email: user.email,
              fullName: user.displayName,
              registrationDate: new Date().toISOString(),
            };
            await setDoc(userDocRef, userData);
          }
          toast({ title: "Sign-up successful!" });
          router.push('/dashboard');
        }
      })
      .catch((e) => {
        console.error(e);
        toast({
          variant: "destructive",
          title: "Sign-up Failed",
          description: "An error occurred during Google Sign-In.",
        });
      })
      .finally(() => {
        setIsSigningIn(false);
      });
  }, [auth, firestore, router, toast]);

  const [state, formAction, isPending] = useActionState(async (prevState, formData) => {
    const fullName = formData.get('full-name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
  
    if (!fullName || !email || !password) {
      return { error: "Please fill in all fields." };
    }
    
    if (password.length < 6) {
      toast({
        variant: "destructive",
        title: "Signup Failed",
        description: "Password must be at least 6 characters.",
      });
      return { error: "Password must be at least 6 characters." };
    }
  
    try {
      if (!auth || !firestore) throw new Error("Firebase services not available");

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      const userDocRef = doc(firestore, "users", user.uid);
      
      const userData = {
        id: user.uid,
        email: user.email,
        fullName: fullName,
        registrationDate: new Date().toISOString(),
      };

      await setDoc(userDocRef, userData);

      toast({ title: 'Signup successful!', description: 'You are now logged in.' });
      router.push('/dashboard');
      return { error: null };
    } catch (e: any) {
      console.error("Email Signup Error:", e);
      let errorMessage = 'An unexpected error occurred.';
      if (e.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered.';
      } else if (e.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (e.code === 'auth/weak-password') {
        errorMessage = 'The password is too weak.';
      }
      toast({
        variant: "destructive",
        title: "Signup Failed",
        description: errorMessage,
      });
      return { error: errorMessage };
    }
  }, initialState);

  const handleGoogleSignIn = async () => {
    if (!auth) return;
    setIsSigningIn(true);
    const provider = new GoogleAuthProvider();
    await signInWithRedirect(auth, provider);
  };

  const isFormDisabled = isPending || isSigningIn;

  if (isSigningIn) {
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
          <CardTitle className="text-2xl font-headline">Sign Up</CardTitle>
          <CardDescription>
            Enter your information to create an account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
             <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isFormDisabled}>
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 381.5 512 244 512 111.8 512 0 400.2 0 261.8S111.8 11.6 244 11.6C308.3 11.6 358.9 36.2 397.4 72.9L333.1 137.2c-20.9-19.9-50.2-32.2-89.1-32.2-69.5 0-126.3 56.8-126.3 126.3s56.8 126.3 126.3 126.3c82.2 0 112.2-61.9 115.6-94.1H244v-75.5h236.4c2.8 12.9 4.1 27.4 4.1 43.1z"></path></svg>}
                Sign up with Google
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
                  <Label htmlFor="full-name">Full Name</Label>
                  <Input id="full-name" name="full-name" placeholder="John Doe" required disabled={isFormDisabled} />
                </div>
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
                {isPending ? 'Creating account...' : 'Create an account'}
              </Button>
            </form>
          </div>
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-primary hover:underline">
              Log in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
