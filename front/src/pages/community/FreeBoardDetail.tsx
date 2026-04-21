import { useParams, useNavigate, Link } from "react-router-dom"
import { useFreePost, useDeleteFreePost } from "@/lib/api/community"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { useAuth } from "@/context/auth-context"
import { format } from "date-fns"
import { toast } from "sonner"
import { ChevronLeft, Edit, Trash2 } from "lucide-react"
import DOMPurify from "dompurify"
import { CommentSection } from "@/components/community/CommentSection"

export function FreeBoardDetail() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { user } = useAuth()
    const { data: post, status } = useFreePost(id!)
    const { mutate: deletePost } = useDeleteFreePost()

    const handleDelete = () => {
        if (window.confirm("정말로 삭제하시겠습니까?")) {
            deletePost(id!, {
                onSuccess: () => {
                    toast.success("게시글이 삭제되었습니다")
                    navigate("/community/free")
                },
                onError: () => {
                    toast.error("삭제에 실패했습니다")
                }
            })
        }
    }

    if (status === "pending") return <div className="container max-w-4xl mx-auto py-20 text-center">로딩 중...</div>
    if (status === "error" || !post) return <div className="container max-w-4xl mx-auto py-20 text-center text-red-500">게시글을 찾을 수 없습니다.</div>

    const isAuthor = user?.sub === post.authorClerkId
    const isAdmin = user?.role === "ADMIN" || user?.role === "MASTER"

    return (
        <div className="container max-w-4xl mx-auto py-10 px-4">
            <Button
                variant="ghost"
                className="mb-4 gap-2 text-muted-foreground hover:text-navy"
                onClick={() => navigate("/community/free")}
            >
                <ChevronLeft className="h-4 w-4" /> 목록으로
            </Button>

            <Card className="shadow-sm">
                <CardHeader className="border-b bg-slate-50/50 pb-6">
                    <div className="flex justify-between items-start">
                        <div className="space-y-2">
                            {post.notice && (
                                <span className="text-rose-500 font-bold text-sm tracking-wider">NOTICE</span>
                            )}
                            <h1 className="text-3xl font-bold text-slate-900">{post.title}</h1>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="font-medium text-slate-700">{post.author}</span>
                                <span className="w-1 h-1 bg-slate-300 rounded-full" />
                                <span>{format(new Date(post.createdAt), "yyyy.MM.dd HH:mm")}</span>
                                <span className="w-1 h-1 bg-slate-300 rounded-full" />
                                <span>조회 {post.viewCount}</span>
                            </div>
                        </div>
                        {(isAuthor || isAdmin) && (
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" className="gap-2" asChild>
                                    <Link to={`/community/free/${id}/edit`}>
                                        <Edit className="h-4 w-4" /> 수정
                                    </Link>
                                </Button>
                                <Button variant="outline" size="sm" className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={handleDelete}>
                                    <Trash2 className="h-4 w-4" /> 삭제
                                </Button>
                            </div>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="pt-10 pb-20">
                    <div
                        className="prose max-w-none text-slate-800"
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
                    />
                </CardContent>
            </Card>

            <CommentSection
                postId={post.id}
                commentCount={post.commentCount}
                commentEnabled={post.commentEnabled}
                postAuthorId={post.authorClerkId}
            />
        </div>
    )
}
