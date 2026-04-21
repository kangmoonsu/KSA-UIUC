import { useState, useRef, useEffect } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { executiveService } from "@/lib/api/executive-service"
import type { ExecutiveMember } from "@/lib/api/executive-service"
import { useUploadImage } from "@/lib/api/popup"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Upload, X } from "lucide-react"

interface ExecutiveModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    member?: ExecutiveMember;
    isCurrent?: boolean;
}

export function ExecutiveModal({ open, onOpenChange, member, isCurrent: initialIsCurrent }: ExecutiveModalProps) {
    const isEdit = !!member
    const queryClient = useQueryClient()
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [formData, setFormData] = useState({
        name: "",
        position: "",
        period: "",
        major: "",
        email: "",
        imageUrl: "",
        isCurrent: initialIsCurrent ?? false,
        displayOrder: 0
    })

    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)

    const { mutateAsync: uploadImage, isPending: isUploading } = useUploadImage()

    useEffect(() => {
        if (member) {
            setFormData({
                name: member.name,
                position: member.position,
                period: member.period,
                major: member.major || "",
                email: member.email || "",
                imageUrl: member.imageUrl || "",
                isCurrent: initialIsCurrent ?? member.isCurrent ?? false,
                displayOrder: member.displayOrder
            })
            setPreviewUrl(member.imageUrl || null)
        } else {
            setFormData(prev => ({ ...prev, isCurrent: initialIsCurrent ?? false }))
        }
    }, [member, initialIsCurrent])

    const mutation = useMutation({
        mutationFn: (data: Omit<ExecutiveMember, 'id'>) =>
            isEdit ? executiveService.updateExecutive(member!.id, data) : executiveService.createExecutive(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["currentExecutives"] })
            queryClient.invalidateQueries({ queryKey: ["pastExecutives"] })
            toast.success(isEdit ? "정보가 수정되었습니다" : "정보가 등록되었습니다")
            onOpenChange(false)
        },
        onError: () => toast.error("요청에 실패했습니다")
    })

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.name || !formData.position || !formData.period) {
            toast.error("이름, 직책, 활동 기수는 필수입니다.")
            return
        }

        let finalImageUrl = formData.imageUrl
        if (selectedFile) {
            try {
                finalImageUrl = await uploadImage(selectedFile)
            } catch (err) {
                toast.error("이미지 업로드에 실패했습니다.")
                return
            }
        }

        mutation.mutate({
            ...formData,
            imageUrl: finalImageUrl
        })
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEdit ? "임원진 정보 수정" : "새 임원진 등록"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-5 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">이름 (Name)</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="예: 이용진 (Yongjin Lee)"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="position">직책 (Position)</Label>
                            <Input
                                id="position"
                                value={formData.position}
                                onChange={e => setFormData(prev => ({ ...prev, position: e.target.value }))}
                                placeholder="예: 행정팀장 (Treasurer)"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="major">전공 / 학위 (Academic / Major)</Label>
                        <Input
                            id="major"
                            value={formData.major}
                            onChange={e => setFormData(prev => ({ ...prev, major: e.target.value }))}
                            placeholder="예: Mathematics (Graduate)"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">이메일 (Email)</Label>
                        <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                            placeholder="예: treasurer@illinoisksa.org"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="period">활동 기수 (Period)</Label>
                            <Input
                                id="period"
                                value={formData.period}
                                onChange={e => setFormData(prev => ({ ...prev, period: e.target.value }))}
                                placeholder="예: 2024-2025"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="displayOrder">출력 순서</Label>
                            <Input
                                id="displayOrder"
                                type="number"
                                value={formData.displayOrder}
                                onChange={e => setFormData(prev => ({ ...prev, displayOrder: parseInt(e.target.value) }))}
                                placeholder="0"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>프로필 이미지</Label>
                        <div className="flex flex-col gap-3">
                            {previewUrl ? (
                                <div className="relative aspect-video rounded-lg overflow-hidden border bg-slate-100 flex items-center justify-center">
                                    <img src={previewUrl} alt="Preview" className="max-w-full max-h-full object-contain" />
                                    <button
                                        type="button"
                                        onClick={removeFile}
                                        className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-slate-50 transition-colors"
                                >
                                    <Upload className="w-6 h-6 text-slate-400" />
                                    <span className="text-sm text-slate-500">이미지 업로드</span>
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

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>취소</Button>
                        <Button type="submit" disabled={mutation.isPending || isUploading} className="bg-navy">
                            {mutation.isPending || isUploading ? "저장 중..." : "저장하기"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
