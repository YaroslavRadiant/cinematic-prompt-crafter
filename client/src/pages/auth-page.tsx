import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/auth/AuthProvider";

export default function AuthPage() {

  const { openLogin, openSignup,  } =
    useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md p-6">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Cinematic Still Generator</h1>
          <p className="text-muted-foreground mt-2">
            Please log in with your authorized email address
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            First time login? Set your password to create your account.
          </p>
        </div>
        <div className="flex justify-between">
          <Button className="w-[160px]" onClick={openLogin}>
            Login
          </Button>
          <Button className="w-[160px]" onClick={openSignup}>
            Sign-up
          </Button>
        </div>
      </Card>
    </div>
  );
}
