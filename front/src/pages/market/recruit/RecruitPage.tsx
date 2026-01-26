import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/context/auth-context"
import { Plus } from "lucide-react"
import { isAfter, subHours, format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { useRecruitPosts } from "@/lib/api/recruit"
import type { RecruitPostResponseDto } from "@/types/recruit"
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

export function RecruitPage() {
    const navigate = useNavigate()
    const { user } = useAuth()
    const [page, setPage] = useState(0)
    const { data, status } = useRecruitPosts(page)

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
                    <h1 className="text-3xl font-bold text-navy mb-2">취업정보</h1>
                    <p className="text-muted-foreground">다양한 기업의 채용공고를 확인하세요.</p>
                </div>
                {canWrite && (
                    <Button className="gap-2" onClick={() => {
                        navigate("/market/recruit/new")
                    }}>
                        <Plus className="h-4 w-4" />
                        공고 등록
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
                                    <TableHead className="w-[150px] text-center">기업명</TableHead>
                                    <TableHead className="w-[100px] text-center">지역</TableHead>
                                    <TableHead className="w-[120px] text-center">등록일</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data?.content.map((post: RecruitPostResponseDto, index: number) => (
                                    <TableRow
                                        key={post.id}
                                        className="cursor-pointer hover:bg-slate-50/50"
                                        onClick={() => navigate(`/market/recruit/${post.id}`)}
                                    >
                                        <TableCell className="text-center font-medium text-muted-foreground">
                                            {getRowNumber(index)}
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <div className="space-y-1.5">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-slate-900 group-hover:text-primary transition-colors">
                                                        {post.title}
                                                    </span>
                                                    {isNew(post.createdDate) && (
                                                        <Badge variant="destructive" className="bg-rose-500 hover:bg-rose-500 text-[10px] px-1 py-0 h-4">New</Badge>
                                                    )}
                                                </div>
                                                <div className="flex flex-wrap gap-1">
                                                    {post.roles.slice(0, 3).map((role, idx) => (
                                                        <Badge key={idx} variant="secondary" className="font-normal text-xs px-1.5 py-0 bg-slate-100 text-slate-600 hover:bg-slate-200">
                                                            {role}
                                                        </Badge>
                                                    ))}
                                                    {post.roles.length > 3 && (
                                                        <span className="text-xs text-muted-foreground self-center">+{post.roles.length - 3}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center font-medium text-primary">
                                            {post.companyName}
                                        </TableCell>
                                        <TableCell className="text-center text-sm text-muted-foreground">
                                            {post.location}
                                        </TableCell>
                                        <TableCell className="text-center text-sm text-muted-foreground">
                                            {format(new Date(post.createdDate), 'yyyy.MM.dd')}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {data?.content.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center">
                                            등록된 공고가 없습니다.
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

                                    {/* Simple Pagination Logic: Show all pages if <= 10, otherwise just simple generic for now or implement smart windowing */}
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
