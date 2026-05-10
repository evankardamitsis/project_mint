"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

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
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <Card size="sm" className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Log in</CardTitle>
        <CardDescription>Access your buyer or seller workspace.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {searchParams.get("error") === "auth" ? (
          <p className="text-sm text-destructive">
            Something went wrong while signing you in. Please try again.
          </p>
        ) : null}
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-center text-xs text-muted-foreground sm:text-left">
          No account?{" "}
          <Link className="font-medium text-foreground underline-offset-4 hover:underline" href="/auth/register">
            Register
          </Link>
        </p>
        <Button
          className="w-full sm:w-auto"
          disabled={pending}
          onClick={async () => {
            setPending(true);
            setError(null);
            const supabase = createClient();
            const { error: signError } = await supabase.auth.signInWithPassword({
              email,
              password,
            });
            if (signError) {
              setError(signError.message);
              setPending(false);
              return;
            }
            router.refresh();
            router.push(next);
            setPending(false);
          }}
        >
          Continue
        </Button>
      </CardFooter>
    </Card>
  );
}
