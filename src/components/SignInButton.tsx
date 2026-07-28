"use client";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
export function SignInButton() { const { data } = useSession(); return data?.user ? <Link href="/dashboard" className="rounded-md bg-forest px-4 py-2 text-sm font-semibold text-white">Open dashboard</Link> : <button onClick={() => signIn("google", { callbackUrl: "/dashboard" })} className="rounded-md bg-forest px-4 py-2 text-sm font-semibold text-white">Sign in with Google</button>; }
