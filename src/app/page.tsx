
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Car, KeyRound, Mail, UserCog, LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUser, useAuth } from "@/firebase";
import type { UserRole } from "@/lib/types";
import Logo from "@/components/logo";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useFirestore } from "@/firebase";

export default function LoginPage() {
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("password");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push("/dashboard");
    }
  }, [user, isUserLoading, router]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (!auth || !firestore) return;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (error: any) {
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const newUser = userCredential.user;
          let role: UserRole = "driver";
          if (email.startsWith("admin")) {
            role = "admin";
          } else if (email.startsWith("partner")) {
            role = "partner";
          }
          
          await setDoc(doc(firestore, "users", newUser.uid), {
            id: newUser.uid,
            email: newUser.email,
            name: newUser.email,
            phone: '',
            role: role,
          });

          router.push("/dashboard");
        } catch (createUserError: any) {
          setError(createUserError.message);
          console.error(createUserError);
        }
      } else {
        setError(error.message);
        console.error(error);
      }
    }
  };

  const handleLogout = async () => {
    if (!auth) return;
    await signOut(auth);
    router.refresh(); // Refresh the page to clear state and show login form
  };


  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4">
      <div className="absolute top-8 left-8">
        <Logo />
      </div>
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-3xl">Welcome Back</CardTitle>
          <CardDescription>
            Sign in to access your Chauffeur Pro dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10"
                />
              </div>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}

            <p className="text-xs text-muted-foreground">
              Use roles: admin@example.com, partner@example.com, driver@example.com. Password is 'password' for all.
            </p>

            <Button type="submit" className="w-full text-lg py-6" disabled={isUserLoading}>
              {isUserLoading ? 'Loading...' : 'Login'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex-col items-center gap-4">
          <p className="text-sm text-muted-foreground">
            Don't have an account? Contact support.
          </p>
           {user && !isUserLoading && (
              <Button variant="outline" onClick={handleLogout} className="w-full">
                <LogOut className="mr-2 h-4 w-4" />
                Logout from {user.email}
              </Button>
            )}
        </CardFooter>
      </Card>
    </main>
  );
}
