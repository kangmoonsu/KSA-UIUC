import { Button } from "@/components/ui/button"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { housingApi, type HousingType } from "@/lib/api/housing-api"
import { toast } from "sonner"
import { X, Image as ImageIcon, Loader2 } from "lucide-react"
import { useUploadImages } from "@/lib/api/market"
import { useAuth } from "@/context/auth-context"
import { resizeImage } from "@/lib/utils/image-processing"


export function HousingEditPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { user, isLoading: authLoading } = useAuth()
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)

    const [formData, setFormData] = useState({
        title: "",
        price: "",
        location: "",
        housingType: "SUBLEASE" as HousingType,
        content: "",
        status: "AVAILABLE",
    })

    const [existingImages, setExistingImages] = useState<string[]>([])
    const [pendingImages, setPendingImages] = useState<File[]>([])

    useEffect(() => {
        const fetchPost = async () => {
            if (!id) return
            try {
                const data = await housingApi.getById(id)

                // Ownership check
                if (user && data.writerClerkId !== user.sub) {
                    toast.error("수정 권한이 없습니다.")
                    navigate(`/market/housing/${id}`)
                    return
                }

                setFormData({
                    title: data.title,
                    price: data.price.toString(),
                    location: data.location,
                    housingType: data.housingType,
                    content: data.content,
                    status: data.status || "AVAILABLE",
                })
                setExistingImages(data.imageUrls || [])
            } catch (error) {
                console.error("Failed to fetch post", error)
                toast.error("게시글을 불러오는데 실패했습니다.")
                navigate("/market/housing")
            } finally {
                setLoading(false)
            }
        }

        if (!authLoading) {
            if (!user) {
                toast.error("로그인이 필요합니다.")
                navigate("/login")
                return
            }
            fetchPost()
        }
    }, [id, user, authLoading, navigate])

    const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const files = Array.from(e.target.files)
            if (existingImages.length + pendingImages.length + files.length > 5) {
                toast.error("최대 5장까지 업로드 가능합니다.")
                return
            }
            try {
                const resizedFiles = await Promise.all(files.map(file => resizeImage(file)))
                setPendingImages(prev => [...prev, ...resizedFiles])
            } catch (error) {
                console.error("Image processing error:", error)
                toast.error("이미지 처리 중 오류가 발생했습니다.")
            }
        }
    }

    const removeExistingImage = (index: number) => {
        setExistingImages(existingImages.filter((_, i) => i !== index))
    }

    const removePendingImage = (index: number) => {
        setPendingImages(pendingImages.filter((_, i) => i !== index))
    }

    const uploadImagesMutation = useUploadImages();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!id) return
        setSubmitting(true)
        try {
            let newUploadedUrls: string[] = []
            if (pendingImages.length > 0) {
                newUploadedUrls = await uploadImagesMutation.mutateAsync(pendingImages)
            }

            const finalImageUrls = [...existingImages, ...newUploadedUrls]

            await housingApi.update(id, {
                title: formData.title,
                content: formData.content,
                location: formData.location,
                price: Number(formData.price),
                housingType: formData.housingType,
                status: formData.status,
                imageUrls: finalImageUrls
            })

            toast.success("게시글이 수정되었습니다.")
            navigate(`/market/housing/${id}`)
        } catch (error) {
            console.error("Failed to update post", error)
            toast.error("게시글 수정에 실패했습니다.")
        } finally {
            setSubmitting(false)
        }
    }

    if (authLoading || loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                <p className="text-muted-foreground">게시글을 불러오는 중...</p>
            </div>
        )
    }

    return (
        <div className="container max-w-2xl mx-auto py-10 px-4">
            <h1 className="text-2xl font-bold mb-6">하우징 수정</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="title">제목</Label>
                    <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="type">유형</Label>
                        <Select
                            value={formData.housingType}
                            onValueChange={(value: HousingType) => setFormData({ ...formData, housingType: value })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="유형 선택" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="SUBLEASE">서브리즈</SelectItem>
                                <SelectItem value="ROOMMATE">룸메이트</SelectItem>
                                <SelectItem value="TAKEOVER">양도</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="status">상태</Label>
                        <Select
                            value={formData.status}
                            onValueChange={(value) => setFormData({ ...formData, status: value })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="상태 선택" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="AVAILABLE">구하는 중</SelectItem>
                                <SelectItem value="COMPLETED">완료</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="price">가격 ($/월)</Label>
                        <Input
                            id="price"
                            type="number"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="location">위치</Label>
                        <Input
                            id="location"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            required
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>사진 (최대 5장)</Label>
                    <div className="flex gap-4 items-start flex-wrap">
                        {existingImages.map((url, index) => (
                            <div key={`existing-${index}`} className="relative w-24 h-24 border rounded-lg overflow-hidden shrink-0">
                                <img
                                    src={url}
                                    alt="existing"
                                    className="w-full h-full object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeExistingImage(index)}
                                    className="absolute top-0 right-0 bg-red-500 text-white p-0.5 rounded-bl hover:bg-red-600"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        ))}

                        {pendingImages.map((file, index) => (
                            <div key={`pending-${index}`} className="relative w-24 h-24 border rounded-lg overflow-hidden shrink-0">
                                <img
                                    src={URL.createObjectURL(file)}
                                    alt="preview"
                                    className="w-full h-full object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={() => removePendingImage(index)}
                                    className="absolute top-0 right-0 bg-black/50 text-white p-0.5 rounded-bl"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        ))}

                        {existingImages.length + pendingImages.length < 5 && (
                            <div className="relative">
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    className="hidden"
                                    id="image-upload"
                                    onChange={handleImageSelect}
                                />
                                <label
                                    htmlFor="image-upload"
                                    className="flex flex-col items-center justify-center w-24 h-24 border border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                                >
                                    <ImageIcon className="h-6 w-6 text-muted-foreground mb-1" />
                                    <span className="text-xs text-muted-foreground">추가</span>
                                </label>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="content">상세 설명</Label>
                    <RichTextEditor
                        value={formData.content}
                        onChange={(value: string) => setFormData({ ...formData, content: value })}
                    />
                </div>

                <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => navigate(-1)}>취소</Button>
                    <Button type="submit" disabled={submitting}>
                        {submitting ? "수정 중..." : "수정하기"}
                    </Button>
                </div>
            </form>
        </div>
    )
}
