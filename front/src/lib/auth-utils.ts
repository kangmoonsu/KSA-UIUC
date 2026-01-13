import { jwtDecode } from "jwt-decode";

interface JwtPayload {
    exp: number;
    // Add other claims if needed
}

// Store a function that can retrieve a fresh token
let _tokenFetcher: (() => Promise<string | null>) | null = null;

// Allow the AuthProvider to register the fetcher (e.g. Clerk's getToken)
export const setTokenFetcher = (fetcher: () => Promise<string | null>) => {
    _tokenFetcher = fetcher;
};

// Async function to get the token.
// If a fetcher is registered, it calls it (which handles refresh).
export const getAccessToken = async (): Promise<string | null> => {
    if (_tokenFetcher) {
        try {
            return await _tokenFetcher();
        } catch (error) {
            console.error("Error fetching token:", error);
            return null;
        }
    }
    return null;
};

// Deprecated: No longer used for manual setting, but kept for compatibility if needed temporarily
export const setAccessToken = (_token: string | null) => {
    console.warn("setAccessToken is deprecated. Use setTokenFetcher instead.");
};

export const isUserLoggedIn = async (): Promise<boolean> => {
    const token = await getAccessToken();
    if (!token) return false;

    try {
        const decoded = jwtDecode<JwtPayload>(token);
        // Check if token is expired (exp is in seconds, Date.now() is in ms)
        if (decoded.exp * 1000 < Date.now()) {
            return false;
        }
        return true;
    } catch (error) {
        return false;
    }
};


