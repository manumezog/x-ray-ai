'use client';

import Link from "next/link";
import { useActionState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/logo";
import { useToast } from "@/hooks/use-toast";
import { useAuth, useFirestore } from '@/firebase';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { Loader2, CheckCircle } from 'lucide-react';

type FormState = {
  error: string | null;
  success: boolean;
}

const initialState: FormState = {
  error: null,
  success: false,
};

export default function SignupPage() {
  const { toast } = useToast();
  const auth = useAuth();
  const firestore = useFirestore();

  const [state, formAction, isPending] = useActionState(async (prevState, formData) => {
    const fullName = formData.get('full-name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
  
    if (!fullName || !email || !password) {
      return { ...prevState, error: "Please fill in all fields." };
    }
    
    if (password.length < 6) {
      const errorMessage = "Password must be at least 6 characters.";
      toast({
        variant: "destructive",
        title: "Signup Failed",
        description: errorMessage,
      });
      return { ...prevState, error: errorMessage };
    }
  
    try {
      if (!auth || !firestore) throw new Error("Firebase services not available");

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Send verification email
      await sendEmailVerification(user);
      
      const userDocRef = doc(firestore, "users", user.uid);
      const userData = {
        id: user.uid,
        email: user.email,
        fullName: fullName,
        registrationDate: new Date().toISOString(),
      };
      await setDoc(userDocRef, userData);

      toast({ title: 'Signup successful!', description: 'Please check your email to verify your account.' });
      return { error: null, success: true };
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
      return { ...prevState, error: errorMessage };
    }
  }, initialState);

  if (state.success) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <Card className="w-full max-w-sm mx-auto">
          <CardHeader className="text-center">
            <div className="mb-4 flex justify-center">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl font-headline">Verification Email Sent</CardTitle>
            <CardDescription>
              A verification link has been sent to your email address. Please check your inbox (and spam folder) to complete your registration.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Link href="/login" className="w-full">
              <Button className="w-full">
                Back to Login
              </Button>
            </Link>
          </CardFooter>
        </Card>
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
          <form action={formAction} className="grid gap-4">
             <div className="grid gap-2">
                <Label htmlFor="full-name">Full Name</Label>
                <Input id="full-name" name="full-name" placeholder="John Doe" required disabled={isPending} />
              </div>
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
              {isPending ? 'Creating account...' : 'Create an account'}
            </Button>
          </form>
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
