import { useEffect, createContext, useContext } from 'react';
import { useUser, useClerk } from "@clerk/clerk-react";
import client from "@/lib/api/client"
import { setTokenFetcher } from '@/lib/auth-utils';

interface User {
    sub: string;
    role: string;
    name: string;
    profileImage?: string;
    exp: number;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (token: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const { user: clerkUser, isLoaded, isSignedIn } = useUser();
    const { signOut, session } = useClerk();

    // Register Clerk's getToken as the source of truth for Axios
    if (session) {
        setTokenFetcher(async () => {
            return await session.getToken();
        });
    }

    const user: User | null = isSignedIn && clerkUser ? {
        sub: clerkUser.id,
        name: clerkUser.fullName || clerkUser.username || "User",
        profileImage: clerkUser.imageUrl,
        role: (clerkUser.publicMetadata?.role as string) || "USER",
        exp: 0 // Not used in this adapter
    } : null;



    useEffect(() => {
        const syncUser = async () => {
            if (isSignedIn && clerkUser) {
                try {
                    await client.post('/auth/sync', {
                        clerkId: clerkUser.id,
                        email: clerkUser.primaryEmailAddress?.emailAddress,
                        name: clerkUser.fullName || clerkUser.username || "User",
                        profileImageUrl: clerkUser.imageUrl
                    })
                } catch (error) {
                    console.error("Failed to sync user:", error)
                }
            }
        }
        syncUser()
    }, [isSignedIn, clerkUser])

    const login = (_token: string) => {
        // Clerk handles login flow, this is a no-op for compatibility
        console.warn("AuthContext.login called but Clerk handles auth state.");
    };

    const logout = async () => {
        await signOut();
    };

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated: !!isSignedIn,
            isLoading: !isLoaded,
            login,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
