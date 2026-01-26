import { useParams, useNavigate } from "react-router-dom"
import DOMPurify from "dompurify"
import { Button } from "@/components/ui/button"
import { ArrowLeft, MoreHorizontal, Building2, Briefcase, ExternalLink, MapPin, Eye, Calendar, Share2 } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { useRecruitPost, useDeleteRecruitPost } from "@/lib/api/recruit"
import { format } from "date-fns"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

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

    const ensureAbsoluteUrl = (url: string) => {
        if (!url) return '#';
        if (url.startsWith('http://') || url.startsWith('https://')) {
            return url;
        }
        return `https://${url}`;
    }

    return (
        <div className="container max-w-7xl mx-auto py-10 px-4">
            {/* Top Navigation */}
            <div className="flex justify-between items-center mb-6">
                <Button variant="ghost" onClick={() => navigate('/market/recruit')} className="-ml-4 text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    목록으로
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

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Main Content (8 cols) */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Header Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-primary font-medium text-lg">
                            <Building2 className="h-5 w-5" />
                            {post.companyName}
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold leading-tight text-gray-900 break-words">
                            {post.title}
                        </h1>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <span className="font-medium text-foreground">{post.writer}</span>
                            </span>
                            <Separator orientation="vertical" className="h-3" />
                            <span className="flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5" />
                                {format(new Date(post.createdDate), 'yyyy.MM.dd')}
                            </span>
                            <Separator orientation="vertical" className="h-3" />
                            <span className="flex items-center gap-1">
                                <Eye className="h-3.5 w-3.5" />
                                {post.viewCount}
                            </span>
                        </div>
                    </div>

                    <Separator />

                    {/* Content Body */}
                    <div className="min-h-[400px]">
                        <h2 className="text-xl font-bold mb-6">상세 요강</h2>
                        <div
                            className="prose prose-zinc max-w-none 
                                prose-headings:font-bold prose-h1:text-2xl prose-h2:text-xl prose-p:text-gray-700 prose-li:text-gray-700
                                prose-a:text-blue-600 prose-img:rounded-lg"
                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content, sanitizeConfig) }}
                        />
                    </div>
                </div>

                {/* Right Column: Sticky Sidebar (4 cols) */}
                <div className="lg:col-span-4">
                    <div className="sticky top-24 space-y-6">
                        {/* Action Card */}
                        <Card className="border-2 border-primary/10 shadow-lg">
                            <CardContent className="p-6 space-y-4">
                                <h3 className="font-semibold text-lg">채용 정보</h3>

                                <div className="space-y-4">
                                    {/* Roles */}
                                    <div className="space-y-2">
                                        <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                            <Briefcase className="h-4 w-4" />
                                            모집 분야
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {post.roles.length > 0 ? (
                                                post.roles.map((role: string, i: number) => (
                                                    <span key={i} className="bg-primary/5 text-primary border border-primary/20 px-2.5 py-1 rounded-md text-sm font-medium">
                                                        {role}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-sm text-muted-foreground">상세 내용 참조</span>
                                            )}
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Locations */}
                                    {post.locations && post.locations.length > 0 && (
                                        <div className="space-y-2">
                                            <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                                <MapPin className="h-4 w-4" />
                                                근무지
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {post.locations.map((loc: string, i: number) => (
                                                    <span key={i} className="bg-muted text-muted-foreground px-2.5 py-1 rounded-md text-sm">
                                                        {loc}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {post.applicationLinks && post.applicationLinks.length > 0 && (
                                    <div className="pt-4">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button className="w-full text-lg h-12 font-bold shadow-md" size="lg">
                                                    지원하기
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-[300px]">
                                                {post.applicationLinks.map((link: string, index: number) => (
                                                    <DropdownMenuItem key={index} asChild>
                                                        <a
                                                            href={ensureAbsoluteUrl(link)}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-2 cursor-pointer py-3"
                                                        >
                                                            <ExternalLink className="h-4 w-4" />
                                                            <span className="truncate">{link}</span>
                                                        </a>
                                                    </DropdownMenuItem>
                                                ))}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Share or Other Info (Optional) */}
                        <div className="flex justify-center">
                            <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => {
                                navigator.clipboard.writeText(window.location.href)
                                toast.success("링크가 복사되었습니다")
                            }}>
                                <Share2 className="h-4 w-4 mr-2" />
                                공고 공유하기
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
