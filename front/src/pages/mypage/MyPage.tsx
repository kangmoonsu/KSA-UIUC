
import { useUser } from "@clerk/clerk-react";

export default function MyPage() {
    const { user } = useUser();

    if (!user) return <div>Please sign in.</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">My Page</h1>
            <div className="flex items-center gap-4">
                <img src={user.imageUrl} alt="Profile" className="w-16 h-16 rounded-full" />
                <div>
                    <h2 className="text-xl font-semibold">{user.fullName}</h2>
                    <p className="text-muted-foreground">{user.primaryEmailAddress?.emailAddress}</p>
                </div>
            </div>
        </div>
    )
}
