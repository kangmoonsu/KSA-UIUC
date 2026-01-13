import { Button } from "@/components/ui/button"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import client from "@/lib/api/client"
import { toast } from "sonner"
import { X, Image as ImageIcon } from "lucide-react"
import { useUploadImages } from "@/lib/api/market"

export function CarsNewPage() {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        title: "",
        price: "",
        year: "",
        mileage: "",
        model: "",
        content: "",
    })

    const [pendingImages, setPendingImages] = useState<File[]>([])
    // const [imageUrls, setImageUrls] = useState<string[]>([]) // To store uploaded URLs if we did partial upload, but here we upload all at submit or pre-upload. 
    // Actually consistent with Flea, let's upload at submit. But to show preview we need local URLs.

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

            const payload = {
                title: formData.title,
                price: Number(formData.price),
                year: Number(formData.year),
                mileage: Number(formData.mileage),
                model: formData.model,
                content: formData.content,
                imageUrls: uploadedUrls,
                status: "AVAILABLE"
            }

            await client.post('/cars', payload)

            toast.success("자동차 판매글이 등록되었습니다.")
            navigate("/market/cars")
        } catch (error) {
            console.error(error)
            toast.error("등록에 실패했습니다.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container max-w-2xl mx-auto py-10 px-4">
            <h1 className="text-2xl font-bold mb-6">자동차 판매 등록</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="title">제목</Label>
                    <Input
                        id="title"
                        placeholder="판매 제목 (예: 2018 Honda Civic)"
                        value={formData.title}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, title: e.target.value })}
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="price">가격 ($)</Label>
                        <Input
                            id="price"
                            type="number"
                            placeholder="0"
                            value={formData.price}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, price: e.target.value })}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="model">모델명</Label>
                        <Input
                            id="model"
                            placeholder="예: Civic, Sonata"
                            value={formData.model}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, model: e.target.value })}
                            required
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="year">연식 (Year)</Label>
                        <Input
                            id="year"
                            type="number"
                            placeholder="예: 2018"
                            value={formData.year}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, year: e.target.value })}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="mileage">주행거리 (Mileage)</Label>
                        <Input
                            id="mileage"
                            type="number"
                            placeholder="mi"
                            value={formData.mileage}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, mileage: e.target.value })}
                            required
                        />
                    </div>
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
                    <Label htmlFor="content">차량 상세 설명</Label>
                    <RichTextEditor
                        value={formData.content}
                        onChange={(value: string) => setFormData({ ...formData, content: value })}
                        placeholder="차량 상태, 옵션, 사고 유무 등을 상세히 적어주세요."
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
