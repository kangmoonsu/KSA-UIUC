import { useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { useAuth } from "@/context/auth-context"
import { Plus, MapPin, DollarSign } from "lucide-react"
import { isAfter, subHours } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { useJobPosts } from "@/lib/api/job"

export function JobPage() {
    const navigate = useNavigate()
    const { isAuthenticated, user } = useAuth()
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useJobPosts()
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
                    <h1 className="text-3xl font-bold text-navy mb-2">구인구직</h1>
                    <p className="text-muted-foreground">다양한 아르바이트와 일자리 정보를 찾아보세요.</p>
                </div>
                {(!user || user.role === 'USER') && (
                    <Button className="gap-2" onClick={() => {
                        if (isAuthenticated) {
                            navigate("/market/job/new")
                        } else {
                            toast.error("로그인 후 이용해주세요")
                        }
                    }}>
                        <Plus className="h-4 w-4" />
                        글쓰기
                    </Button>
                )}
            </div>

            {status === 'pending' ? (
                <div className="text-center py-20">로딩 중...</div>
            ) : status === 'error' ? (
                <div className="text-center py-20 text-red-500">데이터를 불러오는 중 오류가 발생했습니다.</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {data?.pages.map((page) => (
                        page.content.map((post) => {
                            let statusBadgeClass = "bg-blue-100 text-blue-700"
                            let statusText = "구인중"

                            if (post.status === 'CLOSED') {
                                statusBadgeClass = "bg-gray-100 text-gray-500"
                                statusText = "마감"
                            }

                            return (
                                <div key={post.id} className="group relative bg-card rounded-xl border shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
                                    <div className="p-6 flex-1">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex gap-2 items-center">
                                                {isNew(post.createdAt) && (
                                                    <Badge className="bg-rose-500 hover:bg-rose-500 border-none px-1.5 py-0 text-[10px] h-4">New</Badge>
                                                )}
                                                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusBadgeClass}`}>
                                                    {statusText}
                                                </span>
                                            </div>
                                            <span className="text-xs text-muted-foreground">{new Date(post.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <h3 className="font-semibold text-xl mb-3 group-hover:text-primary transition-colors line-clamp-2">{post.title}</h3>

                                        <div className="space-y-2 mb-4">
                                            <div className="flex items-center gap-2 text-sm text-gray-700">
                                                <DollarSign className="h-4 w-4 text-primary shrink-0" />
                                                <span className="font-medium">{post.salary}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <MapPin className="h-4 w-4 shrink-0" />
                                                <span>{post.location}</span>
                                            </div>
                                        </div>

                                    </div>
                                    <div className="px-6 py-4 border-t bg-muted/20 flex justify-between items-center text-sm">
                                        <div className="flex items-center gap-2">
                                            <span className="text-muted-foreground">작성자</span>
                                            <span className="font-medium text-navy">{post.writer}</span>
                                        </div>
                                    </div>

                                    <Link to={`/market/job/${post.id}`} className="absolute inset-0 z-10">
                                        <span className="sr-only">View Post</span>
                                    </Link>
                                </div>
                            )
                        })
                    ))}
                    <div ref={lastPostRef} className="h-10 w-full col-span-full" />
                </div>
            )}
            {isFetchingNextPage && <div className="text-center py-4 text-muted-foreground">더 불러오는 중...</div>}
        </div>
    )
}

