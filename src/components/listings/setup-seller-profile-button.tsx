"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";

export function SetupSellerProfileButton() {
  return (
    <Button render={<Link href="/seller/profile" />}>Set up seller profile</Button>
  );
}
