import { Button } from "@/components/ui/button"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"
import { X, Plus, Image as ImageIcon } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import client from "@/lib/api/client"
import { useUploadImages } from "@/lib/api/market"
import { resizeImage } from "@/lib/utils/image-processing"


interface FleaItem {
    id?: number
    name: string
    price: string
    productLink: string
    description: string
    status: "AVAILABLE" | "RESERVED" | "SOLD"
    imageUrls: string[]
    pendingImages: File[]
}

export function FleaEditPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { isAuthenticated, isLoading, user } = useAuth()
    const [title, setTitle] = useState("")
    const [content, setContent] = useState("")
    const [location, setLocation] = useState("")
    const [category, setCategory] = useState("SELL")
    const [isSaving, setIsSaving] = useState(false)
    const [pageLoading, setPageLoading] = useState(true)

    // Initial item state
    const [items, setItems] = useState<FleaItem[]>([
        { id: undefined, name: "", price: "", productLink: "", description: "", status: "AVAILABLE", imageUrls: [], pendingImages: [] }
    ])

    useEffect(() => {
        if (isLoading) return

        if (!isAuthenticated) {
            toast.error("로그인이 필요합니다.")
            navigate('/', { replace: true })
            return
        }

        const fetchPost = async () => {
            try {
                // 1. Fetch Post
                const res = await client.get(`/flea/${id}`)
                const post = res.data

                // Check ownership
                if (post.writerClerkId !== user?.sub && user?.role === 'USER') {
                    toast.error("수정 권한이 없습니다.")
                    navigate(`/market/flea/${id}`)
                    return
                }

                setTitle(post.title || "")
                setContent(post.content || "")
                setLocation(post.contactPlace || "")  // Backend uses 'contactPlace'
                setCategory(post.type || "SELL")      // Backend uses 'type'

                // Map items
                const mappedItems = post.items.map((item: any) => ({
                    id: item.id,
                    name: item.name || "",
                    price: String(item.price || ""),
                    productLink: item.link || "",      // Backend uses 'link'
                    description: item.description || "",
                    status: item.status || "AVAILABLE",
                    imageUrls: item.imageUrls || [],
                    pendingImages: []
                }))
                setItems(mappedItems.length > 0 ? mappedItems : [{
                    id: undefined,
                    name: "",
                    price: "",
                    productLink: "",
                    description: "",
                    status: "AVAILABLE",
                    imageUrls: [],
                    pendingImages: []
                }])

            } catch (error) {
                console.error("Failed to fetch post", error)
                toast.error("게시글을 불러오는데 실패했습니다.")
                navigate('/market/flea')
            } finally {
                setPageLoading(false)
            }
        }
        if (id) fetchPost()
    }, [id, navigate, isAuthenticated, isLoading])

    const handleAddItem = () => {
        setItems([...items, { id: undefined, name: "", price: "", productLink: "", description: "", status: "AVAILABLE", imageUrls: [], pendingImages: [] }])
    }

    const handleRemoveItem = (index: number) => {
        if (items.length === 1) {
            toast.error("최소 1개의 물품이 필요합니다.")
            return
        }
        setItems(items.filter((_, i) => i !== index))
    }

    const handleItemChange = (index: number, field: keyof FleaItem, value: any) => {
        const newItems = [...items]
        newItems[index] = { ...newItems[index], [field]: value }
        setItems(newItems)
    }

    const handleImageSelect = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const files = Array.from(e.target.files)
            const currentImagesCount = items[index].imageUrls.length + items[index].pendingImages.length

            if (currentImagesCount + files.length > 3) {
                toast.error("이미지는 물품당 최대 3개까지 업로드 가능합니다.")
                return
            }

            try {
                const resizedFiles = await Promise.all(files.map(file => resizeImage(file)))
                const newItems = [...items]
                newItems[index].pendingImages = [...newItems[index].pendingImages, ...resizedFiles]
                setItems(newItems)
            } catch (error) {
                console.error("Image processing error:", error)
                toast.error("이미지 처리 중 오류가 발생했습니다.")
            }
        }
    }

    const removePendingImage = (itemIndex: number, imageIndex: number) => {
        const newItems = [...items]
        newItems[itemIndex].pendingImages = newItems[itemIndex].pendingImages.filter((_, i) => i !== imageIndex)
        setItems(newItems)
    }

    const removeExistingImage = (itemIndex: number, urlToDelete: string) => {
        const newItems = [...items]
        newItems[itemIndex].imageUrls = newItems[itemIndex].imageUrls.filter(url => url !== urlToDelete)
        setItems(newItems)
    }

    const uploadImagesMutation = useUploadImages();

    const uploadImages = async () => {
        const uploadedItems = [...items]

        for (let i = 0; i < uploadedItems.length; i++) {
            if (uploadedItems[i].pendingImages.length > 0) {
                try {
                    const imageUrls = await uploadImagesMutation.mutateAsync(uploadedItems[i].pendingImages)
                    uploadedItems[i].imageUrls = [...uploadedItems[i].imageUrls, ...imageUrls]
                    uploadedItems[i].pendingImages = [] // Clear pending after upload
                } catch (err) {
                    console.error("Image upload failed", err)
                    throw new Error("이미지 업로드 중 오류가 발생했습니다.")
                }
            }
        }
        return uploadedItems
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)

        try {
            if (!isAuthenticated) {
                toast.error("로그인이 필요합니다.")
                navigate('/', { replace: true })
                return
            }

            // 1. Upload Images first
            const finalItemsFn = await uploadImages()

            // 2. Submit Data
            const payload = {
                title,
                content,
                contactPlace: location,  // Backend expects 'contactPlace'
                type: category,          // Backend expects 'type'
                items: finalItemsFn.map(item => ({
                    id: item.id,
                    name: item.name,
                    price: Number(item.price),
                    link: item.productLink,  // Backend expects 'link'
                    description: item.description,
                    status: item.status,     // Include status for update
                    imageUrls: item.imageUrls
                }))
            }

            await client.put(`/flea/${id}`, payload)

            toast.success("게시글이 수정되었습니다.")
            navigate(`/market/flea/${id}`)
        } catch (error) {
            console.error(error)
            toast.error("게시글 수정에 실패했습니다.")
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading || pageLoading) return <div className="p-20 text-center">로딩중...</div>

    return (
        <div className="container max-w-3xl mx-auto py-10 px-4">
            <h1 className="text-3xl font-bold mb-8 text-navy">게시글 수정</h1>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Info */}
                <div className="space-y-4 p-6 bg-white rounded-xl border">
                    <h2 className="text-xl font-semibold mb-4">기본 정보</h2>
                    <div className="space-y-2">
                        <Label htmlFor="title">게시글 제목</Label>
                        <Input
                            id="title"
                            placeholder="예: 이사 정리합니다 (여러 물품)"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>거래 유형</Label>
                        <RadioGroup value={category} onValueChange={setCategory} className="flex gap-4">
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="SELL" id="edit-sell" />
                                <Label htmlFor="edit-sell" className="cursor-pointer font-normal">판매</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="BUY" id="edit-buy" />
                                <Label htmlFor="edit-buy" className="cursor-pointer font-normal">구매</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="location">거래 희망 장소</Label>
                        <Input
                            id="location"
                            placeholder={location || "예: 309 Green St / 학교 앞"}
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="content">상세 설명</Label>
                        <RichTextEditor
                            value={content}
                            onChange={setContent}
                            placeholder="물품들에 대한 전반적인 설명, 거래 장소, 시간 협의 등을 적어주세요."
                        />
                    </div>
                </div>

                {/* Items List */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold">판매 물품 목록</h2>
                    </div>

                    {items.map((item, index) => (
                        <div key={index} className="p-6 bg-white rounded-xl border relative space-y-4 group">
                            {items.length > 1 && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                                    onClick={() => handleRemoveItem(index)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            )}

                            <div className="flex justify-between items-start gap-4">
                                <div className="space-y-2 flex-1">
                                    <Label>물품명</Label>
                                    <Input
                                        placeholder="예: 아이폰 13 미니"
                                        value={item.name}
                                        onChange={(e) => handleItemChange(index, "name", e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2 w-32">
                                    <Label>상태</Label>
                                    <Select
                                        value={item.status}
                                        onValueChange={(val) => handleItemChange(index, "status", val)}
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

                            <div className="space-y-2">
                                <Label>가격 ($)</Label>
                                <Input
                                    type="number"
                                    placeholder="0"
                                    value={item.price}
                                    onChange={(e) => handleItemChange(index, "price", e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>물품 설명 (선택)</Label>
                                <Input
                                    placeholder="상태, 색상 등 설명"
                                    value={item.description}
                                    onChange={(e) => handleItemChange(index, "description", e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>기존 상품 링크 (선택)</Label>
                                <Input
                                    placeholder="https://..."
                                    value={item.productLink}
                                    onChange={(e) => handleItemChange(index, "productLink", e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>사진 첨부 (최대 3장)</Label>
                                <div className="flex gap-4 items-start flex-wrap">
                                    {/* Existing Images */}
                                    {item.imageUrls.map((url, imgIndex) => (
                                        <div key={`existing-${imgIndex}`} className="relative w-20 h-20 border rounded-lg overflow-hidden shrink-0">
                                            <img
                                                src={url.startsWith('http') ? url : url}
                                                alt="preview"
                                                className="w-full h-full object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeExistingImage(index, url)}
                                                className="absolute top-0 right-0 bg-black/50 text-white p-0.5 rounded-bl"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ))}

                                    {/* Pending Images */}
                                    {item.pendingImages.map((file, imgIndex) => (
                                        <div key={`pending-${imgIndex}`} className="relative w-20 h-20 border rounded-lg overflow-hidden shrink-0 opacity-70">
                                            <img
                                                src={URL.createObjectURL(file)}
                                                alt="preview"
                                                className="w-full h-full object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removePendingImage(index, imgIndex)}
                                                className="absolute top-0 right-0 bg-black/50 text-white p-0.5 rounded-bl"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ))}

                                    {/* Add Button */}
                                    {(item.imageUrls.length + item.pendingImages.length) < 3 && (
                                        <div className="relative">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                className="hidden"
                                                id={`image-upload-${index}`}
                                                onChange={(e) => handleImageSelect(index, e)}
                                            />
                                            <label
                                                htmlFor={`image-upload-${index}`}
                                                className="flex flex-col items-center justify-center w-20 h-20 border border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                                            >
                                                <ImageIcon className="h-6 w-6 text-muted-foreground mb-1" />
                                                <span className="text-[10px] text-muted-foreground">추가</span>
                                            </label>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    <Button type="button" variant="outline" className="w-full border-dashed py-6" onClick={handleAddItem}>
                        <Plus className="mr-2 h-4 w-4" /> 물품 추가하기
                    </Button>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button type="button" variant="ghost" onClick={() => navigate(-1)}>취소</Button>
                    <Button type="submit" size="lg" disabled={isSaving}>
                        {isSaving ? "수정 중..." : "수정 완료"}
                    </Button>
                </div>
            </form>
        </div>
    )
}
