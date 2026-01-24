import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/context/auth-context"
import { Plus } from "lucide-react"
import { isAfter, subHours, format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { useConsultingPosts } from "@/lib/api/consulting"
import type { ConsultingPostResponseDto } from "@/types/consulting"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"

export function ConsultingPage() {
    const navigate = useNavigate()
    const { user } = useAuth()
    const [page, setPage] = useState(0)
    const { data, status } = useConsultingPosts(page)

    const isNew = (createdAt: string) => {
        const postDate = new Date(createdAt)
        const dayAgo = subHours(new Date(), 24)
        return isAfter(postDate, dayAgo)
    }

    const canWrite = user && (user.role === 'ADMIN' || user.role === 'MASTER');

    // Calculate row number (descending)
    const getRowNumber = (index: number) => {
        if (!data) return 0;
        return data.totalElements - (data.number * data.size) - index;
    }

    return (
        <div className="container max-w-7xl mx-auto py-10 px-4">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-navy mb-2">채용설명회/상담</h1>
                    <p className="text-muted-foreground">기업 설명회 및 상담 일정을 확인하세요.</p>
                </div>
                {canWrite && (
                    <Button className="gap-2" onClick={() => {
                        navigate("/job/consulting/new")
                    }}>
                        <Plus className="h-4 w-4" />
                        일정 등록
                    </Button>
                )}
            </div>

            {status === 'pending' ? (
                <div className="text-center py-20">로딩 중...</div>
            ) : status === 'error' ? (
                <div className="text-center py-20 text-red-500">데이터를 불러오는 중 오류가 발생했습니다.</div>
            ) : (
                <div className="space-y-6">
                    <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
                        <Table>
                            <TableHeader className="bg-slate-50/50">
                                <TableRow>
                                    <TableHead className="w-[80px] text-center">번호</TableHead>
                                    <TableHead>제목</TableHead>
                                    <TableHead className="w-[150px] text-center">일시</TableHead>
                                    <TableHead className="w-[150px] text-center">장소</TableHead>
                                    <TableHead className="w-[120px] text-center">등록일</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data?.content.map((post: ConsultingPostResponseDto, index: number) => (
                                    <TableRow
                                        key={post.id}
                                        className="cursor-pointer hover:bg-slate-50/50"
                                        onClick={() => navigate(`/job/consulting/${post.id}`)}
                                    >
                                        <TableCell className="text-center font-medium text-muted-foreground">
                                            {getRowNumber(index)}
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-slate-900 group-hover:text-primary transition-colors">
                                                    {post.title}
                                                </span>
                                                {isNew(post.createdDate) && (
                                                    <Badge variant="destructive" className="bg-rose-500 hover:bg-rose-500 text-[10px] px-1 py-0 h-4">New</Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center text-sm text-navy font-medium">
                                            {post.eventDate ? format(new Date(post.eventDate), 'yyyy.MM.dd') : '-'}
                                        </TableCell>
                                        <TableCell className="text-center text-sm text-muted-foreground truncate max-w-[150px]">
                                            {post.location || '-'}
                                        </TableCell>
                                        <TableCell className="text-center text-sm text-muted-foreground">
                                            {format(new Date(post.createdDate), 'yyyy.MM.dd')}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {data?.content.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            등록된 일정이 없습니다.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {data && data.totalPages > 1 && (
                        <div className="flex justify-center">
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            onClick={() => setPage(p => Math.max(0, p - 1))}
                                            className={page === 0 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                        />
                                    </PaginationItem>

                                    {Array.from({ length: Math.min(10, data.totalPages) }).map((_, i) => (
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
                                            onClick={() => setPage(p => Math.min(data.totalPages - 1, p + 1))}
                                            className={page === data.totalPages - 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
