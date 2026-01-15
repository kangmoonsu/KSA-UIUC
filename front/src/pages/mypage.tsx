import React, { useEffect, useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { toast } from "sonner"
import { useAuth } from "@/context/auth-context"
import client from "@/lib/api/client"
import { ChevronLeft, ChevronRight, MessageCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface UserProfile {
    email: string
    name: string
    nickname: string
    role: string
    profileImageUrl?: string
}

interface MyPost {
    id: number
    title: string
    category: string // FLEA, JOB, HOUSING, CAR
    status: string // AVAILABLE, SOLD, etc.
    viewCount: number
    createdAt: string
    imageUrl?: string
}

export function MyPage() {
    const navigate = useNavigate()
    const { isAuthenticated, isLoading } = useAuth()
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
    const [myPosts, setMyPosts] = useState<MyPost[]>([])
    const [isProfileLoading, setIsProfileLoading] = useState(true)
    const [isPostsLoading, setIsPostsLoading] = useState(true)
    const [isChatLoading, setIsChatLoading] = useState(false)
    const [chatRooms, setChatRooms] = useState<any[]>([])

    // Pagination State
    const [currentPage, setCurrentPage] = useState(0)
    const [totalPages, setTotalPages] = useState(0)
    const [totalElements, setTotalElements] = useState(0)

    // Edit Profile State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [editNickname, setEditNickname] = useState("")
    const [isSaving, setIsSaving] = useState(false)
    const [nicknameStatus, setNicknameStatus] = useState<{
        message: string;
        isAvailable: boolean | null;
    }>({ message: "", isAvailable: null })

    // Tab State
    const [activeTab, setActiveTab] = useState<"posts" | "chat">("posts")

    const fetchPosts = useCallback(async (page: number) => {
        setIsPostsLoading(true)
        try {
            // Explicitly request 5 items per page
            const res = await client.get(`/users/me/posts?page=${page}&size=5`)

            if (res.data) {
                if (Array.isArray(res.data)) {
                    // Fallback for legacy direct list responses
                    setMyPosts(res.data)
                    setTotalElements(res.data.length)
                    setTotalPages(1)
                    setCurrentPage(0)
                } else {
                    // Standard Spring Data Page response
                    setMyPosts(res.data.content || [])
                    setTotalPages(res.data.totalPages || 0)
                    setTotalElements(res.data.totalElements || 0)
                    setCurrentPage(res.data.number || 0)
                }
            }
        } catch (err) {
            console.error("Fetch posts error:", err)
            toast.error("게시글을 불러오는데 실패했습니다.")
        } finally {
            setIsPostsLoading(false)
        }
    }, [])

    useEffect(() => {
        if (isLoading) return
        if (!isAuthenticated) {
            navigate('/', { replace: true })
            return
        }

        const fetchData = async () => {
            try {
                // Fetch Profile
                const profileRes = await client.get('/users/me')
                setUserProfile(profileRes.data)
                setEditNickname(profileRes.data.nickname)
                setIsProfileLoading(false)

                // Fetch Posts (Initial Page 0)
                await fetchPosts(0)

                // Fetch Chat Rooms
                setIsChatLoading(true)
                try {
                    const chatRes = await client.get('/chat/rooms')
                    setChatRooms(chatRes.data)
                } catch (err) {
                    console.error("Failed to fetch chat rooms", err)
                } finally {
                    setIsChatLoading(false)
                }
            } catch (err) {
                console.error(err)
                toast.error("데이터를 불러오는데 실패했습니다.")
                setIsProfileLoading(false)
                setIsPostsLoading(false)
            }
        }
        fetchData()
    }, [isAuthenticated, isLoading, navigate, fetchPosts])

    useEffect(() => {
        if (!isEditModalOpen || !editNickname || editNickname === userProfile?.nickname) {
            setNicknameStatus({ message: "", isAvailable: null })
            return
        }

        const checkNickname = async () => {
            try {
                const res = await client.get(`/users/check-nickname?nickname=${encodeURIComponent(editNickname)}`)
                const isTaken = res.data
                if (isTaken) {
                    setNicknameStatus({ message: "이미 사용 중인 닉네임입니다.", isAvailable: false })
                } else {
                    setNicknameStatus({ message: "사용 가능한 닉네임입니다.", isAvailable: true })
                }
            } catch (err) {
                console.error("Nickname check error:", err)
            }
        }

        const timer = setTimeout(checkNickname, 500) // Debounce 500ms
        return () => clearTimeout(timer)
    }, [editNickname, isEditModalOpen, userProfile?.nickname])

    const handleUpdateProfile = async () => {
        setIsSaving(true)
        try {
            await client.put('/users/me/nickname', { nickname: editNickname })
            toast.success("프로필이 수정되었습니다.")

            // Refresh local profile
            if (userProfile) {
                setUserProfile({ ...userProfile, nickname: editNickname })
            }
            setIsEditModalOpen(false)
            setNicknameStatus({ message: "", isAvailable: null })
        } catch (e: any) {
            console.error(e)
            const errorMsg = e.response?.data?.message || "수정에 실패했습니다."
            toast.error(errorMsg)
        } finally {
            setIsSaving(false)
        }
    }

    const handleDeletePost = async (e: React.MouseEvent, id: number, category: string) => {
        e.stopPropagation() // Prevent card click
        if (!confirm("정말 삭제하시겠습니까?")) return

        let apiPath = ""
        switch (category) {
            case "FLEA": apiPath = `/fleamarket/${id}`; break;
            case "JOB": apiPath = `/jobs/${id}`; break;
            case "HOUSING": apiPath = `/housing/${id}`; break;
            case "CAR": apiPath = `/cars/${id}`; break;
            default: return;
        }

        try {
            await client.delete(apiPath)
            toast.success("게시글이 삭제되었습니다.")
            // Refresh current page
            fetchPosts(currentPage)
        } catch (e) {
            console.error(e)
            toast.error("삭제에 실패했습니다.")
        }
    }

    const handleEditPost = (e: React.MouseEvent, id: number, category: string) => {
        e.stopPropagation() // Prevent card click
        switch (category) {
            case "FLEA": navigate(`/market/flea/${id}/edit`); break;
            case "JOB": navigate(`/market/job/${id}/edit`); break;
            case "HOUSING": navigate(`/market/housing/${id}/edit`); break;
            case "CAR": navigate(`/market/cars/${id}/edit`); break;
        }
    }

    const handleCardClick = (id: number, category: string) => {
        switch (category) {
            case "FLEA": navigate(`/market/flea/${id}`); break;
            case "JOB": navigate(`/market/job/${id}`); break;
            case "HOUSING": navigate(`/market/housing/${id}`); break;
            case "CAR": navigate(`/market/cars/${id}`); break;
        }
    }

    if (isLoading || isProfileLoading || !userProfile) {
        return <div className="p-8 text-center text-muted-foreground">Loading...</div>
    }

    return (
        <div className="container max-w-6xl mx-auto py-12 px-4">
            <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-10">
                {/* Sidebar */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl border p-8 text-center shadow-sm">
                        <div className="relative w-32 h-32 mx-auto mb-6">
                            <Avatar className="w-full h-full border-4 border-white shadow-md">
                                <AvatarImage src={userProfile.profileImageUrl} className="object-cover" />
                                <AvatarFallback className="text-2xl">{userProfile.name[0]}</AvatarFallback>
                            </Avatar>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">{userProfile.nickname}</h2>
                        <p className="text-sm text-slate-500 mb-6">{userProfile.email}</p>
                        <Button variant="outline" className="w-full" onClick={() => setIsEditModalOpen(true)}>
                            프로필 수정
                        </Button>
                    </div>

                    <div className="bg-white rounded-xl border overflow-hidden shadow-sm">
                        <nav className="flex flex-col">
                            <button
                                onClick={() => setActiveTab("posts")}
                                className={`px-6 py-4 text-left font-semibold border-l-4 transition-colors ${activeTab === "posts"
                                    ? "bg-slate-50 border-orange-500 text-orange-600"
                                    : "border-transparent text-slate-600 hover:bg-slate-50"
                                    }`}
                            >
                                내 활동
                            </button>
                            <button
                                onClick={() => setActiveTab("chat")}
                                className={`px-6 py-4 text-left font-semibold border-l-4 transition-colors ${activeTab === "chat"
                                    ? "bg-slate-50 border-orange-500 text-orange-600"
                                    : "border-transparent text-slate-600 hover:bg-slate-50"
                                    }`}
                            >
                                내 채팅
                            </button>
                        </nav>
                    </div>
                </div>

                {/* Main Content */}
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 mb-8">
                        {activeTab === "posts" ? "내 활동" : "내 채팅"}
                    </h1>

                    {activeTab === "posts" ? (
                        <>
                            <div className="flex justify-between items-end mb-8 border-b pb-0">
                                <div className="border-b-2 border-slate-800 pb-3 px-1 font-bold text-slate-800">
                                    내 작성 글 <span className="ml-2 bg-slate-100 text-slate-600 text-xs py-0.5 px-2 rounded-full">{totalElements}</span>
                                </div>
                                {totalPages > 1 && (
                                    <div className="pb-3 text-xs text-slate-500 font-medium">
                                        Page {currentPage + 1} of {totalPages}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                {isPostsLoading ? (
                                    <div className="text-center py-10 text-muted-foreground">로딩 중...</div>
                                ) : myPosts.length === 0 ? (
                                    <div className="text-center py-20 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-muted-foreground">
                                        작성한 게시글이 없습니다.
                                    </div>
                                ) : (
                                    <>
                                        {myPosts.map((post) => (
                                            <div
                                                key={`${post.category}-${post.id}`}
                                                className="bg-white border rounded-2xl p-6 flex flex-col sm:flex-row gap-6 hover:shadow-md transition-all cursor-pointer hover:border-orange-200 group"
                                                onClick={() => handleCardClick(post.id, post.category)}
                                            >
                                                {/* Thumbnail */}
                                                <div className="w-full sm:w-24 h-24 bg-slate-100 rounded-xl shrink-0 flex items-center justify-center overflow-hidden">
                                                    {post.imageUrl ? (
                                                        <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-slate-400 text-xs text-center p-2">No Image</span>
                                                    )}
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <CategoryBadge category={post.category} />
                                                        <StatusBadge status={post.status} />
                                                    </div>
                                                    <h3 className="text-lg font-bold text-slate-800 mb-2 truncate group-hover:text-orange-600 transition-colors">{post.title}</h3>
                                                    <div className="text-sm text-slate-500 flex items-center gap-2">
                                                        {new Date(post.createdAt).toLocaleDateString()}
                                                        <span>&bull;</span>
                                                        조회 {post.viewCount}
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex sm:flex-col gap-2 justify-center">
                                                    <Button variant="outline" size="sm" onClick={(e) => handleEditPost(e, post.id, post.category)}>
                                                        수정
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-red-500 hover:text-red-600 hover:bg-red-50 border-red-100"
                                                        onClick={(e) => handleDeletePost(e, post.id, post.category)}
                                                    >
                                                        삭제
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}

                                        {/* Pagination UI */}
                                        {totalPages > 1 && (
                                            <div className="flex items-center justify-center gap-2 mt-8">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => fetchPosts(currentPage - 1)}
                                                    disabled={currentPage === 0}
                                                >
                                                    <ChevronLeft className="w-4 h-4" />
                                                </Button>
                                                <div className="flex items-center gap-1">
                                                    {[...Array(totalPages)].map((_, i) => (
                                                        <Button
                                                            key={i}
                                                            variant={currentPage === i ? "default" : "outline"}
                                                            size="sm"
                                                            className="w-9 h-9"
                                                            onClick={() => fetchPosts(i)}
                                                        >
                                                            {i + 1}
                                                        </Button>
                                                    ))}
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => fetchPosts(currentPage + 1)}
                                                    disabled={currentPage === totalPages - 1}
                                                >
                                                    <ChevronRight className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="space-y-4">
                            {isChatLoading ? (
                                <div className="text-center py-10 text-muted-foreground">로딩 중...</div>
                            ) : chatRooms.length === 0 ? (
                                <div className="text-center py-20 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-muted-foreground">
                                    <div className="text-4xl mb-4">💬</div>
                                    <h3 className="text-lg font-semibold text-slate-700">진행 중인 채팅이 없습니다.</h3>
                                    <p className="text-sm">관심 있는 게시글에서 '문의하기'를 눌러보세요!</p>
                                </div>
                            ) : (
                                chatRooms.map((room: any) => (
                                    <div
                                        key={room.roomId}
                                        className="bg-white border rounded-2xl p-5 flex items-center gap-5 hover:shadow-md transition-all cursor-pointer hover:border-orange-200 group"
                                        onClick={() => navigate(`/chat/room/${room.roomId}`)}
                                    >
                                        <div className="w-16 h-16 bg-slate-100 rounded-full shrink-0 flex items-center justify-center overflow-hidden border">
                                            {room.thumbnail ? (
                                                <img src={room.thumbnail} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <MessageCircle className="text-slate-400 w-8 h-8" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-1">
                                                <h3 className="font-bold text-slate-800 truncate">{room.partnerName}</h3>
                                                <span className="text-[11px] text-slate-400">
                                                    {room.lastMessageAt ? new Date(room.lastMessageAt).toLocaleDateString() : ''}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-600 truncate mb-1">
                                                {room.lastMessage || '새로운 대화를 시작해보세요!'}
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded">
                                                    {room.postTitle}
                                                </span>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-orange-400" />
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Profile Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>프로필 수정</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="nickname" className="text-right">
                                닉네임
                            </Label>
                            <Input
                                id="nickname"
                                value={editNickname}
                                onChange={(e) => setEditNickname(e.target.value)}
                                className={cn(
                                    "col-span-3",
                                    nicknameStatus.isAvailable === true && "border-green-500 focus-visible:ring-green-500",
                                    nicknameStatus.isAvailable === false && "border-red-500 focus-visible:ring-red-500"
                                )}
                            />
                        </div>
                        {nicknameStatus.message && (
                            <div className="grid grid-cols-4 items-center gap-4">
                                <div className="col-start-2 col-span-3 text-xs font-medium">
                                    <p className={nicknameStatus.isAvailable ? "text-green-600" : "text-red-600"}>
                                        {nicknameStatus.message}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => {
                            setIsEditModalOpen(false)
                            setNicknameStatus({ message: "", isAvailable: null })
                        }}>취소</Button>
                        <Button
                            onClick={handleUpdateProfile}
                            disabled={isSaving || nicknameStatus.isAvailable === false || !editNickname || editNickname === userProfile?.nickname}
                        >
                            {isSaving ? "저장 중..." : "저장"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

function CategoryBadge({ category }: { category: string }) {
    const styles: Record<string, string> = {
        FLEA: "bg-emerald-50 text-emerald-700 border-emerald-100",
        JOB: "bg-pink-50 text-pink-700 border-pink-100",
        HOUSING: "bg-blue-50 text-blue-700 border-blue-100",
        CAR: "bg-orange-50 text-orange-700 border-orange-100",
        UNKNOWN: "bg-gray-50 text-gray-600"
    }

    const labels: Record<string, string> = {
        FLEA: "중고마켓",
        JOB: "구인구직",
        HOUSING: "하우징",
        CAR: "자동차",
        UNKNOWN: "기타"
    }

    const style = styles[category] || styles.UNKNOWN
    const label = labels[category] || category

    return (
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${style}`}>
            {label}
        </span>
    )
}

function StatusBadge({ status }: { status: string }) {
    if (!status || status === "AVAILABLE" || status === "HIRING" || status === "Active") return null
    return (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
            {status}
        </span>
    )
}
