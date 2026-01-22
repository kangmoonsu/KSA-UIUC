import { useAllPopups, useDeletePopup } from "@/lib/api/popup"
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
import { format } from "date-fns"
import { Plus, Edit, Trash2, ExternalLink } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/context/auth-context"

export function PopupManagement() {
    const { data: popups, status } = useAllPopups()
    const { mutate: deletePopup } = useDeletePopup()
    const navigate = useNavigate()
    const { user } = useAuth()

    if (user?.role !== "ADMIN" && user?.role !== "MASTER") {
        return <div className="container py-20 text-center">접근 권한이 없습니다.</div>
    }

    const handleDelete = (id: number) => {
        if (window.confirm("이 팝업을 삭제하시겠습니까?")) {
            deletePopup(id, {
                onSuccess: () => toast.success("팝업이 삭제되었습니다"),
                onError: () => toast.error("삭제에 실패했습니다")
            })
        }
    }

    if (status === "pending") return <div className="container py-20 text-center">로딩 중...</div>
    if (status === "error") return <div className="container py-20 text-center text-red-500">오류가 발생했습니다.</div>

    return (
        <div className="container max-w-7xl mx-auto py-10 px-4">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-navy">팝업 관리</h1>
                    <p className="text-muted-foreground mt-2">홈페이지 팝업 공지사항을 관리합니다.</p>
                </div>
                <Button className="gap-2" onClick={() => navigate("/admin/popups/new")}>
                    <Plus className="h-4 w-4" /> 팝업 추가
                </Button>
            </div>

            <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50/50">
                        <TableRow>
                            <TableHead className="w-[80px] text-center">상태</TableHead>
                            <TableHead>제목</TableHead>
                            <TableHead className="w-[120px] text-center">종료 일시</TableHead>
                            <TableHead className="w-[120px] text-center">작성자</TableHead>
                            <TableHead className="w-[150px] text-center">관리</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {popups?.map((popup) => (
                            <TableRow key={popup.id} className="hover:bg-slate-50/50">
                                <TableCell className="text-center py-4">
                                    <Badge
                                        variant={popup.active ? "default" : "secondary"}
                                        className={popup.active ? "bg-green-500 hover:bg-green-600 border-none text-white" : ""}
                                    >
                                        {popup.active ? "활성" : "비활성"}
                                    </Badge>
                                </TableCell>
                                <TableCell className="py-4">
                                    <div className="flex flex-col">
                                        <span className="font-medium text-slate-900">{popup.title}</span>
                                        {popup.linkUrl && (
                                            <a
                                                href={popup.linkUrl}
                                                target="_blank"
                                                className="text-xs text-blue-500 flex items-center gap-1 hover:underline mt-1"
                                                rel="noreferrer"
                                            >
                                                링크 열기 <ExternalLink className="h-3 w-3" />
                                            </a>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="text-center text-slate-600 text-sm py-4">
                                    {format(new Date(popup.endDate), "yyyy.MM.dd HH:mm")}
                                </TableCell>
                                <TableCell className="text-center text-slate-500 text-sm py-4">{popup.creatorNickname}</TableCell>
                                <TableCell className="text-center py-4">
                                    <div className="flex justify-center gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => navigate(`/admin/popups/${popup.id}/edit`)}
                                        >
                                            <Edit className="h-4 w-4 text-slate-600" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                            onClick={() => handleDelete(popup.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                        {popups?.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-20 text-muted-foreground">
                                    등록된 팝업이 없습니다.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
