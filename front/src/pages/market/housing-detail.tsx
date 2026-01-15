import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { MapPin, Calendar, DollarSign, ArrowLeft, MoreHorizontal, MessageCircle } from "lucide-react"
import { useChatRoom } from "@/hooks/use-chat-room"
import { Link, useParams, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { housingApi, type HousingPost } from "@/lib/api/housing-api"
import { useAuth } from "@/context/auth-context"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

export function HousingDetailPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [post, setPost] = useState<HousingPost | null>(null)
    const [loading, setLoading] = useState(true)
    const { enterChatRoom } = useChatRoom()

    useEffect(() => {
        const fetchPost = async () => {
            if (!id) return
            try {
                const data = await housingApi.getById(id)
                setPost(data)
            } catch (error) {
                console.error("Failed to fetch housing post", error)
                navigate("/market/housing")
            } finally {
                setLoading(false)
            }
        }
        fetchPost()
    }, [id, navigate])



    const handleDelete = async () => {
        if (!id || !confirm("정말 삭제하시겠습니까?")) return
        try {
            await housingApi.delete(id)
            toast.success("게시글이 삭제되었습니다.")
            navigate("/market/housing")
        } catch (error) {
            console.error("Failed to delete post", error)
            toast.error("삭제에 실패했습니다.")
        }
    }

    if (loading) return <div className="p-10 text-center">Loading...</div>
    if (!post) return <div className="p-10 text-center">Post not found</div>

    const typeMap: Record<string, string> = {
        SUBLEASE: "서브리즈",
        TAKEOVER: "양도",
        ROOMMATE: "룸메이트",
    }

    const { user } = useAuth()
    const isOwner = user?.sub === post.writerClerkId

    const statusBadgeClassMap: Record<string, string> = {
        AVAILABLE: "bg-green-100 text-green-700",
        RESERVED: "bg-yellow-100 text-yellow-700",
        SOLD: "bg-gray-100 text-gray-700",
    }

    const statusTextMap: Record<string, string> = {
        AVAILABLE: "판매중",
        RESERVED: "예약중",
        SOLD: "판매완료",
    }

    return (
        <div className="container max-w-4xl mx-auto py-10 px-4">
            <Button variant="ghost" className="mb-6 pl-0 hover:bg-transparent" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                목록으로 돌아가기
            </Button>

            <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
                <div className="p-6 md:p-8">
                    <div className="flex justify-between items-start mb-6">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-0">
                                    {typeMap[post.housingType] || post.housingType}
                                </Badge>
                                {post.status && (
                                    <Badge className={`${statusBadgeClassMap[post.status] || "bg-gray-100 text-gray-700"} border-0`}>
                                        {statusTextMap[post.status] || post.status}
                                    </Badge>
                                )}
                            </div>
                            <h1 className="text-3xl font-bold text-navy">{post.title}</h1>
                            <div className="flex items-center gap-4 text-muted-foreground">
                                <span className="flex items-center gap-1 text-sm">
                                    <Calendar className="h-4 w-4" />
                                    {new Date(post.createdAt).toLocaleDateString()}
                                </span>
                                <span className="text-sm">작성자: {post.writer}</span>
                            </div>
                        </div>

                        {isOwner && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <MoreHorizontal className="h-5 w-5" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <Link to={`/market/housing/${id}/edit`}>
                                        <DropdownMenuItem>수정하기</DropdownMenuItem>
                                    </Link>
                                    <DropdownMenuItem className="text-red-600" onClick={handleDelete}>
                                        삭제하기
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-muted/30 rounded-lg mb-8">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-sm text-primary">
                                <DollarSign className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">월세 / 가격</p>
                                <p className="font-semibold text-lg text-navy">${post.price}/mo</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-sm text-primary">
                                <MapPin className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">위치</p>
                                <p className="font-semibold text-lg text-navy">{post.location}</p>
                            </div>
                        </div>
                        {!isOwner && (
                            <div className="md:col-span-2 flex justify-end">
                                <Button
                                    className="bg-orange-600 hover:bg-orange-700 text-white w-full md:w-auto"
                                    onClick={() => enterChatRoom({ postId: post.id, category: 'HOUSING' })}
                                >
                                    <MessageCircle className="h-4 w-4 mr-2" />
                                    작성자에게 문의하기
                                </Button>
                            </div>
                        )}
                    </div>

                    {post.imageUrls && post.imageUrls.length > 0 && (
                        <div className="mb-8 p-1">
                            <h3 className="text-lg font-semibold mb-4">사진</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {post.imageUrls.map((url, index) => (
                                    <div key={index} className="aspect-square rounded-lg overflow-hidden border bg-muted">
                                        <img
                                            src={url}
                                            alt={`Post image ${index + 1}`}
                                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <Separator className="my-8" />

                    <div className="prose max-w-none">
                        <h3 className="text-xl font-semibold mb-4">상세 정보</h3>
                        <div
                            className="text-gray-700 leading-relaxed min-h-[200px]"
                            dangerouslySetInnerHTML={{ __html: post.detail || post.content }} // Fallback to content
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
