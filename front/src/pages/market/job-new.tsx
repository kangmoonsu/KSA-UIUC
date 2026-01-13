import { Button } from "@/components/ui/button"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import client from "@/lib/api/client"
import { toast } from "sonner"

export function JobNewPage() {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        title: "",
        salary: "",
        location: "",
        contactInfo: "",
        content: "",
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const payload = {
                title: formData.title,
                salary: formData.salary,
                location: formData.location,
                contactInfo: formData.contactInfo,
                content: formData.content,
                status: "HIRING"
            }

            await client.post('/jobs', payload)

            toast.success("구인구직 글이 등록되었습니다.")
            navigate("/market/job")
        } catch (error) {
            console.error(error)
            toast.error("등록에 실패했습니다.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container max-w-2xl mx-auto py-10 px-4">
            <h1 className="text-2xl font-bold mb-6">구인구직 등록</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="title">제목</Label>
                    <Input
                        id="title"
                        placeholder="구인구직 제목 (예: 주말 알바 구합니다)"
                        value={formData.title}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, title: e.target.value })}
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="salary">급여</Label>
                        <Input
                            id="salary"
                            placeholder="예: $15/hr, 면접 후 협의"
                            value={formData.salary}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, salary: e.target.value })}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="location">위치</Label>
                        <Input
                            id="location"
                            placeholder="예: Champaign, 캠퍼스 내"
                            value={formData.location}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, location: e.target.value })}
                            required
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="contactInfo">연락처</Label>
                    <Input
                        id="contactInfo"
                        placeholder="이메일, 전화번호, 카카오톡 ID 등"
                        value={formData.contactInfo}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, contactInfo: e.target.value })}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="content">상세 내용</Label>
                    <RichTextEditor
                        value={formData.content}
                        onChange={(value: string) => setFormData({ ...formData, content: value })}
                        placeholder="업무 내용, 자격 요건, 우대 사항 등을 상세히 적어주세요."
                    />
                </div>

                <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => navigate(-1)}>취소</Button>
                    <Button type="submit" disabled={loading}>
                        {loading ? "등록 중..." : "등록하기"}
                    </Button>
                </div>
            </form>
        </div>
    )
}
