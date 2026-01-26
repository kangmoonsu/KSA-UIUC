import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { useCreateConsultingPost } from "@/lib/api/consulting"
import { RichTextEditorWithImage } from "@/components/ui/rich-text-editor-with-image"

export function ConsultingNewPage() {
    const navigate = useNavigate()
    const { mutate: createPost, isPending } = useCreateConsultingPost()

    const [title, setTitle] = useState("")
    const [eventDate, setEventDate] = useState("")
    const [location, setLocation] = useState("")
    const [content, setContent] = useState("")

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (!title.trim() || !content.trim()) {
            toast.error("제목과 내용은 필수입니다.")
            return
        }

        createPost({
            title,
            eventDate: eventDate ? new Date(eventDate).toISOString() : "",
            location,
            content
        } as any, {
            onSuccess: () => {
                toast.success("등록되었습니다")
                navigate("/job/consulting")
            },
            onError: (error) => {
                console.error(error)
                toast.error("등록 중 오류가 발생했습니다")
            }
        })
    }

    return (
        <div className="container max-w-3xl mx-auto py-10 px-4">
            <h1 className="text-2xl font-bold mb-6">채용설명회/상담 등록</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="title">제목 *</Label>
                    <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="예: 2026 삼성전자 채용 상담회"
                        className="text-lg"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="eventDate">일시</Label>
                        <Input
                            id="eventDate"
                            type="datetime-local"
                            value={eventDate}
                            onChange={(e) => setEventDate(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="location">장소</Label>
                        <Input
                            id="location"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="예: Illini Union 210호 or Zoom"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>상세 내용 *</Label>
                    <div className="min-h-[400px]">
                        <RichTextEditorWithImage
                            value={content}
                            onChange={setContent}
                            placeholder="이미지나 상세 내용을 자유롭게 작성하세요."
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => navigate(-1)}>취소</Button>
                    <Button type="submit" disabled={isPending}>
                        {isPending ? "등록 중..." : "등록하기"}
                    </Button>
                </div>
            </form>
        </div>
    )
}
