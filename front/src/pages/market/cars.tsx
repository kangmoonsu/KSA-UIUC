import { useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { useAuth } from "@/context/auth-context"
import { Plus, Gauge, Calendar } from "lucide-react"
import { isAfter, subHours } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { useCarPosts } from "@/lib/api/cars"



export function CarsPage() {
    const navigate = useNavigate()
    const { isAuthenticated, user } = useAuth()
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useCarPosts()
    const observer = useRef<IntersectionObserver>()
    const lastPostRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (isFetchingNextPage) return
        if (observer.current) observer.current.disconnect()

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasNextPage) {
                fetchNextPage()
            }
        })

        const element = lastPostRef.current
        if (element) observer.current.observe(element)

        return () => observer.current?.disconnect()
    }, [fetchNextPage, hasNextPage, isFetchingNextPage])

    const isNew = (createdAt: string) => {
        const postDate = new Date(createdAt)
        const dayAgo = subHours(new Date(), 24)
        return isAfter(postDate, dayAgo)
    }

    return (
        <div className="container max-w-7xl mx-auto py-10 px-4">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-navy">자동차</h1>
                    <p className="text-muted-foreground mt-2">믿을 수 있는 중고차 거래.</p>
                </div>
                {(!user || user.role === 'USER') && (
                    <Button className="gap-2" onClick={() => {
                        if (isAuthenticated) {
                            navigate("/market/cars/new")
                        } else {
                            toast.error("로그인 후 이용해주세요")
                        }
                    }}>
                        <Plus className="h-4 w-4" /> 글쓰기
                    </Button>
                )}
            </div>

            {status === 'pending' ? (
                <div className="text-center py-20">로딩 중...</div>
            ) : status === 'error' ? (
                <div className="text-center py-20 text-red-500">데이터를 불러오는 중 오류가 발생했습니다.</div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {data?.pages.map((page) => (
                        page.content.map((post) => {
                            let statusBadgeClass = "bg-green-100 text-green-700"
                            let statusText = "판매중"

                            if (post.status === 'RESERVED') {
                                statusBadgeClass = "bg-yellow-100 text-yellow-700"
                                statusText = "예약중"
                            } else if (post.status === 'SOLD') {
                                statusBadgeClass = "bg-gray-100 text-gray-500"
                                statusText = "거래완료"
                            }

                            const thumbnail = post.imageUrls && post.imageUrls.length > 0 ? post.imageUrls[0] : null
                            const displayThumbnail = thumbnail ? (thumbnail.startsWith('http') ? thumbnail : thumbnail) : null

                            return (
                                <div key={post.id} className="group relative bg-card rounded-xl border shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                                    <div className="aspect-video bg-muted/50 w-full object-cover relative overflow-hidden">
                                        {isNew(post.createdAt) && (
                                            <Badge className="absolute top-2 left-2 z-20 bg-rose-500 hover:bg-rose-500 border-none px-1.5 py-0 text-[10px] h-4">New</Badge>
                                        )}
                                        {displayThumbnail ? (
                                            <img src={displayThumbnail} alt={post.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                                No Image
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusBadgeClass}`}>
                                                {statusText}
                                            </span>
                                            <span className="text-xs text-muted-foreground">{new Date(post.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors line-clamp-1">{post.title}</h3>
                                        <p className="font-bold text-xl mb-3 text-navy">${post.price.toLocaleString()}</p>

                                        <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground mb-4">
                                            <div className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {post.year}</div>
                                            <div className="flex items-center gap-1"><Gauge className="h-3 w-3" /> {post.mileage.toLocaleString()} mi</div>
                                        </div>

                                        <div className="flex justify-between items-center text-xs text-muted-foreground pt-2 border-t">
                                            <span>By {post.writer}</span>
                                        </div>
                                    </div>
                                    <Link to={`/market/cars/${post.id}`} className="absolute inset-0 z-10">
                                        <span className="sr-only">View Post</span>
                                    </Link>
                                </div>
                            )
                        })
                    ))}
                    <div ref={lastPostRef} className="h-10" />
                </div>
            )}
        </div>
    )
}
