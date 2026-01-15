import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import DOMPurify from "dompurify"
import { Button } from "@/components/ui/button"
import { ArrowLeft, MapPin, User, Calendar, ExternalLink, MoreHorizontal } from "lucide-react"
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

interface FleaItem {
    id: number
    name: string
    price: number
    status: "AVAILABLE" | "RESERVED" | "SOLD"
    imageUrls: string[]
    description?: string
    productLink?: string
}

interface FleaPostDetail {
    id: number
    title: string
    content: string
    location: string
    writer: string
    writerId: number
    writerClerkId: string
    createdAt: string
    type: "BUY" | "SELL"
    items: FleaItem[]
}

export function FleaDetailPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [post, setPost] = useState<FleaPostDetail | null>(null)
    const [loading, setLoading] = useState(true)
    const { enterChatRoom } = useChatRoom()
    const { user } = useAuth()

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const res = await client.get(`/flea/${id}`)
                setPost(res.data)
            } catch (error) {
                console.error("Failed to fetch post", error)
            } finally {
                setLoading(false)
            }
        }
        if (id) fetchPost()
    }, [id])

    const [selectedImage, setSelectedImage] = useState<string | null>(null)



    const handleDelete = async () => {
        if (!id || !confirm("정말 삭제하시겠습니까?")) return
        try {
            await client.delete(`/flea/${id}`)
            toast.success("게시글이 삭제되었습니다.")
            navigate("/market/flea")
        } catch (error) {
            console.error("Failed to delete post", error)
            toast.error("삭제에 실패했습니다.")
        }
    }

    if (loading) return <div className="container py-20 text-center">로딩중...</div>
    if (!post) return <div className="container py-20 text-center">게시글을 찾을 수 없습니다</div>

    const isOwner = user?.sub === post.writerClerkId

    const sanitizeConfig = {
        ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'ul', 'ol', 'li', 'a', 'span'],
        ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'style']
    }



    return (
        <div className="container max-w-4xl mx-auto py-10 px-4">
            <div className="flex justify-between items-center mb-6">
                <Button variant="ghost" onClick={() => navigate('/market/flea')} className="-ml-4 text-muted-foreground">
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
                            <DropdownMenuItem onClick={() => navigate(`/market/flea/${id}/edit`)}>
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
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${post.type === 'SELL' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                            {post.type === 'SELL' ? '팝니다' : '삽니다'}
                        </span>
                        <h1 className="text-3xl font-bold">{post.title}</h1>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground items-center">
                        <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            {post.writer}
                        </div>
                        <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(post.createdAt).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {post.location}
                        </div>
                    </div>

                </div>

                {/* Items List */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">물품 목록</h2>
                    <div className="grid gap-6">
                        {post.items.map((item) => {
                            let statusBadgeClass = "bg-green-100 text-green-700" // Default AVAILABLE
                            let statusText = "판매중"

                            if (item.status === 'RESERVED') {
                                statusBadgeClass = "bg-yellow-100 text-yellow-700"
                                statusText = "예약중"
                            } else if (item.status === 'SOLD') {
                                statusBadgeClass = "bg-gray-100 text-gray-500"
                                statusText = "거래완료"
                            }

                            return (
                                <div key={item.id} className="flex flex-col sm:flex-row gap-6 p-6 border rounded-xl bg-card">
                                    {/* Images */}
                                    {item.imageUrls && item.imageUrls.length > 0 ? (
                                        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 sm:w-1/3 shrink-0">
                                            {item.imageUrls.map((url, idx) => (
                                                <div key={idx}
                                                    className="w-24 h-24 sm:w-32 sm:h-32 shrink-0 rounded-lg overflow-hidden border bg-muted/50 cursor-pointer hover:opacity-90 transition-opacity"
                                                    onClick={() => setSelectedImage(url.startsWith('http') ? url : url)}
                                                >
                                                    <img
                                                        src={url.startsWith('http') ? url : url}
                                                        alt={item.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="sm:w-1/3 bg-muted/20 rounded-lg flex items-center justify-center h-32 text-muted-foreground text-sm">
                                            이미지 없음
                                        </div>
                                    )}

                                    {/* Item Details */}
                                    <div className="flex-1 space-y-3">
                                        <div className="flex justify-between items-start">
                                            <h3 className="text-lg font-medium">{item.name}</h3>
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${statusBadgeClass}`}>
                                                {statusText}
                                            </span>
                                        </div>
                                        <div className="text-2xl font-bold text-navy">
                                            ${item.price}
                                        </div>
                                        {item.description && (
                                            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                                                {item.description}
                                            </p>
                                        )}
                                        {item.productLink && (
                                            <a
                                                href={item.productLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center text-sm text-blue-600 hover:underline"
                                            >
                                                <ExternalLink className="h-3 w-3 mr-1" />
                                                상품 정보
                                            </a>
                                        )}
                                        {!isOwner && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full sm:w-auto"
                                                onClick={() => enterChatRoom({ itemId: item.id, category: 'FLEA' })}
                                            >
                                                <MessageCircle className="h-4 w-4 mr-2" />
                                                이 물품 문의하기
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Rich Text Content */}
                <div className="space-y-4 pt-6 border-t">
                    <h2 className="text-xl font-semibold">상세 설명</h2>
                    <div
                        className="prose max-w-none text-gray-800 bg-white p-6 rounded-xl border min-h-[200px]"
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content, sanitizeConfig) }}
                    />
                </div>
            </div>

            {/* Lightbox Modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
                    onClick={() => setSelectedImage(null)}
                >
                    <div className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center">
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
