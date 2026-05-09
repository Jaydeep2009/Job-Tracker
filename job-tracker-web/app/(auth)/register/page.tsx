"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = 'force-dynamic';

function RegisterForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [extensionAuthSuccess, setExtensionAuthSuccess] = useState(false);
    const extensionId = searchParams.get("ext");
    const isExtensionAuth = !!extensionId;

    // removed: getRedirectResult useEffect
    // removed: localStorage

    const sendTokenToExtension = (token: string) => {
        // @ts-ignore
        chrome.runtime.sendMessage(extensionId, { type: 'AUTH_TOKEN', token }, (response: any) => {
            if (response?.success) {
                setExtensionAuthSuccess(true);
                setTimeout(() => window.close(), 2000);
            } else {
                setError('Extension authentication failed. Please try from the extension popup.');
            }
        });
    };

    const handleGoogleSignIn = async () => {
        setError("");
        setLoading(true);
        try {
            const result = await signInWithPopup(auth, new GoogleAuthProvider());
            if (isExtensionAuth && extensionId) {
                const token = await result.user.getIdToken();
                sendTokenToExtension(token);
            } else {
                router.push("/dashboard");
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setLoading(true);
        try {
            const credential = await createUserWithEmailAndPassword(auth, email, password);
            if (isExtensionAuth && extensionId) {
                const token = await credential.user.getIdToken();
                sendTokenToExtension(token);
            } else {
                router.push("/dashboard"); // Firebase session auto-persists
            }
        } catch (err: any) {
            setError(err.code === 'auth/email-already-in-use' ? 'Email already in use' : err.message);
        } finally {
            setLoading(false);
        }
    };

    if (extensionAuthSuccess) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="text-center">✅ Registration Successful</CardTitle>
                        <CardDescription className="text-center">Your extension is now connected!</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center space-y-4">
                            <div className="p-4 bg-green-50 text-green-700 rounded-md">
                                <p className="font-medium">Account created and extension authenticated</p>
                                <p className="text-sm mt-2">This tab will close automatically...</p>
                            </div>
                            <Button onClick={() => window.close()} variant="outline" className="w-full">
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
                    <CardTitle>{isExtensionAuth ? "Register for Extension" : "Register"}</CardTitle>
                    <CardDescription>
                        {isExtensionAuth
                            ? "Create an account to connect your JobTracker extension"
                            : "Create a new job tracker account"}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {isExtensionAuth && (
                            <div className="p-3 text-sm text-blue-600 bg-blue-50 rounded-md border border-blue-200">
                                <p className="font-medium">🔗 Extension Authentication</p>
                                <p className="text-xs mt-1">After registration, your extension will be automatically connected.</p>
                            </div>
                        )}
                        {error && <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">{error}</div>}
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium">Email</label>
                            <input id="email" type="email" value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-3 py-2 border rounded-md" required />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="password" className="text-sm font-medium">Password</label>
                            <input id="password" type="password" value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-3 py-2 border rounded-md" required />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</label>
                            <input id="confirmPassword" type="password" value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-3 py-2 border rounded-md" required />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Creating account..." : "Register"}
                        </Button>
                        <>
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-white px-2 text-muted-foreground">or</span>
                                </div>
                            </div>
                            <Button type="button" variant="outline" className="w-full"
                                onClick={handleGoogleSignIn} disabled={loading}>
                                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                                </svg>
                                Continue with Google
                            </Button>
                            <p className="text-center text-sm text-gray-600">
                                Already have an account?{" "}
                                <Link
                                    href={isExtensionAuth ? `/login?ext=${extensionId}` : "/login"}
                                    className="text-blue-600 hover:underline"
                                >
                                    Login
                                </Link>
                            </p>
                        </>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

export default function RegisterPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <Card className="w-full max-w-md">
                    <CardContent className="pt-6"><div className="text-center">Loading...</div></CardContent>
                </Card>
            </div>
        }>
            <RegisterForm />
        </Suspense>
    );
}