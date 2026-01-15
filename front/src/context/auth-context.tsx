import { useEffect, useState, createContext, useContext } from 'react';
import { useUser, useClerk } from "@clerk/clerk-react";
import client from "@/lib/api/client"
import { setTokenFetcher } from '@/lib/auth-utils';

interface User {
    sub: string;
    role: string;
    name: string;
    nickname?: string;
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

    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const syncUser = async () => {
            if (isSignedIn && clerkUser) {
                try {
                    const res = await client.post('/auth/sync', {
                        clerkId: clerkUser.id,
                        email: clerkUser.primaryEmailAddress?.emailAddress,
                        name: clerkUser.fullName || clerkUser.username || "User",
                        profileImageUrl: clerkUser.imageUrl
                    })

                    // 서버에서 받은 실제 DB 정보를 컨텍스트에 저장
                    setUser({
                        sub: clerkUser.id,
                        name: clerkUser.fullName || clerkUser.username || "User",
                        nickname: res.data.nickname, // DB의 nickname 사용
                        profileImage: clerkUser.imageUrl,
                        role: (clerkUser.publicMetadata?.role as string) || "USER",
                        exp: 0
                    });
                } catch (error) {
                    console.error("Failed to sync user:", error);
                }
            } else {
                setUser(null);
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
