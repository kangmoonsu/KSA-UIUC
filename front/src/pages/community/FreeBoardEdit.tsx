import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useFreePost, useUpdateFreePost } from "@/lib/api/community"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RichTextEditorWithImage } from "@/components/ui/rich-text-editor-with-image"
import { useAuth } from "@/context/auth-context"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"

export function FreeBoardEdit() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { user } = useAuth()
    const { data: post, status } = useFreePost(id!)
    const { mutate: updatePost, isPending } = useUpdateFreePost(id!)

    const [title, setTitle] = useState("")
    const [content, setContent] = useState("")
    const [isNotice, setIsNotice] = useState(false)
    const [isCommentEnabled, setIsCommentEnabled] = useState(true)

    useEffect(() => {
        if (post) {
            setTitle(post.title)
            setContent(post.content)
            setIsNotice(post.notice)
            setIsCommentEnabled(post.commentEnabled)

            // Ownership check
            if (user && user.sub !== post.authorClerkId && user.role === "USER") {
                toast.error("수정 권한이 없습니다")
                navigate(`/community/free/${id}`)
            }
        }
    }, [post, user, id, navigate])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!title.trim()) {
            toast.error("제목을 입력해주세요")
            return
        }
        if (!content.trim() || content === "<p><br></p>") {
            toast.error("내용을 입력해주세요")
            return
        }

        updatePost({ title, content, notice: isNotice, commentEnabled: isCommentEnabled }, {
            onSuccess: () => {
                toast.success("게시글이 수정되었습니다")
                navigate(`/community/free/${id}`)
            },
            onError: () => {
                toast.error("게시글 수정에 실패했습니다")
            }
        })
    }

    if (status === "pending") return <div className="container max-w-4xl mx-auto py-20 text-center">로딩 중...</div>

    const isAdmin = user?.role === "ADMIN" || user?.role === "MASTER"

    return (
        <div className="container max-w-4xl mx-auto py-10 px-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">글 수정</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="title">제목</Label>
                            <Input
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="제목을 입력하세요"
                                className="text-lg py-6"
                            />
                        </div>

                        {isAdmin && (
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="notice"
                                    checked={isNotice}
                                    onCheckedChange={(checked: boolean) => setIsNotice(checked)}
                                />
                                <Label htmlFor="notice" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    공지사항으로 설정
                                </Label>
                            </div>
                        )}

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="commentEnabled"
                                checked={isCommentEnabled}
                                onCheckedChange={(checked: boolean) => setIsCommentEnabled(checked)}
                            />
                            <Label htmlFor="commentEnabled" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                댓글 허용
                            </Label>
                        </div>

                        <div className="space-y-2">
                            <Label>내용</Label>
                            <RichTextEditorWithImage
                                value={content}
                                onChange={setContent}
                                placeholder="내용을 입력하세요"
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                                취소
                            </Button>
                            <Button type="submit" disabled={isPending}>
                                {isPending ? "저장 중..." : "저장하기"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
