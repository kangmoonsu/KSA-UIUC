import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/auth-context";
import { useClerk } from "@clerk/clerk-react";
import { toast } from "sonner";

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: string[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const { user, isAuthenticated, isLoading } = useAuth();
    const { openSignIn } = useClerk();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) {
                toast.error("로그인 후 이용해주세요");
                // Open Clerk sign-in modal
                openSignIn({
                    afterSignInUrl: window.location.pathname
                });
                // Redirect back to home so they don't stay on the protected URL
                navigate("/", { replace: true });
            } else if (allowedRoles && user && !allowedRoles.includes(user.role)) {
                toast.error("접근할 수 없는 경로입니다.");
                navigate("/", { replace: true });
            }
        }
    }, [isLoading, isAuthenticated, user, allowedRoles, openSignIn, navigate]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        return null;
    }

    return <>{children}</>;
}
