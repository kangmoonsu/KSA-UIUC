import { useParams, useNavigate } from "react-router-dom"
import DOMPurify from "dompurify"
import { Button } from "@/components/ui/button"
import { ArrowLeft, MapPin, Calendar, MoreHorizontal } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { useConsultingPost, useDeleteConsultingPost } from "@/lib/api/consulting"
import { format } from "date-fns"

export function ConsultingDetailPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { data: post, isLoading, error } = useConsultingPost(id!)
    const { mutate: deletePost } = useDeleteConsultingPost()
    const { user } = useAuth()

    if (isLoading) return <div className="container py-20 text-center">로딩중...</div>
    if (error || !post) return <div className="container py-20 text-center">게시글을 찾을 수 없습니다</div>

    const isOwner = user?.sub === post.writerClerkId
    const canManage = isOwner || (user && (user.role === 'ADMIN' || user.role === 'MASTER'))

    const handleDelete = () => {
        if (!confirm("정말 삭제하시겠습니까?")) return
        deletePost(id!, {
            onSuccess: () => {
                toast.success("게시글이 삭제되었습니다.")
                navigate("/job/consulting")
            },
            onError: () => {
                toast.error("삭제에 실패했습니다.")
            }
        })
    }

    const sanitizeConfig = {
        ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'ul', 'ol', 'li', 'a', 'span', 'img'],
        ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'style', 'src', 'alt', 'width', 'height']
    }

    return (
        <div className="container max-w-4xl mx-auto py-10 px-4">
            <div className="flex justify-between items-center mb-6">
                <Button variant="ghost" onClick={() => navigate('/job/consulting')} className="-ml-4 text-muted-foreground">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    목록으로 돌아가기
                </Button>
                {canManage && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-5 w-5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/job/consulting/${id}/edit`)}>
                                수정하기
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600" onClick={handleDelete}>
                                삭제하기
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>

            <div className="space-y-6">
                <div className="border-b pb-6">
                    <h1 className="text-3xl font-bold mb-4">{post.title}</h1>

                    <div className="flex flex-col md:flex-row gap-4 md:gap-8 text-base text-gray-600 bg-muted/20 p-6 rounded-xl border">
                        {post.eventDate && (
                            <div className="flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-primary" />
                                <span className="font-medium text-navy">
                                    {format(new Date(post.eventDate), 'yyyy.MM.dd (EEE) HH:mm')}
                                </span>
                            </div>
                        )}
                        {post.location && (
                            <div className="flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-primary" />
                                <span>{post.location}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="prose max-w-none text-gray-800 min-h-[300px]"
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content, sanitizeConfig) }}
                />

                <div className="text-right text-sm text-muted-foreground mt-8 pt-4 border-t">
                    작성일: {format(new Date(post.createdDate), 'yyyy.MM.dd')}
                </div>
            </div>
        </div>
    )
}
