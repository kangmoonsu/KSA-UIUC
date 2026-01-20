import { useState } from "react"
import { useFreePosts } from "@/lib/api/community"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useNavigate } from "react-router-dom"
import { format, isAfter, subHours } from "date-fns"
import { Plus } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { toast } from "sonner"
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"

export function FreeBoardList() {
    const [page, setPage] = useState(0)
    const { data, status } = useFreePosts(page)
    const { isAuthenticated } = useAuth()
    const navigate = useNavigate()

    const isNew = (createdAt: string) => {
        const postDate = new Date(createdAt)
        const dayAgo = subHours(new Date(), 24)
        return isAfter(postDate, dayAgo)
    }

    if (status === "pending") return <div className="container max-w-7xl mx-auto py-20 text-center">로딩 중...</div>
    if (status === "error") return <div className="container max-w-7xl mx-auto py-20 text-center text-red-500">오류가 발생했습니다.</div>

    return (
        <div className="container max-w-7xl mx-auto py-10 px-4">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-navy">자유게시판</h1>
                    <p className="text-muted-foreground mt-2">다양한 주제로 소통해보세요.</p>
                </div>
                <Button className="gap-2" onClick={() => {
                    if (isAuthenticated) {
                        navigate("/community/free/new")
                    } else {
                        toast.error("로그인 후 이용해주세요")
                    }
                }}>
                    <Plus className="h-4 w-4" /> 글쓰기
                </Button>
            </div>

            <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50/50">
                        <TableRow>
                            <TableHead className="w-[100px] text-center">번호</TableHead>
                            <TableHead>제목</TableHead>
                            <TableHead className="w-[150px] text-center">작성자</TableHead>
                            <TableHead className="w-[150px] text-center">작성일</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {/* Notices First */}
                        {data?.notices.map((post) => (
                            <TableRow key={post.id} className="cursor-pointer hover:bg-slate-50/50 bg-slate-50/30" onClick={() => navigate(`/community/free/${post.id}`)}>
                                <TableCell className="text-center font-medium py-4">
                                    <span className="text-rose-500 font-bold">공지</span>
                                </TableCell>
                                <TableCell className="py-4">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-slate-900">{post.title}</span>
                                        {isNew(post.createdAt) && (
                                            <Badge variant="destructive" className="bg-rose-500 hover:bg-rose-500 text-[10px] px-1 py-0 h-4">
                                                New
                                            </Badge>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="text-center text-slate-600 py-4 font-medium">{post.author}</TableCell>
                                <TableCell className="text-center text-slate-400 text-sm py-4">
                                    {isNew(post.createdAt)
                                        ? format(new Date(post.createdAt), "HH:mm")
                                        : format(new Date(post.createdAt), "yyyy.MM.dd")}
                                </TableCell>
                            </TableRow>
                        ))}

                        {/* Regular Posts */}
                        {data?.posts.content.map((post, index) => (
                            <TableRow key={post.id} className="cursor-pointer hover:bg-slate-50/50" onClick={() => navigate(`/community/free/${post.id}`)}>
                                <TableCell className="text-center font-medium py-4">
                                    <span className="text-muted-foreground">
                                        {data.posts.totalElements - (data.posts.number * data.posts.size) - index}
                                    </span>
                                </TableCell>
                                <TableCell className="py-4">
                                    <div className="flex items-center gap-2">
                                        <span className="text-slate-700">{post.title}</span>
                                        {isNew(post.createdAt) && (
                                            <Badge variant="destructive" className="bg-rose-500 hover:bg-rose-500 text-[10px] px-1 py-0 h-4">
                                                New
                                            </Badge>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="text-center text-slate-600 py-4">{post.author}</TableCell>
                                <TableCell className="text-center text-slate-400 text-sm py-4">
                                    {isNew(post.createdAt)
                                        ? format(new Date(post.createdAt), "HH:mm")
                                        : format(new Date(post.createdAt), "yyyy.MM.dd")}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {data && data.posts.totalPages > 1 && (
                <div className="mt-8">
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    onClick={() => setPage(p => Math.max(0, p - 1))}
                                    className={page === 0 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                />
                            </PaginationItem>

                            {Array.from({ length: data.posts.totalPages }).map((_, i) => (
                                <PaginationItem key={i}>
                                    <PaginationLink
                                        isActive={page === i}
                                        onClick={() => setPage(i)}
                                        className="cursor-pointer"
                                    >
                                        {i + 1}
                                    </PaginationLink>
                                </PaginationItem>
                            ))}

                            <PaginationItem>
                                <PaginationNext
                                    onClick={() => setPage(p => Math.min(data.posts.totalPages - 1, p + 1))}
                                    className={page === data.posts.totalPages - 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}
        </div>
    )
}
