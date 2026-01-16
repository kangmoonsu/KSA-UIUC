import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import client from "@/lib/api/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAuth } from "@/context/auth-context"
import { toast } from "sonner"
import { ArrowLeft } from "lucide-react"

interface UserActionLog {
    actionType: string;
    description: string;
    actorName: string;
    createdAt: string;
}

interface UserDetailResponse {
    clerkId: string;
    email: string;
    name: string;
    nickname: string;
    role: string;
    banned: boolean;
    banReason?: string;
    banExpiresAt?: string;
    profileImageUrl?: string;
    posts: any[];
    logs: UserActionLog[];
}

export function UserDetailPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { user: currentUser, isAuthenticated, isLoading: authLoading } = useAuth()
    const [user, setUser] = useState<UserDetailResponse | null>(null)
    const [banReason, setBanReason] = useState("")
    const [banUntil, setBanUntil] = useState("")
    const [isPermanent, setIsPermanent] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    const fetchUserDetail = async () => {
        if (!id || !isAuthenticated) return
        setIsLoading(true)
        try {
            const res = await client.get(`/users/admin/users/${id}`)
            setUser(res.data)
        } catch (err) {
            console.error("Failed to fetch user details", err)
            toast.error("Failed to load user details")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (!authLoading) {
            if (isAuthenticated) {
                fetchUserDetail()
            } else {
                setIsLoading(false)
            }
        }
    }, [id, authLoading, isAuthenticated])

    const handleBan = async () => {
        if (!id || !banReason) return

        // If not permanent, must have a date. If permanent, date is null.
        if (!isPermanent && !banUntil) {
            toast.error("Please select a ban end date or set to permanent")
            return
        }

        try {
            await client.post(`/users/admin/users/${id}/ban`, {
                reason: banReason,
                expiresAt: isPermanent ? null : `${banUntil}T23:59:59`
            })
            toast.success("User banned successfully")
            setBanReason("")
            setBanUntil("")
            setIsPermanent(false)
            fetchUserDetail()
        } catch (err) {
            toast.error("Failed to ban user")
        }
    }

    const handleUnban = async () => {
        if (!id) return
        try {
            await client.post(`/users/admin/users/${id}/unban`)
            toast.success("User unbanned successfully")
            fetchUserDetail()
        } catch (err) {
            toast.error("Failed to unban user")
        }
    }

    const handlePromote = async () => {
        if (!id) return
        try {
            await client.post(`/users/admin/users/${id}/promote`)
            toast.success("User promoted to ADMIN")
            fetchUserDetail()
        } catch (err) {
            toast.error("Failed to promote user")
        }
    }

    const handleDemote = async () => {
        if (!id) return
        try {
            await client.post(`/users/admin/users/${id}/demote`)
            toast.success("Admin demoted to USER")
            fetchUserDetail()
        } catch (err) {
            toast.error("Failed to demote user")
        }
    }

    const handleDeletePost = async (postId: number, category: string) => {
        if (!confirm("정말 이 게시글을 삭제하시겠습니까?")) return
        try {
            const endpoint = category === 'FLEA' ? `/flea/${postId}` :
                category === 'CAR' ? `/cars/${postId}` :
                    category === 'HOUSING' ? `/housings/${postId}` :
                        category === 'JOB' ? `/jobs/${postId}` : null;

            if (!endpoint) return;

            await client.delete(endpoint)
            toast.success("게시글이 삭제되었습니다.")
            fetchUserDetail() // Refresh list
        } catch (err) {
            toast.error("삭제에 실패했습니다.")
        }
    }

    if (authLoading || (isLoading && !user)) return <div className="p-20 text-center">Loading...</div>

    if (!isAuthenticated || (currentUser && currentUser.role === 'USER')) {
        return <div className="p-20 text-center">Access Denied. You must be an administrator to view this page.</div>
    }

    if (!user) return <div className="p-20 text-center">User not found</div>

    return (
        <div className="container mx-auto py-10 px-4 max-w-4xl">
            <div className="mb-6">
                <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    뒤로가기
                </Button>
            </div>
            <div className="grid gap-6">
                {/* User Header Info */}
                <Card>
                    <CardHeader className="flex flex-row items-center gap-4">
                        <Avatar className="h-16 w-16">
                            <AvatarImage src={user.profileImageUrl} />
                            <AvatarFallback>{user.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <CardTitle className="text-2xl">{user.nickname || user.name}</CardTitle>
                            <CardDescription>{user.email} • {user.clerkId}</CardDescription>
                        </div>
                        <div className="flex flex-col gap-2 items-end">
                            <Badge variant={user.role === 'MASTER' ? "default" : user.role === 'ADMIN' ? "secondary" : "outline"}>
                                {user.role}
                            </Badge>
                            {user.banned ? (
                                <Badge variant="destructive">BANNED</Badge>
                            ) : (
                                <Badge variant="outline" className="text-green-600 border-green-200">ACTIVE</Badge>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="border-t pt-6">
                        <div className="flex flex-wrap gap-4">
                            {user.banned ? (
                                <div className="flex-1 flex flex-col gap-2">
                                    <div className="flex gap-2">
                                        <Input
                                            value={`Reason: ${user.banReason || "None"}`}
                                            readOnly
                                            className="bg-muted flex-1"
                                        />
                                        <Button variant="outline" onClick={handleUnban}>Unban User</Button>
                                    </div>
                                    <div className="text-sm text-destructive font-medium">
                                        Ban Expires: {user.banExpiresAt ? new Date(user.banExpiresAt).toLocaleString() : "Permanent"}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col gap-4">
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Enter ban reason..."
                                            value={banReason}
                                            onChange={(e) => setBanReason(e.target.value)}
                                            className="flex-1"
                                        />
                                        <Button
                                            variant="destructive"
                                            onClick={handleBan}
                                            disabled={!banReason || (!isPermanent && !banUntil)}
                                        >
                                            Ban User
                                        </Button>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium">Ban Until:</span>
                                            <Input
                                                type="date"
                                                value={banUntil}
                                                onChange={(e) => {
                                                    setBanUntil(e.target.value)
                                                    setIsPermanent(false)
                                                }}
                                                disabled={isPermanent}
                                                className="w-40"
                                            />
                                        </div>
                                        <Button
                                            type="button"
                                            variant={isPermanent ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => {
                                                setIsPermanent(!isPermanent)
                                                if (!isPermanent) setBanUntil("")
                                            }}
                                            className={isPermanent ? "bg-red-600 hover:bg-red-700 text-white" : ""}
                                        >
                                            {isPermanent ? "✓ Permanent Ban" : "Set Permanent"}
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* MASTER Actions */}
                            {currentUser?.role === 'MASTER' && (
                                <>
                                    {user.role === 'USER' && (
                                        <Button onClick={handlePromote}>Promote to ADMIN</Button>
                                    )}
                                    {user.role === 'ADMIN' && (
                                        <Button variant="outline" onClick={handleDemote}>Demote to USER</Button>
                                    )}
                                </>
                            )}

                            {/* ADMIN Actions */}
                            {currentUser?.role === 'ADMIN' && user.role === 'USER' && (
                                <Button onClick={handlePromote}>Promote to ADMIN</Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* User's Posts */}
                <Card>
                    <CardHeader>
                        <CardTitle>User Posts ({user.posts.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {user.posts.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center py-10 text-muted-foreground">
                                            No posts found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    user.posts.map((post: any) => (
                                        <TableRow key={post.id}>
                                            <TableCell className="font-medium">{post.title}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{post.category || 'General'}</Badge>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-sm">
                                                {new Date(post.createdAt).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    onClick={() => handleDeletePost(post.id, post.category)}
                                                >
                                                    Delete
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Activity Logs */}
                <Card>
                    <CardHeader>
                        <CardTitle>Activity History</CardTitle>
                        <CardDescription>Administrative actions taken on this user.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Action</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>By</TableHead>
                                    <TableHead className="text-right">Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {user.logs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                                            No history found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    user.logs.map((log: UserActionLog, index: number) => (
                                        <TableRow key={index}>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        log.actionType === 'BAN' || log.actionType === 'DELETE_POST' ? 'destructive' :
                                                            log.actionType === 'PROMOTE' ? 'default' :
                                                                log.actionType === 'DEMOTE' ? 'secondary' :
                                                                    'outline'
                                                    }
                                                >
                                                    {log.actionType}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-sm font-medium">
                                                {log.description}
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {log.actorName}
                                            </TableCell>
                                            <TableCell className="text-right text-sm text-muted-foreground">
                                                {new Date(log.createdAt).toLocaleString()}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
