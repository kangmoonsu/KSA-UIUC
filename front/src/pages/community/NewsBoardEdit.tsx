import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useNewsPost, useUpdateNewsPost } from "@/lib/api/news"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RichTextEditorWithImage } from "@/components/ui/rich-text-editor-with-image"
import { useAuth } from "@/context/auth-context"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function NewsBoardEdit() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { user, isLoading } = useAuth()
    const { data: post, status } = useNewsPost(id!)
    const { mutate: updatePost, isPending } = useUpdateNewsPost(id!)

    const [title, setTitle] = useState("")
    const [content, setContent] = useState("")

    useEffect(() => {
        if (post) {
            setTitle(post.title)
            setContent(post.content)

            // Permission check
            if (!isLoading && user) {
                const isAdmin = user.role === "ADMIN" || user.role === "MASTER";
                const isAuthor = user.sub === post.authorClerkId;
                if (!isAdmin && !isAuthor) {
                    toast.error("수정 권한이 없습니다")
                    navigate(`/community/news/${id}`, { replace: true })
                }
            }
        }
    }, [post, user, isLoading, id, navigate])

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

        updatePost({ title, content }, {
            onSuccess: () => {
                toast.success("소식이 수정되었습니다")
                navigate(`/community/news/${id}`)
            },
            onError: () => {
                toast.error("소식 수정에 실패했습니다")
            }
        })
    }

    if (status === "pending" || isLoading) return <div className="container max-w-4xl mx-auto py-20 text-center">로딩 중...</div>

    return (
        <div className="container max-w-4xl mx-auto py-10 px-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-navy">KSA 소식 수정</CardTitle>
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
                            <Button type="submit" disabled={isPending} className="bg-navy hover:bg-navy/90">
                                {isPending ? "저장 중..." : "저장하기"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
