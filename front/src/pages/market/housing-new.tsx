import { Button } from "@/components/ui/button"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { housingApi, type HousingType } from "@/lib/api/housing-api"
import { toast } from "sonner"
import { X, Image as ImageIcon } from "lucide-react"
import { useUploadImages } from "@/lib/api/market"

export function HousingNewPage() {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        title: "",
        price: "",
        location: "",
        housingType: "SUBLEASE" as HousingType,
        content: "",
    })
    const [pendingImages, setPendingImages] = useState<File[]>([])

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const files = Array.from(e.target.files)
            if (pendingImages.length + files.length > 5) {
                toast.error("최대 5장까지 업로드 가능합니다.")
                return
            }
            setPendingImages([...pendingImages, ...files])
        }
    }

    const removePendingImage = (index: number) => {
        setPendingImages(pendingImages.filter((_, i) => i !== index))
    }

    const uploadImagesMutation = useUploadImages();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            let uploadedUrls: string[] = []
            if (pendingImages.length > 0) {
                uploadedUrls = await uploadImagesMutation.mutateAsync(pendingImages)
            }

            await housingApi.create({
                ...formData,
                price: Number(formData.price),
                housingType: formData.housingType,
                detail: formData.content, // Pass content as detail
                imageUrls: uploadedUrls
            })
            toast.success("게시글이 등록되었습니다.")
            navigate("/market/housing")
        } catch (error) {
            console.error("Failed to create post", error)
            toast.error("게시글 등록에 실패했습니다.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container max-w-2xl mx-auto py-10 px-4">
            <h1 className="text-2xl font-bold mb-6">하우징 등록</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="title">제목</Label>
                    <Input
                        id="title"
                        placeholder="제목 (예: 2024 가을학기 서브리스 구합니다)"
                        value={formData.title}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, title: e.target.value })}
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
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="SUBLEASE">서브리즈</SelectItem>
                                <SelectItem value="ROOMMATE">룸메이트</SelectItem>
                                <SelectItem value="TAKEOVER">양도</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="price">가격 ($/월)</Label>
                        <Input
                            id="price"
                            type="number"
                            placeholder="0"
                            value={formData.price}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, price: e.target.value })}
                            required
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="location">위치</Label>
                    <Input
                        id="location"
                        placeholder="예: 309 Green St"
                        value={formData.location}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, location: e.target.value })}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label>사진 (최대 5장)</Label>
                    <div className="flex gap-4 items-start flex-wrap">
                        {pendingImages.map((file, index) => (
                            <div key={index} className="relative w-24 h-24 border rounded-lg overflow-hidden shrink-0">
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

                        {pendingImages.length < 5 && (
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
                        placeholder="기간, 방 구조, 포함 옵션 등을 상세히 적어주세요."
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
