"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LogOut, Briefcase, User, Settings } from "lucide-react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [userEmail, setUserEmail] = useState<string>("");
    const [authChecked, setAuthChecked] = useState(false); // removed: mounted (redundant)

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (user) => {
            if (!user) {
                router.push("/login");
            } else {
                setUserEmail(user.email ?? "");
            }
            setAuthChecked(true); // always set, whether user exists or not
        });
        return () => unsub();
    }, [router]);

    // Prevents flash of unauthenticated content
    if (!authChecked) return null;

    const handleLogout = async () => {
        await signOut(auth);
        router.push("/login");
    };

    return (
        <div className="min-h-screen bg-gray-50 px-4">
            <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
                <h1 className="text-xl font-bold flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Job Tracker
                </h1>
                <div className="flex items-center gap-4">
                    {userEmail && ( // only render when we have a user — replaces mounted
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="gap-2">
                                    <User className="h-4 w-4" />
                                    Profile
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <div className="px-2 py-1.5 text-sm text-muted-foreground">
                                    {userEmail}
                                </div>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                    <Settings className="mr-2 h-4 w-4" />
                                    Settings
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="text-red-600 focus:text-red-600"
                                    onClick={handleLogout}
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Logout
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </header>
            <main className="w-full flex justify-center">
                <div className="w-full px-10 py-6">
                    {children}
                </div>
            </main>
        </div>
    );
}