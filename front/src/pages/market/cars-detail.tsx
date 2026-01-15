import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import DOMPurify from "dompurify"
import { Button } from "@/components/ui/button"
import { ArrowLeft, User, Calendar, Gauge, Car } from "lucide-react"
import client from "@/lib/api/client"
import { useAuth } from "@/context/auth-context"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"
import { toast } from "sonner"
import { MessageCircle } from "lucide-react"
import { useChatRoom } from "@/hooks/use-chat-room"

interface CarPostDetail {
    id: number
    title: string
    content: string
    price: number
    year: number
    mileage: number
    modelName: string
    writer: string
    writerId: number
    writerClerkId: string
    status: "AVAILABLE" | "RESERVED" | "SOLD"
    imageUrls: string[]
    createdAt: string
}

export function CarsDetailPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [post, setPost] = useState<CarPostDetail | null>(null)
    const [loading, setLoading] = useState(true)
    const { enterChatRoom } = useChatRoom()

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const res = await client.get(`/cars/${id}`)
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
            await client.delete(`/cars/${id}`)
            toast.success("게시글이 삭제되었습니다.")
            navigate("/market/cars")
        } catch (error) {
            console.error("Failed to delete post", error)
            toast.error("삭제에 실패했습니다.")
        }
    }

    const [selectedImage, setSelectedImage] = useState<string | null>(null)

    if (loading) return <div className="container py-20 text-center">로딩중...</div>
    if (!post) return <div className="container py-20 text-center">게시글을 찾을 수 없습니다</div>

    const sanitizeConfig = {
        ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'ul', 'ol', 'li', 'a', 'span'],
        ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'style']
    }

    const { user } = useAuth()
    const isOwner = user?.sub === post.writerClerkId

    let statusBadgeClass = "bg-green-100 text-green-700"
    let statusText = "판매중"

    if (post.status === 'RESERVED') {
        statusBadgeClass = "bg-yellow-100 text-yellow-700"
        statusText = "예약중"
    } else if (post.status === 'SOLD') {
        statusBadgeClass = "bg-gray-100 text-gray-500"
        statusText = "거래완료"
    }

    return (
        <div className="container max-w-4xl mx-auto py-10 px-4">
            <div className="flex justify-between items-center mb-6">
                <Button variant="ghost" onClick={() => navigate('/market/cars')} className="-ml-4 text-muted-foreground">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    목록으로 돌아가기
                </Button>
                {isOwner && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-5 w-5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/market/cars/${id}/edit`)}>
                                수정하기
                            </DropdownMenuItem>
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

                    <div className="flex flex-wrap gap-6 text-base items-center mb-6">
                        <div className="font-bold text-3xl text-navy">
                            ${post.price.toLocaleString()}
                        </div>
                        {!isOwner && (
                            <Button
                                className="bg-orange-600 hover:bg-orange-700 text-white"
                                onClick={() => enterChatRoom({ postId: post.id, category: 'CAR' })}
                            >
                                <MessageCircle className="h-4 w-4 mr-2" />
                                판매자에게 문의하기
                            </Button>
                        )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-muted/20 p-4 rounded-xl">
                        <div className="flex flex-col items-center justify-center p-2">
                            <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">연식</span>
                            <div className="flex items-center gap-2 font-medium">
                                <Calendar className="h-4 w-4 text-primary" />
                                {post.year}
                            </div>
                        </div>
                        <div className="flex flex-col items-center justify-center p-2 border-l border-muted-foreground/20">
                            <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">주행거리</span>
                            <div className="flex items-center gap-2 font-medium">
                                <Gauge className="h-4 w-4 text-primary" />
                                {post.mileage.toLocaleString()} mi
                            </div>
                        </div>
                        <div className="flex flex-col items-center justify-center p-2 border-l border-muted-foreground/20">
                            <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">모델</span>
                            <div className="flex items-center gap-2 font-medium">
                                <Car className="h-4 w-4 text-primary" />
                                {post.modelName}
                            </div>
                        </div>
                        <div className="flex flex-col items-center justify-center p-2 border-l border-muted-foreground/20">
                            <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">작성자</span>
                            <div className="flex items-center gap-2 font-medium">
                                <User className="h-4 w-4 text-primary" />
                                {post.writer}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Images */}
                {post.imageUrls && post.imageUrls.length > 0 && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold">차량 사진</h2>
                        <div className="flex gap-4 overflow-x-auto pb-4">
                            {post.imageUrls.map((url, idx) => (
                                <div key={idx}
                                    className="w-64 h-48 shrink-0 rounded-xl overflow-hidden border bg-muted/50 cursor-pointer hover:opacity-90 transition-opacity shadow-sm"
                                    onClick={() => setSelectedImage(url.startsWith('http') ? url : url)}
                                >
                                    <img
                                        src={url.startsWith('http') ? url : url}
                                        alt={`Car ${idx + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Rich Text Content */}
                <div className="space-y-4 pt-6 border-t">
                    <h2 className="text-xl font-semibold">상세 설명</h2>
                    <div
                        className="prose max-w-none text-gray-800 bg-white p-6 rounded-xl border min-h-[200px]"
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content, sanitizeConfig) }}
                    />
                </div>

                <div className="text-right text-sm text-muted-foreground">
                    작성일: {new Date(post.createdAt).toLocaleDateString()}
                </div>
            </div>

            {/* Lightbox Modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
                    onClick={() => setSelectedImage(null)}
                >
                    <div className="relative max-w-5xl max-h-[90vh] w-full h-full flex items-center justify-center">
                        <img
                            src={selectedImage}
                            alt="Full size"
                            className="max-w-full max-h-full object-contain"
                        />
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                setSelectedImage(null)
                            }}
                            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
