import { useRef } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { carouselService } from "@/lib/api/carousel"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"
import Autoplay from "embla-carousel-autoplay"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface CarouselSectionProps {
    isAdmin: boolean
}

export function CarouselSection({ isAdmin }: CarouselSectionProps) {
    const queryClient = useQueryClient()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const plugin = useRef(Autoplay({ delay: 3000, stopOnInteraction: true }))

    const { data: images, isLoading } = useQuery({
        queryKey: ["carouselImages"],
        queryFn: carouselService.getImages,
    })

    const addMutation = useMutation({
        mutationFn: carouselService.addImage,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["carouselImages"] })
            toast.success("이미지가 추가되었습니다.")
        },
        onError: () => toast.error("이미지 추가에 실패했습니다."),
    })

    const deleteMutation = useMutation({
        mutationFn: carouselService.deleteImage,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["carouselImages"] })
            toast.success("이미지가 삭제되었습니다.")
        },
        onError: () => toast.error("이미지 삭제에 실패했습니다."),
    })

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            addMutation.mutate(file)
        }
        // Reset input
        if (fileInputRef.current) fileInputRef.current.value = ""
    }

    if (isLoading) {
        return (
            <div className="w-full aspect-4/3 bg-slate-100 animate-pulse rounded-2xl flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            </div>
        )
    }

    const hasImages = images && images.length > 0

    return (
        <div className="w-full grow flex flex-col">
            <div className="relative group grow flex flex-col">
                <Carousel
                    plugins={[plugin.current]}
                    className="w-full grow flex flex-col"
                    onMouseEnter={plugin.current.stop}
                    onMouseLeave={plugin.current.reset}
                >
                    <CarouselContent className="grow">
                        {hasImages ? (
                            images.map((image) => (
                                <CarouselItem key={image.id} className="h-full">
                                    <div className="relative h-full w-full overflow-hidden bg-slate-50">
                                        <img
                                            src={image.imageUrl}
                                            alt="KSA Community"
                                            className="w-full h-full object-cover"
                                        />
                                        {isAdmin && (
                                            <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button
                                                    variant="destructive"
                                                    size="icon"
                                                    className="h-8 w-8 rounded-full shadow-lg"
                                                    onClick={() => {
                                                        if (window.confirm("정말 이 이미지를 삭제하시겠습니까?")) {
                                                            deleteMutation.mutate(image.id)
                                                        }
                                                    }}
                                                    disabled={deleteMutation.isPending}
                                                >
                                                    {deleteMutation.isPending ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </CarouselItem>
                            ))
                        ) : (
                            <CarouselItem className="h-full">
                                <div className="w-full h-full min-h-[400px] bg-slate-100 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed">
                                    <p>등록된 이미지가 없습니다.</p>
                                    {isAdmin && <p className="text-sm mt-2">아래 버튼을 통해 이미지를 추가해주세요.</p>}
                                </div>
                            </CarouselItem>
                        )}
                    </CarouselContent>
                    {hasImages && images.length > 1 && (
                        <>
                            <CarouselPrevious className="hidden md:flex left-4" />
                            <CarouselNext className="hidden md:flex right-4" />
                        </>
                    )}
                </Carousel>
            </div>

            {isAdmin && (
                <div className="p-4 border-t flex justify-center bg-white">
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                    <Button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={addMutation.isPending}
                        variant="outline"
                        className="rounded-full border-[#E84A27] text-[#E84A27] hover:bg-[#E84A27]/5"
                    >
                        {addMutation.isPending ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <Plus className="w-4 h-4 mr-2" />
                        )}
                        캐러셀 이미지 추가
                    </Button>
                </div>
            )}
        </div>
    )
}
