import { useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { useAuth } from "@/context/auth-context"
import { Plus, Image as ImageIcon } from "lucide-react"
import { isAfter, subHours } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { useMarketPosts } from "@/lib/api/market"
import type { MarketPostResponseDto, MarketItemResponseDto } from "@/types/market"

export function FleaPage() {
    const navigate = useNavigate()
    const { isAuthenticated, user } = useAuth()

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status,
    } = useMarketPosts(); // No type filter for general Flea Market page, or we could pass 'SELL' | 'BUY' if UI has tabs

    const observerElem = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        const element = observerElem.current
        if (!element) return

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
                    fetchNextPage()
                }
            },
            { threshold: 1.0 }
        )

        observer.observe(element)
        return () => observer.unobserve(element)
    }, [fetchNextPage, hasNextPage, isFetchingNextPage])

    const getThumbnail = (items: MarketItemResponseDto[]) => {
        const itemWithImage = items.find(i => i.imageUrls && i.imageUrls.length > 0)
        if (!itemWithImage || !itemWithImage.imageUrls[0]) return null
        const imageUrl = itemWithImage.imageUrls[0]
        return imageUrl.startsWith('http') ? imageUrl : imageUrl
    }

    const isNew = (createdAt: string) => {
        const postDate = new Date(createdAt)
        const dayAgo = subHours(new Date(), 24)
        return isAfter(postDate, dayAgo)
    }

    return (
        <div className="container max-w-7xl mx-auto py-10 px-4">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-navy">중고물품</h1>
                    <p className="text-muted-foreground mt-2">안 쓰는 물건을 사고 팔아보세요.</p>
                </div>
                {(!user || user.role === 'USER') && (
                    <Button className="gap-2" onClick={() => {
                        if (isAuthenticated) {
                            navigate("/market/flea/new")
                        } else {
                            toast.error("로그인 후 이용해주세요")
                        }
                    }}>
                        <Plus className="h-4 w-4" /> 글쓰기
                    </Button>
                )}
            </div>


            {
                status === 'pending' ? (
                    <div className="text-center py-20">로딩 중...</div>
                ) : status === 'error' ? (
                    <div className="text-center py-20 text-red-500">게시글을 불러오는 중 오류가 발생했습니다.</div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {data?.pages.map((page) => (
                            page.content.map((post: any) => { // Using any cast here to simplify mapping if types mismatch slightly during dev
                                const typedPost = post as MarketPostResponseDto;
                                const thumbnail = getThumbnail(typedPost.items)

                                return (
                                    <div key={typedPost.id} className="group relative bg-card rounded-xl border shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                                        <div className="aspect-square bg-muted/50 w-full object-cover relative overflow-hidden">
                                            {isNew(typedPost.createdAt) && (
                                                <Badge className="absolute top-2 left-2 z-20 bg-rose-500 hover:bg-rose-500 border-none px-1.5 py-0 text-[10px] h-4">New</Badge>
                                            )}
                                            {thumbnail ? (
                                                <img src={thumbnail} alt={typedPost.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                                    <ImageIcon className="h-10 w-10 opacity-20" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-4">
                                            <div className="flex justify-end items-start mb-2">
                                                <span className="text-xs text-muted-foreground">{new Date(typedPost.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors line-clamp-1">{typedPost.title}</h3>

                                            <div className="flex justify-between items-center text-sm text-muted-foreground">
                                                <span>{typedPost.location}</span>
                                                <span>By {typedPost.writer}</span>
                                            </div>
                                        </div>
                                        <Link to={`/market/flea/${typedPost.id}`} className="absolute inset-0 z-10">
                                            <span className="sr-only">View Post</span>
                                        </Link>
                                    </div>
                                )
                            })
                        ))}
                    </div>
                )
            }

            <div ref={observerElem} className="h-4 w-full flex justify-center items-center py-4">
                {isFetchingNextPage && <span className="text-sm text-muted-foreground">더 불러오는 중...</span>}
            </div>
        </div >
    )
}
