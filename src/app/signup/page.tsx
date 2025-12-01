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
import { createUserWithEmailAndPassword, signInWithRedirect, GoogleAuthProvider, getRedirectResult } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';

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


export default function SignupPage() {
  const { toast } = useToast();
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const [isSigningIn, setIsSigningIn] = useState(false); // Default to false

  useEffect(() => {
    // This effect handles the result of a redirect sign-in
    // It runs when the component mounts after a redirect from Google
    if (!auth || !firestore) return;

    setIsSigningIn(true); // Assume we might be handling a redirect
    getRedirectResult(auth)
      .then(async (result) => {
        if (result) {
          // User successfully signed in.
          const user = result.user;
          const userDocRef = doc(firestore, "users", user.uid);
          // Create or merge user data in Firestore
          const userData = {
            id: user.uid,
            email: user.email,
            fullName: user.displayName,
            registrationDate: new Date().toISOString(),
          };
          await setDoc(userDocRef, userData, { merge: true });
          toast({ title: 'Account created successfully!', description: 'You are now logged in.' });
          router.push('/dashboard');
        } else {
          // No redirect result, probably a normal page load
          setIsSigningIn(false);
        }
      })
      .catch((e: any) => {
        setIsSigningIn(false); // Stop loading on error
        console.error("Google Sign-In Error:", e);
        let description = "An unexpected error occurred during sign-up.";
        if (e.code === 'auth/popup-closed-by-user' || e.code === 'auth/cancelled-popup-request') {
            description = "The sign-up window was closed. Please try again.";
        }
        toast({
          variant: "destructive",
          title: "Google Sign-Up Failed",
          description: description,
        });
      });
  }, [auth, firestore, router, toast]);


  const handleGoogleSignIn = async () => {
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    setIsSigningIn(true); // Set loading state before redirect
    await signInWithRedirect(auth, provider);
  };

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
            <form action={formAction} className="grid gap-4">
               <div className="grid gap-2">
                  <Label htmlFor="full-name">Full Name</Label>
                  <Input id="full-name" name="full-name" placeholder="John Doe" required />
                </div>
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
                {isPending ? 'Creating account...' : 'Create an account'}
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
