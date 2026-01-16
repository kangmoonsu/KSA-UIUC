import { useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Link, useNavigate } from "react-router-dom"
import { Plus, MapPin } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/context/auth-context"
import { type HousingPost, useHousingPosts } from "@/lib/api/housing-api"

export function HousingPage() {
    const navigate = useNavigate()
    const { isAuthenticated, user } = useAuth()
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useHousingPosts()
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

    const typeMap: Record<string, string> = {
        SUBLEASE: "서브리즈",
        TAKEOVER: "양도",
        ROOMMATE: "룸메이트",
    }

    return (
        <div className="container max-w-7xl mx-auto py-10 px-4">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-navy">하우징</h1>
                    <p className="text-muted-foreground mt-2">서브리즈, 룸메이트 구하기.</p>
                </div>
                {(!user || user.role === 'USER') && (
                    <Button className="gap-2" onClick={() => {
                        if (isAuthenticated) {
                            navigate("/market/housing/new")
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {data?.pages.map((page: any) => (
                        page.content.map((post: HousingPost) => (
                            <div key={post.id} className="group relative bg-card rounded-xl border shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-xs font-semibold px-2 py-1 bg-blue-50 text-blue-600 rounded-md uppercase">
                                            {typeMap[post.housingType] || post.housingType}
                                        </span>
                                        <span className="text-muted-foreground text-xs">{new Date(post.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <h3 className="font-semibold text-xl mb-2 group-hover:text-primary transition-colors">{post.title}</h3>
                                    <div className="flex items-center gap-2 text-muted-foreground text-sm mb-4">
                                        <MapPin className="h-4 w-4" />
                                        {post.location}
                                    </div>
                                    <div className="flex items-center justify-between pt-4 border-t">
                                        <p className="font-bold text-lg text-navy">${post.price}/mo</p>
                                        <span className="text-sm text-muted-foreground">{post.writer}</span>
                                    </div>
                                </div>
                                <Link to={`/market/housing/${post.id}`} className="absolute inset-0 z-10">
                                    <span className="sr-only">View Post</span>
                                </Link>
                            </div>
                        ))
                    ))}
                    <div ref={lastPostRef} className="h-10" />
                </div>
            )}
        </div>
    )
}
