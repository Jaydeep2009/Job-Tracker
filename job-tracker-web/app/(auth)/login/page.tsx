"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Force dynamic rendering to avoid prerender issues with useSearchParams
export const dynamic = 'force-dynamic';

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [extensionAuthSuccess, setExtensionAuthSuccess] = useState(false);

    // Check if this is an extension auth flow
    const extensionId = searchParams.get("ext");
    const isExtensionAuth = !!extensionId;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
            const res = await fetch(`${API_URL}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Login failed");
            }

            // If this is extension auth flow, send token to extension
            if (isExtensionAuth && extensionId) {
                try {
                    // Check if Chrome extension API is available
                    const chromeApi = (window as any).chrome;
                    if (chromeApi?.runtime?.sendMessage) {
                        chromeApi.runtime.sendMessage(
                            extensionId,
                            { type: 'AUTH_TOKEN', token: data.token },
                            (response: any) => {
                                if (response?.success) {
                                    setExtensionAuthSuccess(true);
                                    setTimeout(() => {
                                        window.close();
                                    }, 2000);
                                } else {
                                    // Extension didn't respond, fall back to normal login
                                    localStorage.setItem("authToken", data.token);
                                    localStorage.setItem("userEmail", email);
                                    setError('Extension not reachable. Logged in to web app instead.');
                                    router.push("/dashboard");
                                }
                            }
                        );
                    } else {
                        // chrome.runtime not available — fall back to normal web login
                        localStorage.setItem("authToken", data.token);
                        localStorage.setItem("userEmail", email);
                        router.push("/dashboard");
                    }
                } catch (err) {
                    console.error('Extension auth failed:', err);
                    // Fall back to normal login so user isn't stuck
                    localStorage.setItem("authToken", data.token);
                    localStorage.setItem("userEmail", email);
                    setError('Extension authentication failed. Logged in to web app instead.');
                    router.push("/dashboard");
                }
            } else {
                // Normal web login flow
                localStorage.setItem("authToken", data.token);
                localStorage.setItem("userEmail", email);
                router.push("/dashboard");
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Show success message for extension auth
    if (extensionAuthSuccess) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="text-center">✅ Authentication Successful</CardTitle>
                        <CardDescription className="text-center">
                            Your extension is now connected!
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center space-y-4">
                            <div className="p-4 bg-green-50 text-green-700 rounded-md">
                                <p className="font-medium">Extension authenticated successfully</p>
                                <p className="text-sm mt-2">This tab will close automatically...</p>
                            </div>
                            <Button
                                onClick={() => window.close()}
                                variant="outline"
                                className="w-full"
                            >
                                Close Tab
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>
                        {isExtensionAuth ? "Login to Extension" : "Login"}
                    </CardTitle>
                    <CardDescription>
                        {isExtensionAuth
                            ? "Sign in to connect your JobTracker extension"
                            : "Sign in to your job tracker account"
                        }
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {isExtensionAuth && (
                            <div className="p-3 text-sm text-blue-600 bg-blue-50 rounded-md border border-blue-200">
                                <p className="font-medium">🔗 Extension Authentication</p>
                            </div>
                        )}

                        {error && (
                            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-3 py-2 border rounded-md"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="password" className="text-sm font-medium">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-3 py-2 border rounded-md"
                                required
                            />
                        </div>

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Logging in..." : "Login"}
                        </Button>

                        {!isExtensionAuth && (
                            <p className="text-center text-sm text-gray-600">
                                Don't have an account?{" "}
                                <Link href="/register" className="text-blue-600 hover:underline">
                                    Register
                                </Link>
                            </p>
                        )}
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <Card className="w-full max-w-md">
                    <CardContent className="pt-6">
                        <div className="text-center">Loading...</div>
                    </CardContent>
                </Card>
            </div>
        }>
            <LoginForm />
        </Suspense>
    );
}
