import { auth } from './firebase';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ||
    (typeof window !== 'undefined' && window.location.hostname !== 'localhost'
        ? 'https://humorous-solace-production.up.railway.app'
        : 'http://localhost:4000');

// Waits for Firebase auth to initialize and returns the token
function getToken(): Promise<string | null> {
    return new Promise((resolve) => {
        if (auth.currentUser) {
            auth.currentUser.getIdToken()
                .then(resolve)
                .catch(() => resolve(null));
            return;
        }

        // Wait up to 5 seconds for auth to initialize
        const timer = setTimeout(() => {
            unsub();
            resolve(null);
        }, 5000);

        const unsub = auth.onAuthStateChanged(async (user) => {
            clearTimeout(timer);
            unsub();
            if (!user) return resolve(null);
            try {
                resolve(await user.getIdToken());
            } catch {
                resolve(null);
            }
        });
    });
}

export async function apiFetch(path: string, options: RequestInit = {}) {
    const token = await getToken();

    const res = await fetch(`${API_BASE}${path}`, {
        ...options,
        cache: 'no-store',
        cache: 'no-store',
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        },
    });

    if (!res.ok) throw new Error('API request failed');
    return res.json();
}
