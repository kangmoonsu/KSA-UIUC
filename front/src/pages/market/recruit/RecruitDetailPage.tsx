import { useParams, useNavigate } from "react-router-dom"
import DOMPurify from "dompurify"
import { Button } from "@/components/ui/button"
import { ArrowLeft, MapPin, DollarSign, MoreHorizontal, Building2, Briefcase, ExternalLink } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { useRecruitPost, useDeleteRecruitPost } from "@/lib/api/recruit"
import { format } from "date-fns"

export function RecruitDetailPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { data: post, isLoading, error } = useRecruitPost(id!)
    const { mutate: deletePost } = useDeleteRecruitPost()
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
                navigate("/market/recruit")
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
                <Button variant="ghost" onClick={() => navigate('/market/recruit')} className="-ml-4 text-muted-foreground">
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
                            <DropdownMenuItem onClick={() => navigate(`/market/recruit/${id}/edit`)}>
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
                <div className="border-b pb-8">
                    <div className="flex gap-2 mb-4">
                        <Badge variant="secondary">{post.experienceLevel}</Badge>
                        <Badge variant="outline">{post.employmentType}</Badge>
                        {post.deadline && (
                            <Badge variant="destructive" className="bg-rose-500 hover:bg-rose-600">
                                ~ {format(new Date(post.deadline), 'yyyy.MM.dd')} 마감
                            </Badge>
                        )}
                    </div>

                    <h1 className="text-3xl font-bold mb-2">{post.title}</h1>
                    <div className="text-xl text-muted-foreground flex items-center gap-2 mb-6">
                        <Building2 className="h-5 w-5" />
                        {post.companyName}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-muted/20 p-6 rounded-xl border">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Briefcase className="h-5 w-5 text-primary shrink-0" />
                                <div className="flex flex-wrap gap-1">
                                    {post.roles.map((role: string, i: number) => (
                                        <span key={i} className="bg-white border px-2 py-0.5 rounded text-sm font-medium">
                                            {role}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <DollarSign className="h-5 w-5 text-primary shrink-0" />
                                <span className="font-medium">{post.salary}</span>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <MapPin className="h-5 w-5 text-primary shrink-0" />
                                <span>{post.location}</span>
                            </div>
                            {post.applicationUrl && (
                                <div className="flex items-center gap-3">
                                    <ExternalLink className="h-5 w-5 text-primary shrink-0" />
                                    <a href={post.applicationUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
                                        지원 페이지 바로가기
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold border-l-4 border-primary pl-3">상세 요강</h2>
                    <div
                        className="prose max-w-none text-gray-800 bg-white min-h-[200px]"
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content, sanitizeConfig) }}
                    />
                </div>

                <div className="text-right text-sm text-muted-foreground mt-8 pt-4 border-t">
                    등록일: {format(new Date(post.createdDate), 'yyyy.MM.dd')}
                </div>
            </div>
        </div>
    )
}
