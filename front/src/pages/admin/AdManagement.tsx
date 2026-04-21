import { useAds, useDeleteAd } from "@/lib/api/ad";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Plus, Edit2, Trash2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export function AdManagement() {
    const { data: ads, isLoading } = useAds();
    const deleteAdMutation = useDeleteAd();

    const handleDelete = async (id: number) => {
        if (!confirm("정말 이 광고를 삭제하시겠습니까?")) return;

        try {
            await deleteAdMutation.mutateAsync(id);
            toast.success("광고가 삭제되었습니다.");
        } catch (error) {
            toast.error("광고 삭제에 실패했습니다.");
        }
    };

    if (isLoading) {
        return <div className="container max-w-7xl mx-auto py-10 px-4 text-center">로딩 중...</div>;
    }

    return (
        <div className="container max-w-7xl mx-auto py-10 px-4">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-navy">광고 관리</h1>
                    <p className="text-muted-foreground mt-2">메인 페이지의 4슬롯 광고를 관리합니다.</p>
                </div>
                <Button asChild>
                    <Link to="/admin/ads/new">
                        <Plus className="w-4 h-4 mr-2" /> 새 광고 추가
                    </Link>
                </Button>
            </div>

            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">순서</TableHead>
                            <TableHead>이미지</TableHead>
                            <TableHead>이동 URL</TableHead>
                            <TableHead>상태</TableHead>
                            <TableHead>작성자</TableHead>
                            <TableHead className="text-right">작업</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {ads?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                                    등록된 광고가 없습니다.
                                </TableCell>
                            </TableRow>
                        ) : (
                            ads?.map((ad) => (
                                <TableRow key={ad.id}>
                                    <TableCell className="font-medium">{ad.orderIndex}</TableCell>
                                    <TableCell>
                                        <div className="w-32 aspect-8/3 rounded-md overflow-hidden bg-slate-100 border">
                                            <img src={ad.imageUrl} alt="Ad Thumbnail" className="w-full h-full object-cover" />
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 max-w-[200px] truncate">
                                            <span className="truncate">{ad.targetUrl}</span>
                                            <a href={ad.targetUrl} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-navy">
                                                <ExternalLink className="w-3 h-3" />
                                            </a>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={ad.active ? "default" : "secondary"}>
                                            {ad.active ? "활성" : "비활성"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{ad.creatorNickname}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" asChild>
                                                <Link to={`/admin/ads/${ad.id}/edit`}>
                                                    <Edit2 className="w-4 h-4" />
                                                </Link>
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(ad.id)}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
