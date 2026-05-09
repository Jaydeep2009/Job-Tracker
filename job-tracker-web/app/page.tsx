"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";

export default function Home() {
    const router = useRouter();

    useEffect(() => {
        const unsub = auth.onAuthStateChanged((user) => {
            unsub();
            router.push(user ? "/dashboard" : "/login");
        });
    }, [router]);

    // Return null — no flash of content before redirect
    return null;
}