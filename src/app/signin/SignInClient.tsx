"use client";
import { useSearchParams } from "next/navigation";

export default function SignInClient() {
  const params = useSearchParams();
  const next = params.get("next") ?? "";
  // TODO: replace this with your real sign-in form (use `next` if you redirect after login)
  return <div>Sign in {next ? `(next: ${next})` : ""}</div>;
}
