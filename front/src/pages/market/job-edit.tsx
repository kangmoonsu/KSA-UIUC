import { Button } from "@/components/ui/button"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import client from "@/lib/api/client"
import { toast } from "sonner"
import { useAuth } from "@/context/auth-context"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export function JobEditPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { user, isLoading: authLoading } = useAuth()
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        title: "",
        salary: "",
        location: "",
        contactInfo: "",
        content: "",
        status: "HIRING" as "HIRING" | "CLOSED"
    })

    useEffect(() => {
        const fetchPost = async () => {
            if (!id) return
            try {
                const res = await client.get(`/jobs/${id}`)
                const post = res.data

                // Ownership check
                if (!authLoading && user && post.writerClerkId !== user.sub) {
                    toast.error("수정 권한이 없습니다.")
                    navigate(`/market/job/${id}`)
                    return
                }

                setFormData({
                    title: post.title,
                    salary: post.salary,
                    location: post.location,
                    contactInfo: post.contactInfo,
                    content: post.content,
                    status: post.status || "HIRING"
                })
            } catch (error) {
                console.error("Failed to fetch job post", error)
                toast.error("게시글을 불러오는 데 실패했습니다.")
                navigate("/market/job")
            } finally {
                setLoading(false)
            }
        }

        if (!authLoading) {
            fetchPost()
        }
    }, [id, navigate, user, authLoading])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)

        try {
            await client.put(`/jobs/${id}`, formData)
            toast.success("게시글이 수정되었습니다.")
            navigate(`/market/job/${id}`)
        } catch (error) {
            console.error("Failed to update job post", error)
            toast.error("수정에 실패했습니다.")
        } finally {
            setSubmitting(false)
        }
    }

    if (loading || authLoading) return <div className="container py-20 text-center">로딩중...</div>

    return (
        <div className="container max-w-2xl mx-auto py-10 px-4">
            <h1 className="text-2xl font-bold mb-6 text-navy">구인구직 수정</h1>
            <form onSubmit={handleSubmit} className="space-y-6 bg-card border rounded-xl p-6 shadow-sm">
                <div className="space-y-2">
                    <Label htmlFor="title">제목</Label>
                    <Input
                        id="title"
                        placeholder="구인구직 제목"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="salary">급여</Label>
                        <Input
                            id="salary"
                            placeholder="예: $15/hr, 면접 후 협의"
                            value={formData.salary}
                            onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="status">상태</Label>
                        <Select
                            value={formData.status}
                            onValueChange={(value: "HIRING" | "CLOSED") => setFormData({ ...formData, status: value })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="모집 상태 선택" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="HIRING">구인중</SelectItem>
                                <SelectItem value="CLOSED">마감</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="location">위치</Label>
                        <Input
                            id="location"
                            placeholder="예: Champaign, 캠퍼스 내"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="contactInfo">연락처</Label>
                        <Input
                            id="contactInfo"
                            placeholder="이메일, 카카오톡 ID 등"
                            value={formData.contactInfo}
                            onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
                            required
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="content">상세 내용</Label>
                    <RichTextEditor
                        value={formData.content}
                        onChange={(value) => setFormData({ ...formData, content: value })}
                        placeholder="업무 내용 등을 구체적으로 작성해주세요."
                    />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={() => navigate(-1)}>취소</Button>
                    <Button type="submit" disabled={submitting} className="bg-navy hover:bg-navy/90">
                        {submitting ? "수정 중..." : "수정 완료"}
                    </Button>
                </div>
            </form>
        </div>
    )
}
