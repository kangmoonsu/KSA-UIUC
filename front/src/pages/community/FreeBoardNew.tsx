import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useCreateFreePost } from "@/lib/api/community"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RichTextEditorWithImage } from "@/components/ui/rich-text-editor-with-image"
import { useAuth } from "@/context/auth-context"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"

export function FreeBoardNew() {
    const [title, setTitle] = useState("")
    const [content, setContent] = useState("")
    const [isNotice, setIsNotice] = useState(false)
    const [isCommentEnabled, setIsCommentEnabled] = useState(true)
    const { user } = useAuth()
    const navigate = useNavigate()
    const { mutate: createPost, isPending } = useCreateFreePost()

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

        createPost({ title, content, notice: isNotice, commentEnabled: isCommentEnabled }, {
            onSuccess: () => {
                toast.success("게시글이 등록되었습니다")
                navigate("/community/free")
            },
            onError: () => {
                toast.error("게시글 등록에 실패했습니다")
            }
        })
    }

    const isAdmin = user?.role === "ADMIN" || user?.role === "MASTER"

    return (
        <div className="container max-w-4xl mx-auto py-10 px-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">새 글 작성</CardTitle>
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
                                    공지사항으로 등록
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
                                {isPending ? "등록 중..." : "등록하기"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
