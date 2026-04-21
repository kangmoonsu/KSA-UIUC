import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import DOMPurify from "dompurify"
import { Button } from "@/components/ui/button"
import { ArrowLeft, MapPin, DollarSign, Phone, User, Calendar, MoreHorizontal } from "lucide-react"
import client from "@/lib/api/client"
import { useAuth } from "@/context/auth-context"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { MessageCircle } from "lucide-react"
import { useChatRoom } from "@/hooks/use-chat-room"

interface JobPostDetail {
    id: number
    title: string
    content: string
    salary: string
    location: string
    contactInfo: string
    writer: string
    writerId: number
    writerClerkId: string
    status: "HIRING" | "CLOSED"
    createdAt: string
}

export function JobDetailPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [post, setPost] = useState<JobPostDetail | null>(null)
    const [loading, setLoading] = useState(true)
    const { enterChatRoom } = useChatRoom()

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const res = await client.get(`/jobs/${id}`)
                setPost(res.data)
            } catch (error) {
                console.error("Failed to fetch post", error)
            } finally {
                setLoading(false)
            }
        }
        if (id) fetchPost()
    }, [id])

    const handleDelete = async () => {
        if (!id || !confirm("정말 삭제하시겠습니까?")) return
        try {
            await client.delete(`/jobs/${id}`)
            toast.success("게시글이 삭제되었습니다.")
            navigate("/market/job")
        } catch (error) {
            console.error("Failed to delete post", error)
            toast.error("삭제에 실패했습니다.")
        }
    }

    if (loading) return <div className="container py-20 text-center">로딩중...</div>
    if (!post) return <div className="container py-20 text-center">게시글을 찾을 수 없습니다</div>

    const { user } = useAuth()
    const isOwner = user?.sub === post.writerClerkId

    const sanitizeConfig = {
        ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'ul', 'ol', 'li', 'a', 'span'],
        ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'style']
    }



    let statusBadgeClass = "bg-blue-100 text-blue-700"
    let statusText = "구인중"

    if (post.status === 'CLOSED') {
        statusBadgeClass = "bg-gray-100 text-gray-500"
        statusText = "마감"
    }

    return (
        <div className="container max-w-4xl mx-auto py-10 px-4">
            <div className="flex justify-between items-center mb-6">
                <Button variant="ghost" onClick={() => navigate('/market/job')} className="-ml-4 text-muted-foreground">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    목록으로 돌아가기
                </Button>
                {(isOwner || (user && (user.role === 'ADMIN' || user.role === 'MASTER'))) && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-5 w-5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {isOwner && (
                                <DropdownMenuItem onClick={() => navigate(`/market/job/${id}/edit`)}>
                                    수정하기
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem className="text-red-600" onClick={handleDelete}>
                                삭제하기
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>

            <div className="space-y-8">
                {/* Header */}
                <div className="border-b pb-6">
                    <div className="flex items-center gap-2 mb-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${statusBadgeClass}`}>
                            {statusText}
                        </span>
                        <h1 className="text-3xl font-bold">{post.title}</h1>
                    </div>

                    <div className="flex flex-wrap gap-4 text-base items-center mb-6 text-muted-foreground">
                        <div
                            className={`flex items-center gap-1 ${user && (user.role === 'ADMIN' || user.role === 'MASTER') ? 'cursor-pointer hover:text-primary transition-colors font-medium' : ''}`}
                            onClick={() => {
                                if (user && (user.role === 'ADMIN' || user.role === 'MASTER')) {
                                    navigate(`/admin/users/${post.writerClerkId}`)
                                }
                            }}
                        >
                            <User className="h-4 w-4" />
                            {post.writer}
                        </div>
                        <div className="w-px h-3 bg-gray-300"></div>
                        <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(post.createdAt).toLocaleDateString()}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-muted/20 p-6 rounded-xl">
                        <div className="flex flex-col gap-2">
                            <div className="text-sm text-muted-foreground font-semibold uppercase">급여</div>
                            <div className="flex items-center gap-2 font-medium text-lg text-navy">
                                <DollarSign className="h-5 w-5 text-primary" />
                                {post.salary}
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 border-l border-muted-foreground/20 pl-4">
                            <div className="text-sm text-muted-foreground font-semibold uppercase">위치</div>
                            <div className="flex items-center gap-2 font-medium">
                                <MapPin className="h-5 w-5 text-primary" />
                                {post.location}
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 border-l border-muted-foreground/20 pl-4">
                            <div className="text-sm text-muted-foreground font-semibold uppercase">연락처</div>
                            <div className="flex items-center gap-2 font-medium">
                                <Phone className="h-5 w-5 text-primary" />
                                {post.contactInfo}
                            </div>
                        </div>
                    </div>
                    {!isOwner && (!user || user.role === 'USER') && (
                        <div className="flex justify-center mt-6">
                            <Button
                                className="bg-orange-600 hover:bg-orange-700 text-white w-full md:w-auto px-8 py-6 text-lg"
                                onClick={() => {
                                    if (user) {
                                        enterChatRoom({ postId: post.id, category: 'JOB' })
                                    } else {
                                        toast.error("로그인 후 이용해주세요")
                                    }
                                }}
                            >
                                <MessageCircle className="h-5 w-5 mr-2" />
                                문의하기
                            </Button>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="space-y-4 pt-6 border-t">
                    <h2 className="text-xl font-semibold">상세 내용</h2>
                    <div
                        className="prose max-w-none text-gray-800 bg-white p-6 rounded-xl border min-h-[200px]"
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content, sanitizeConfig) }}
                    />
                </div>
                <div className="text-right text-sm text-muted-foreground mt-4">
                    작성일: {new Date(post.createdAt).toLocaleDateString()}
                </div>
            </div>
        </div>
    )
}
