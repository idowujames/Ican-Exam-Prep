"use client";

import { LoginLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { Button } from "@/components/ui/button";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LogIn() {
  const { isAuthenticated, isLoading } = useKindeBrowserClient();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-surface p-8 shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-text-primary">Welcome back</h2>
          <p className="mt-2 text-sm text-text-secondary">Log in to continue your ICAN exam preparation</p>
        </div>
        <LoginLink>
          <Button className="w-full mt-3">Log in with Kinde</Button>
        </LoginLink>
      </div>
    </div>
  );
}