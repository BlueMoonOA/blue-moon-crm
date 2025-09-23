import { NextResponse } from "next/server";

/**
 * Dev stub for NextAuth client `getSession()` fetch.
 * Returns an empty session so the client fetch doesn’t throw in console.
 * Remove this once real NextAuth is wired up.
 */
export async function GET() {
  // shape roughly compatible with next-auth client
  return NextResponse.json({ user: null, expires: null });
}