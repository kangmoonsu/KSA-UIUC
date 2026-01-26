import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { useRecruitPost, useUpdateRecruitPost } from "@/lib/api/recruit"
import { RichTextEditorWithImage } from "@/components/ui/rich-text-editor-with-image"
import { X } from "lucide-react"

export function RecruitEditPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { data: post, isLoading } = useRecruitPost(id!)
    const { mutate: updatePost, isPending } = useUpdateRecruitPost()

    const [title, setTitle] = useState("")
    const [companyName, setCompanyName] = useState("")
    const [location, setLocation] = useState("")
    const [content, setContent] = useState("")

    // Application Links Logic
    const [linkInput, setLinkInput] = useState("")
    const [applicationLinks, setApplicationLinks] = useState<string[]>([])

    // Role Tags Logic (Recruitment Field)
    const [roleInput, setRoleInput] = useState("")
    const [roles, setRoles] = useState<string[]>([])

    useEffect(() => {
        if (post) {
            setTitle(post.title)
            setCompanyName(post.companyName)
            setLocation(post.location || "")
            // handle potentially undefined applicationLinks if old data doesn't have it (though DTO says optional)
            setApplicationLinks(post.applicationLinks || [])
            setContent(post.content)
            setRoles(post.roles || [])
        }
    }, [post])

    const normalizeUrl = (url: string) => {
        if (!url) return "";
        if (url.startsWith('http://') || url.startsWith('https://')) {
            return url;
        }
        return `https://${url}`;
    }

    const handleAddLink = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && linkInput.trim()) {
            e.preventDefault()
            const normalizedLink = normalizeUrl(linkInput.trim());
            if (!applicationLinks.includes(normalizedLink)) {
                setApplicationLinks([...applicationLinks, normalizedLink])
            }
            setLinkInput("")
        }
    }


    const removeLink = (linkToRemove: string) => {
        setApplicationLinks(applicationLinks.filter(link => link !== linkToRemove))
    }

    const handleAddRole = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && roleInput.trim()) {
            e.preventDefault()
            if (!roles.includes(roleInput.trim())) {
                setRoles([...roles, roleInput.trim()])
            }
            setRoleInput("")
        }
    }

    const removeRole = (roleToRemove: string) => {
        setRoles(roles.filter(role => role !== roleToRemove))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (!id) return

        // Auto-add current role input if user forgot to press Enter
        let finalRoles = [...roles]
        if (roleInput.trim() && !finalRoles.includes(roleInput.trim())) {
            finalRoles.push(roleInput.trim())
        }

        let finalLinks = [...applicationLinks]
        if (linkInput.trim()) {
            const normalizedLink = normalizeUrl(linkInput.trim());
            if (!finalLinks.includes(normalizedLink)) {
                finalLinks.push(normalizedLink)
            }
        }

        if (!title.trim() || !companyName.trim() || !content.trim()) {
            toast.error("필수 정보를 모두 입력해주세요 (제목, 회사명, 내용)")
            return
        }

        updatePost({
            id,
            data: {
                title,
                companyName,
                roles: finalRoles,
                location,
                applicationLinks: finalLinks,
                content
            }
        }, {
            onSuccess: () => {
                toast.success("채용 공고가 수정되었습니다")
                navigate(`/market/recruit/${id}`)
            },
            onError: (error) => {
                console.error(error)
                toast.error("수정 중 오류가 발생했습니다")
            }
        })
    }

    if (isLoading) return <div className="container py-20 text-center">Loading...</div>

    return (
        <div className="container max-w-3xl mx-auto py-10 px-4">
            <h1 className="text-2xl font-bold mb-6">채용 공고 수정</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="title">공고 제목 *</Label>
                    <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="예: 2026년 상반기 소프트웨어 엔지니어 채용"
                        className="text-lg"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="companyName">회사명 *</Label>
                        <Input
                            id="companyName"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            placeholder="회사 이름을 입력하세요"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="location">근무지 (선택)</Label>
                        <Input
                            id="location"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="예: Seoul, Pangyo, Remote"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>모집 분야 (엔터로 추가)</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                        {roles.map((role) => (
                            <span key={role} className="bg-primary/10 text-primary px-2 py-1 rounded-md text-sm flex items-center gap-1">
                                {role}
                                <button type="button" onClick={() => removeRole(role)} className="hover:text-red-500">
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        ))}
                    </div>
                    <Input
                        value={roleInput}
                        onChange={(e) => setRoleInput(e.target.value)}
                        onKeyDown={handleAddRole}
                        placeholder="분야 입력 후 Enter (예: Frontend Developer)"
                    />
                </div>

                <div className="space-y-2">
                    <Label>지원 링크 (엔터로 추가)</Label>
                    <div className="flex flex-col gap-2 mb-2">
                        {applicationLinks.map((link) => (
                            <div key={link} className="flex items-center gap-2 bg-muted/50 px-3 py-2 rounded-md">
                                <span className="flex-1 text-sm truncate">{link}</span>
                                <button type="button" onClick={() => removeLink(link)} className="hover:text-red-500">
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                    <Input
                        value={linkInput}
                        onChange={(e) => setLinkInput(e.target.value)}
                        onKeyDown={handleAddLink}
                        placeholder="링크 입력 후 Enter (https://...)"
                    />
                </div>

                <div className="space-y-2">
                    <Label>상세 요강 *</Label>
                    <div className="min-h-[400px]">
                        <RichTextEditorWithImage
                            value={content}
                            onChange={setContent}
                            placeholder="채용 상세 내용을 작성해주세요."
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => navigate(-1)}>취소</Button>
                    <Button type="submit" disabled={isPending}>
                        {isPending ? "수정 중..." : "수정하기"}
                    </Button>
                </div>
            </form>
        </div>
    )
}
