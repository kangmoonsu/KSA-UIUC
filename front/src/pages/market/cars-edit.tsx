import { Button } from "@/components/ui/button"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"
import { X, Image as ImageIcon } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import client from "@/lib/api/client"
import { useUploadImages } from "@/lib/api/market"
import { resizeImage } from "@/lib/utils/image-processing"


export function CarsEditPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { isAuthenticated, isLoading: authLoading } = useAuth()
    const [loading, setLoading] = useState(true)
    const [formData, setFormData] = useState({
        title: "",
        price: "",
        year: "",
        mileage: "",
        model: "",
        content: "",
        status: "AVAILABLE"
    })

    const [existingImages, setExistingImages] = useState<string[]>([])
    const [pendingImages, setPendingImages] = useState<File[]>([])

    useEffect(() => {
        if (authLoading) return

        if (!isAuthenticated) {
            toast.error("로그인이 필요합니다.")
            navigate('/', { replace: true })
            return
        }

        const fetchPost = async () => {
            try {
                const res = await client.get(`/cars/${id}`)
                const post = res.data

                // Owner check will be done by backend on submit
                setFormData({
                    title: post.title,
                    price: String(post.price),
                    year: String(post.year),
                    mileage: String(post.mileage),
                    model: post.modelName,
                    content: post.content,
                    status: post.status
                })
                setExistingImages(post.imageUrls || [])
            } catch (error) {
                console.error("Failed to fetch post", error)
                toast.error("게시글을 불러오는데 실패했습니다.")
                navigate('/market/cars')
            } finally {
                setLoading(false)
            }
        }
        if (id) fetchPost()
    }, [id, navigate, isAuthenticated, authLoading])

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

    const removePendingImage = (index: number) => {
        setPendingImages(pendingImages.filter((_, i) => i !== index))
    }

    const removeExistingImage = (urlToRemove: string) => {
        setExistingImages(existingImages.filter(url => url !== urlToRemove))
    }

    const uploadImagesMutation = useUploadImages();

    const uploadImages = async () => {
        if (pendingImages.length === 0) return []
        return await uploadImagesMutation.mutateAsync(pendingImages)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            if (!isAuthenticated) {
                toast.error("로그인이 필요합니다.")
                navigate('/', { replace: true })
                return
            }

            const uploadedUrls = await uploadImages()
            const finalImageUrls = [...existingImages, ...uploadedUrls]

            const payload = {
                title: formData.title,
                price: Number(formData.price),
                year: Number(formData.year),
                mileage: Number(formData.mileage),
                modelName: formData.model,
                content: formData.content,
                imageUrls: finalImageUrls,
                status: formData.status
            }

            await client.put(`/cars/${id}`, payload)

            toast.success("게시글이 수정되었습니다.")
            navigate(`/market/cars/${id}`)
        } catch (error) {
            console.error(error)
            toast.error("수정에 실패했습니다.")
        } finally {
            setLoading(false)
        }
    }

    if (authLoading || loading) return <div className="p-20 text-center">로딩중...</div>

    return (
        <div className="container max-w-2xl mx-auto py-10 px-4">
            <h1 className="text-2xl font-bold mb-6">자동차 판매글 수정</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-4 gap-4">
                    <div className="col-span-3 space-y-2">
                        <Label htmlFor="title">제목</Label>
                        <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>상태</Label>
                        <Select
                            value={formData.status}
                            onValueChange={(val) => setFormData({ ...formData, status: val })}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="AVAILABLE">판매중</SelectItem>
                                <SelectItem value="RESERVED">예약중</SelectItem>
                                <SelectItem value="SOLD">거래완료</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="price">가격 ($)</Label>
                        <Input
                            id="price"
                            type="number"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="model">모델명</Label>
                        <Input
                            id="model"
                            value={formData.model}
                            onChange={(e) => setFormData({ ...formData, model: e.target.value })}
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
                            value={formData.year}
                            onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="mileage">주행거리 (Mileage)</Label>
                        <Input
                            id="mileage"
                            type="number"
                            value={formData.mileage}
                            onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
                            required
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>사진 (최대 5장)</Label>
                    <div className="flex gap-4 items-start flex-wrap">
                        {/* Existing Images */}
                        {existingImages.map((url, index) => (
                            <div key={`existing-${index}`} className="relative w-24 h-24 border rounded-lg overflow-hidden shrink-0">
                                <img
                                    src={url.startsWith('http') ? url : url}
                                    alt="preview"
                                    className="w-full h-full object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeExistingImage(url)}
                                    className="absolute top-0 right-0 bg-black/50 text-white p-0.5 rounded-bl"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        ))}

                        {/* Pending Images */}
                        {pendingImages.map((file, index) => (
                            <div key={`pending-${index}`} className="relative w-24 h-24 border rounded-lg overflow-hidden shrink-0 opacity-70">
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

                        {(existingImages.length + pendingImages.length) < 5 && (
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
                    />
                </div>

                <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => navigate(-1)}>취소</Button>
                    <Button type="submit" disabled={loading}>
                        {loading ? "수정 중..." : "수정 완료"}
                    </Button>
                </div>
            </form>
        </div>
    )
}
