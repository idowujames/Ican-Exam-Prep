"use client";

import { RegisterLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { Button } from "@/components/ui/button";

export default function SignUp() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-surface p-8 shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-text-primary">Create an account</h2>
          <p className="mt-2 text-sm text-text-secondary">Sign up to start your ICAN exam preparation</p>
        </div>
        <RegisterLink>
          <Button className="w-full mt-3">Sign up with Kinde</Button>
        </RegisterLink>
      </div>
    </div>
  );
}