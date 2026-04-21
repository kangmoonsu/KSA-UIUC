import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAd, useCreateAd, useUpdateAd } from "@/lib/api/ad";
import { useUploadImage } from "@/lib/api/market";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { ArrowLeft, Upload, Loader2, Image as ImageIcon } from "lucide-react";

export function AdForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;

    const { data: ad, isLoading: adLoading } = useAd(Number(id));
    const createAdMutation = useCreateAd();
    const updateAdMutation = useUpdateAd(Number(id));
    const uploadImageMutation = useUploadImage();

    const [imageUrl, setImageUrl] = useState("");
    const [targetUrl, setTargetUrl] = useState("");
    const [orderIndex, setOrderIndex] = useState(0);
    const [active, setActive] = useState(true);

    useEffect(() => {
        if (ad) {
            setImageUrl(ad.imageUrl);
            setTargetUrl(ad.targetUrl);
            setOrderIndex(ad.orderIndex);
            setActive(ad.active);
        }
    }, [ad]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const url = await uploadImageMutation.mutateAsync(file);
            setImageUrl(url);
            toast.success("이미지가 업로드되었습니다.");
        } catch (error) {
            toast.error("이미지 업로드에 실패했습니다.");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!imageUrl) {
            toast.error("광고 이미지를 업로드해주세요.");
            return;
        }

        if (!targetUrl) {
            toast.error("클릭 시 이동할 URL을 입력해주세요.");
            return;
        }

        let formattedUrl = targetUrl.trim();
        if (formattedUrl && !formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
            formattedUrl = `https://${formattedUrl}`;
        }

        const adData = {
            imageUrl,
            targetUrl: formattedUrl,
            orderIndex,
            active,
        };

        try {
            if (isEdit) {
                await updateAdMutation.mutateAsync(adData);
                toast.success("광고가 수정되었습니다.");
            } else {
                await createAdMutation.mutateAsync(adData);
                toast.success("광고가 등록되었습니다.");
            }
            navigate("/admin/ads");
        } catch (error) {
            toast.error("광고 저장에 실패했습니다.");
        }
    };

    if (isEdit && adLoading) {
        return <div className="container max-w-7xl mx-auto py-10 px-4 text-center">로딩 중...</div>;
    }

    return (
        <div className="container max-w-3xl mx-auto py-10 px-4">
            <Button variant="ghost" className="mb-6" onClick={() => navigate("/admin/ads")}>
                <ArrowLeft className="w-4 h-4 mr-2" /> 목록으로 돌아가기
            </Button>

            <div className="bg-white rounded-2xl border shadow-sm p-8">
                <h1 className="text-2xl font-bold text-navy mb-8">
                    {isEdit ? "광고 수정" : "새 광고 등록"}
                </h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <Label>광고 이미지 (추천 비율 2:1)</Label>
                        <div className="relative aspect-2/1 rounded-xl overflow-hidden bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center group">
                            {imageUrl ? (
                                <>
                                    <img src={imageUrl} alt="Ad Preview" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <Label htmlFor="image-upload" className="cursor-pointer bg-white text-navy px-4 py-2 rounded-lg font-medium flex items-center gap-2">
                                            <Upload className="w-4 h-4" /> 이미지 변경
                                        </Label>
                                    </div>
                                </>
                            ) : (
                                <Label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center gap-2 text-slate-400 hover:text-navy transition-colors">
                                    {uploadImageMutation.isPending ? (
                                        <Loader2 className="w-10 h-10 animate-spin" />
                                    ) : (
                                        <>
                                            <ImageIcon className="w-10 h-10" />
                                            <span className="text-sm font-medium">이미지 업로드</span>
                                        </>
                                    )}
                                </Label>
                            )}
                            <input
                                id="image-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageUpload}
                                disabled={uploadImageMutation.isPending}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="targetUrl">이동 URL</Label>
                        <Input
                            id="targetUrl"
                            placeholder="https://example.com"
                            value={targetUrl}
                            onChange={(e) => setTargetUrl(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="orderIndex">노출 순서</Label>
                            <Input
                                id="orderIndex"
                                type="number"
                                value={orderIndex}
                                onChange={(e) => setOrderIndex(Number(e.target.value))}
                            />
                            <p className="text-[10px] text-muted-foreground">낮은 번호가 먼저 표시됩니다.</p>
                        </div>

                        <div className="space-y-2">
                            <Label>활성화 상태</Label>
                            <div className="flex items-center h-10 gap-3">
                                <Checkbox
                                    id="active"
                                    checked={active}
                                    onCheckedChange={(checked: boolean) => setActive(checked)}
                                />
                                <Label htmlFor="active" className="text-sm text-slate-600 font-normal cursor-pointer">
                                    {active ? "활성" : "비활성"}
                                </Label>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <Button type="button" variant="outline" className="flex-1" onClick={() => navigate("/admin/ads")}>
                            취소
                        </Button>
                        <Button type="submit" className="flex-1" disabled={createAdMutation.isPending || updateAdMutation.isPending}>
                            {isEdit ? "수정완료" : "등록하기"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
