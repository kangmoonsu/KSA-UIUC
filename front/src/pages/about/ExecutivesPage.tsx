import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { executiveService } from "@/lib/api/executive-service"
import type { ExecutiveMember } from "@/lib/api/executive-service"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Plus, Edit2, Trash2, ArrowRight, History } from "lucide-react"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import { CarouselSection } from "./CarouselSection"
import { ExecutiveModal } from "./ExecutiveModal"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"

export function ExecutivesPage() {
    const { user, isAuthenticated } = useAuth()
    const isAdmin = isAuthenticated && (user?.role === 'ADMIN' || user?.role === 'MASTER')
    const queryClient = useQueryClient()

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedMember, setSelectedMember] = useState<ExecutiveMember | undefined>(undefined)

    // Detail View Modal State
    const [detailMember, setDetailMember] = useState<ExecutiveMember | null>(null)

    const { data: members, isLoading } = useQuery({
        queryKey: ["currentExecutives"],
        queryFn: executiveService.getCurrentExecutives
    })

    const deleteMutation = useMutation({
        mutationFn: executiveService.deleteExecutive,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["currentExecutives"] })
            toast.success("임원진 정보가 삭제되었습니다.")
        },
        onError: () => toast.error("삭제에 실패했습니다.")
    })

    const archiveMutation = useMutation({
        mutationFn: executiveService.archiveCurrentTerm,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["currentExecutives"] })
            queryClient.invalidateQueries({ queryKey: ["pastExecutives"] })
            toast.success("현재 임원진이 역대 임원진으로 이동되었습니다.")
        },
        onError: () => toast.error("처리 중 오류가 발생했습니다.")
    })

    const handleAdd = () => {
        setSelectedMember(undefined)
        setIsModalOpen(true)
    }

    const handleEdit = (e: React.MouseEvent, member: ExecutiveMember) => {
        e.stopPropagation()
        setSelectedMember(member)
        setIsModalOpen(true)
    }

    const handleDelete = (e: React.MouseEvent, id: number) => {
        e.stopPropagation()
        if (window.confirm("정말 삭제하시겠습니까?")) {
            deleteMutation.mutate(id)
        }
    }

    const handleArchive = () => {
        if (window.confirm("현재 등록된 모든 임원진을 '역대 임원진'으로 이동하시겠습니까? (새로운 학기 시작 시 사용)")) {
            archiveMutation.mutate()
        }
    }

    return (
        <div className="bg-background">
            {/* Intro Hero Section */}
            <section className="py-16 md:py-24 border-b">
                <div className="container max-w-7xl mx-auto px-4">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h1 className="text-4xl md:text-6xl font-extrabold text-[#002855] leading-tight mb-6">
                            <span className="text-[#E84A27]">UIUC</span> 한인학생회 KSA
                        </h1>
                        <p className="text-lg text-muted-foreground font-medium leading-relaxed">
                            낯선 환경 속에서도 작은 고민을 나누고, 따뜻한 한 끼를 함께할 수 있는 친구 같은 공간이 되겠습니다.
                        </p>
                    </div>

                    <div className="flex flex-col lg:flex-row items-stretch justify-center gap-12">
                        {/* Carousel Section */}
                        <div className="flex-1 w-full max-w-lg bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden flex flex-col">
                            <CarouselSection isAdmin={isAdmin} />
                        </div>

                        {/* Goals Card */}
                        <div className="flex-1 max-w-lg bg-white rounded-3xl p-10 shadow-xl border border-slate-100 relative text-center">
                            <div className="flex justify-center mb-6">
                                <div className="w-14 h-14 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-200">
                                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-[#002855] mb-8">우리의 목표</h3>
                            <ul className="space-y-4 text-left">
                                {[
                                    "유학생 생활의 어려움과 도전을 함께 나누기",
                                    "소통과 연대를 기반으로 한 활발한 커뮤니티 형성",
                                    "다양한 정보와 프로그램 제공",
                                    "학업, 진로, 네트워크 형성에 도움이 되는 이벤트 개최"
                                ].map((goal, i) => (
                                    <li key={i} className="flex items-start gap-4 text-slate-600 font-medium">
                                        <div className="mt-1 w-6 h-6 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center shrink-0">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="20 6 9 17 4 12"></polyline>
                                            </svg>
                                        </div>
                                        <span>{goal}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Current Executive Section */}
            <section className="py-20 md:py-28">
                <div className="container max-w-7xl mx-auto px-4">
                    <div className="flex items-center justify-between mb-12">
                        <div className="flex items-center gap-4">
                            <h2 className="text-3xl font-extrabold text-[#002855]">현재 임원진</h2>
                            {isAdmin && (
                                <div className="flex gap-2">
                                    <Button onClick={handleAdd} size="sm" className="bg-[#E84A27] hover:bg-[#E84A27]/90 text-white rounded-full h-8 px-3">
                                        <Plus className="w-4 h-4 mr-1" /> 추가
                                    </Button>
                                    <Button
                                        onClick={handleArchive}
                                        size="sm"
                                        variant="outline"
                                        className="rounded-full h-8 px-3 text-slate-500 hover:text-red-500 border-slate-300"
                                        disabled={archiveMutation.isPending}
                                    >
                                        <History className="w-4 h-4 mr-1" /> 임기 종료 (아카이브)
                                    </Button>
                                </div>
                            )}
                        </div>
                        <Link to="/ksa/history">
                            <Button variant="outline" className="rounded-full border-slate-300 text-slate-500 hover:text-slate-800 hover:border-slate-400 group">
                                역대 임원진 <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>
                    </div>

                    {isLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="aspect-[1/1.2] bg-slate-100 rounded-2xl animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {members?.map((member) => (
                                <div
                                    key={member.id}
                                    className="group relative aspect-[1/1.2] rounded-2xl overflow-hidden bg-slate-700 cursor-pointer hover:-translate-y-2 transition-all duration-300"
                                    onClick={() => setDetailMember(member)}
                                >
                                    {/* Background Image / Color */}
                                    {member.imageUrl ? (
                                        <img src={member.imageUrl} alt={member.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <div className="absolute inset-0 bg-slate-700 flex items-center justify-center">
                                            <span className="text-4xl font-bold text-white/20">{member.name[0]}</span>
                                        </div>
                                    )}

                                    {/* Overlay */}
                                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent group-hover:from-black/90 transition-all" />

                                    {/* Action Buttons (Admin Only) */}
                                    {isAdmin && (
                                        <div className="absolute top-4 left-4 flex gap-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                size="icon"
                                                variant="secondary"
                                                className="h-8 w-8 rounded-full bg-white/90"
                                                onClick={(e) => handleEdit(e, member)}
                                            >
                                                <Edit2 className="w-3.5 h-3.5 text-slate-700" />
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="destructive"
                                                className="h-8 w-8 rounded-full"
                                                onClick={(e) => handleDelete(e, member.id)}
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                    )}

                                    {/* Plus Icon (Design specific) */}
                                    <div className="absolute top-4 right-4 text-white/80 group-hover:text-white transition-colors">
                                        <Plus className="w-7 h-7" />
                                    </div>

                                    {/* Content */}
                                    <div className="absolute bottom-0 left-0 right-0 p-8">
                                        <h3 className="text-2xl font-bold text-white mb-1">{member.name}</h3>
                                        <p className="text-white/80 font-medium">{member.position}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Member Detail Dialog */}
            <Dialog open={!!detailMember} onOpenChange={(open) => !open && setDetailMember(null)}>
                <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border-none shadow-2xl">
                    <DialogHeader className="sr-only">
                        <DialogTitle>{detailMember?.name}</DialogTitle>
                        <DialogDescription>임원진 상세 정보</DialogDescription>
                    </DialogHeader>
                    {detailMember && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <div className="aspect-4/3 relative bg-slate-200">
                                {detailMember.imageUrl ? (
                                    <img src={detailMember.imageUrl} alt={detailMember.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-slate-400 flex items-center justify-center text-white/20 text-6xl font-bold">
                                        {detailMember.name[0]}
                                    </div>
                                )}
                            </div>
                            <div className="p-8">
                                <h3 className="text-2xl font-bold text-slate-900 mb-1">{detailMember.name}</h3>
                                <p className="text-lg font-bold text-slate-700 mb-6">{detailMember.position}</p>

                                <div className="space-y-3 border-t pt-6">
                                    <div className="flex gap-3">
                                        <span className="font-semibold text-slate-400 min-w-[120px]">Major:</span>
                                        <span className="text-slate-600">{detailMember.major || "-"}</span>
                                    </div>
                                    <div className="flex gap-3">
                                        <span className="font-semibold text-slate-400 min-w-[120px]">Email:</span>
                                        <span className="text-slate-600">{detailMember.email || "-"}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Admin Edit Modal */}
            {isAdmin && isModalOpen && (
                <ExecutiveModal
                    open={isModalOpen}
                    onOpenChange={setIsModalOpen}
                    member={selectedMember}
                    isCurrent={true}
                />
            )}
        </div>
    )
}
