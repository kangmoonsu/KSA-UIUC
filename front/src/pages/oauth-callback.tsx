import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from "@/context/auth-context"
import client from "@/lib/api/client"

export function OAuthCallback() {
    const navigate = useNavigate()
    const { login } = useAuth()

    useEffect(() => {
        // With Cookie-based flow, we don't get token in URL.
        // We must call /refresh to get the access token.
        const finishLogin = async () => {
            try {
                const { data } = await client.post('/auth/refresh');
                if (data.accessToken) {
                    login(data.accessToken);
                    navigate('/', { replace: true });
                    // No need to reload, state is updated
                } else {
                    throw new Error("No access token received");
                }
            } catch (error) {
                console.error('Login failed', error);
                navigate('/');
            }
        };

        finishLogin();
    }, [navigate])

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <h2 className="text-xl font-semibold mb-2">로그인 처리중...</h2>
                <p className="text-muted-foreground">잠시만 기다려주세요.</p>
            </div>
        </div>
    )
}
