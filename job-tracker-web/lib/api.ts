// API base URL from environment variable, fallback to localhost for development
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export class ApiError extends Error {
    status: number;
    constructor(message: string, status: number) {
        super(message);
        this.status = status;
        this.name = "ApiError";
    }
}

export async function apiFetch(
    path: string,
    options: RequestInit = {}
) {
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

    const res = await fetch(`${API_BASE}${path}`, {
        ...options,
        cache: 'no-store',
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        },
    });

    if (!res.ok) {
        // Try to parse server error message
        let message = "API request failed";
        try {
            const errorData = await res.json();
            message = errorData.message || errorData.error || message;
        } catch {
            // Response wasn't JSON, use default message
        }
        throw new ApiError(message, res.status);
    }

    // 204 No Content has no body (e.g. DELETE responses)
    if (res.status === 204) {
        return null;
    }

    return res.json();
}