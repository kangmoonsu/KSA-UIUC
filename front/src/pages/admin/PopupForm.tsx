import { useState, useEffect, useRef } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useCreatePopup, useUpdatePopup, useAllPopups, useUploadImage } from "@/lib/api/popup"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { useAuth } from "@/context/auth-context"
import { X, Upload } from "lucide-react"

export function PopupForm() {
    const { id } = useParams<{ id: string }>()
    const isEdit = !!id
    const navigate = useNavigate()
    const { user, isLoading: isAuthLoading } = useAuth()
    const { data: popups } = useAllPopups()
    const fileInputRef = useRef<HTMLInputElement>(null)

    const { mutate: createPopup, isPending: isCreating } = useCreatePopup()
    const { mutate: updatePopup, isPending: isUpdating } = useUpdatePopup(parseInt(id || "0"))
    const { mutateAsync: uploadImage, isPending: isUploading } = useUploadImage()

    const formatLocalISO = (date: Date) => {
        const offset = date.getTimezoneOffset()
        const localDate = new Date(date.getTime() - (offset * 60 * 1000))
        return localDate.toISOString().slice(0, 16)
    }

    const [formData, setFormData] = useState({
        title: "",
        imageUrl: "",
        linkUrl: "",
        endDate: formatLocalISO(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)), // Default 1 week
        active: true
    })

    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)

    useEffect(() => {
        if (isEdit && popups) {
            const popup = popups.find(p => p.id === parseInt(id))
            if (popup) {
                setFormData({
                    title: popup.title,
                    imageUrl: popup.imageUrl,
                    linkUrl: popup.linkUrl || "",
                    endDate: popup.endDate.slice(0, 16),
                    active: popup.active
                })
                setPreviewUrl(popup.imageUrl)
            }
        }
    }, [isEdit, popups, id])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            setSelectedFile(file)
            setPreviewUrl(URL.createObjectURL(file))
        }
    }

    const removeFile = () => {
        setSelectedFile(null)
        setPreviewUrl(isEdit ? formData.imageUrl : null)
        if (fileInputRef.current) fileInputRef.current.value = ""
    }

    if (isAuthLoading) return null;

    if (user?.role !== "ADMIN" && user?.role !== "MASTER") {
        return <div className="container py-20 text-center">권한이 없습니다.</div>
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.title || (!selectedFile && !formData.imageUrl) || !formData.endDate) {
            toast.error("필수 항목을 모두 입력해주세요 (이미지 포함).")
            return
        }

        let finalImageUrl = formData.imageUrl
        if (selectedFile) {
            try {
                finalImageUrl = await uploadImage(selectedFile)
            } catch (error) {
                toast.error("이미지 업로드에 실패했습니다.")
                return
            }
        }

        let formattedLinkUrl = formData.linkUrl?.trim()
        if (formattedLinkUrl && !formattedLinkUrl.startsWith('http://') && !formattedLinkUrl.startsWith('https://')) {
            formattedLinkUrl = `https://${formattedLinkUrl}`
        }

        const data = {
            title: formData.title,
            imageUrl: finalImageUrl,
            linkUrl: formattedLinkUrl || undefined,
            startDate: new Date().toISOString(), // Start now
            endDate: new Date(formData.endDate).toISOString(),
            active: formData.active
        }

        if (isEdit) {
            updatePopup(data, {
                onSuccess: () => {
                    toast.success("팝업이 수정되었습니다")
                    navigate("/admin/popups")
                },
                onError: () => toast.error("수정에 실패했습니다")
            })
        } else {
            createPopup(data, {
                onSuccess: () => {
                    toast.success("팝업이 등록되었습니다")
                    navigate("/admin/popups")
                },
                onError: () => toast.error("등록에 실패했습니다")
            })
        }
    }

    return (
        <div className="container max-w-2xl mx-auto py-10 px-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">
                        {isEdit ? "팝업 수정" : "새 팝업 등록"}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="title">팝업 제목 (관리용)</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                placeholder="예: 2024 봄학기 신입생 환영회"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>팝업 이미지</Label>
                            <div className="flex flex-col gap-4">
                                {previewUrl ? (
                                    <div className="relative group rounded-lg overflow-hidden border bg-slate-50 aspect-4/5 flex items-center justify-center">
                                        <img
                                            src={previewUrl}
                                            alt="Preview"
                                            className="max-w-full max-h-full object-contain"
                                        />
                                        <button
                                            type="button"
                                            onClick={removeFile}
                                            className="absolute top-2 right-2 bg-black/50 text-white p-1.5 rounded-full hover:bg-black/70 transition-colors"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="border-2 border-dashed rounded-lg p-12 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-slate-50 transition-colors"
                                    >
                                        <div className="p-3 bg-slate-100 rounded-full">
                                            <Upload className="h-6 w-6 text-slate-500" />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm font-medium">이미지 업로드</p>
                                            <p className="text-xs text-muted-foreground mt-1">클릭하여 파일을 선택하세요</p>
                                        </div>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept="image/*"
                                    className="hidden"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="linkUrl">이동할 링크 (선택사항)</Label>
                            <Input
                                id="linkUrl"
                                value={formData.linkUrl}
                                onChange={e => setFormData(prev => ({ ...prev, linkUrl: e.target.value }))}
                                placeholder="https://..."
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="endDate">종료 일시</Label>
                                <Input
                                    id="endDate"
                                    type="datetime-local"
                                    value={formData.endDate}
                                    onChange={e => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50">
                            <div className="space-y-0.5">
                                <Label htmlFor="active">활성화 상태</Label>
                                <p className="text-xs text-muted-foreground">현재 팝업을 노출할지 결정합니다.</p>
                            </div>
                            <Checkbox
                                id="active"
                                checked={formData.active}
                                onCheckedChange={(checked: boolean) => setFormData(prev => ({ ...prev, active: checked }))}
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <Button type="button" variant="outline" onClick={() => navigate("/admin/popups")}>
                                취소
                            </Button>
                            <Button type="submit" disabled={isCreating || isUpdating || isUploading} className="bg-navy hover:bg-navy/90 text-white min-w-[100px]">
                                {isEdit ? (isUpdating || isUploading ? "저장 중..." : "저장하기") : (isCreating || isUploading ? "등록 중..." : "등록하기")}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
