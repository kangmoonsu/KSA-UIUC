import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { executiveService } from "@/lib/api/executive-service"
import type { ExecutiveMember } from "@/lib/api/executive-service"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Plus, Edit2, Trash2, ChevronLeft } from "lucide-react"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import { ExecutiveModal } from "./ExecutiveModal"

export function HistoryPage() {
    const { user, isAuthenticated } = useAuth()
    const isAdmin = isAuthenticated && (user?.role === 'ADMIN' || user?.role === 'MASTER')
    const queryClient = useQueryClient()

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedMember, setSelectedMember] = useState<ExecutiveMember | undefined>(undefined)

    const { data: groupedMembers, isLoading } = useQuery({
        queryKey: ["pastExecutives"],
        queryFn: executiveService.getPastExecutives
    })

    const deleteMutation = useMutation({
        mutationFn: executiveService.deleteExecutive,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pastExecutives"] })
            toast.success("임원진 정보가 삭제되었습니다.")
        },
        onError: () => toast.error("삭제에 실패했습니다.")
    })

    const handleAdd = () => {
        setSelectedMember(undefined)
        setIsModalOpen(true)
    }

    const handleEdit = (member: ExecutiveMember) => {
        setSelectedMember(member)
        setIsModalOpen(true)
    }

    const handleDelete = (id: number) => {
        if (window.confirm("정말 삭제하시겠습니까?")) {
            deleteMutation.mutate(id)
        }
    }

    // Sort periods desc
    const periods = groupedMembers ? Object.keys(groupedMembers).sort((a, b) => b.localeCompare(a)) : []

    return (
        <div className="bg-background min-h-screen">
            <div className="container max-w-3xl mx-auto py-12 px-4">
                {/* Back Button */}
                <div className="mb-10">
                    <Link to="/ksa/executives">
                        <Button variant="ghost" className="rounded-full gap-2 text-slate-500 hover:text-slate-900 px-4">
                            <ChevronLeft className="w-4 h-4" /> 돌아가기
                        </Button>
                    </Link>
                </div>

                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-extrabold text-[#002855] mb-6">역대 임원진</h1>
                    <p className="text-slate-500 font-medium leading-relaxed">
                        KSA는 매년 많은 학생들의 자발적인 참여와 헌신으로 운영되고 있습니다.<br />
                        지금의 KSA가 있기까지 함께해 준 모든 임원진 분들께 진심으로 감사드립니다.
                    </p>
                    {isAdmin && (
                        <Button onClick={handleAdd} className="mt-8 bg-[#E84A27] hover:bg-[#E84A27]/90 text-white rounded-full">
                            <Plus className="w-4 h-4 mr-2" /> 과거 기록 추가
                        </Button>
                    )}
                </div>

                {/* List of Years */}
                <div className="space-y-4">
                    {isLoading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-14 bg-slate-50 rounded-xl animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        periods.map((period, idx) => (
                            <details key={period} className="group overflow-hidden rounded-xl bg-slate-50 border border-transparent open:bg-white open:border-slate-200 open:shadow-lg transition-all" open={idx === 0}>
                                <summary className="flex items-center justify-between p-5 cursor-pointer list-none font-bold text-slate-600 group-open:text-[#002855] group-open:border-b transition-colors select-none">
                                    <span className="text-base">{period}</span>
                                    <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center group-open:rotate-180 transition-transform">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="6 9 12 15 18 9"></polyline>
                                        </svg>
                                    </div>
                                </summary>
                                <div className="p-6 bg-white animate-in slide-in-from-top-2 duration-300">
                                    <ul className="divide-y divide-slate-100">
                                        {groupedMembers![period].map((member) => (
                                            <li key={member.id} className="py-4 flex items-center justify-between group/item">
                                                <div className="flex gap-4">
                                                    <span className="font-bold text-slate-400 min-w-[80px]">{member.position}</span>
                                                    <span className="text-slate-900 font-medium">{member.name}</span>
                                                </div>
                                                {isAdmin && (
                                                    <div className="flex gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-slate-400 hover:text-slate-900"
                                                            onClick={() => handleEdit(member)}
                                                        >
                                                            <Edit2 className="w-3.5 h-3.5" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-slate-400 hover:text-red-500"
                                                            onClick={() => handleDelete(member.id)}
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </details>
                        ))
                    )}
                </div>
            </div>

            {/* Admin Edit Modal */}
            {isAdmin && isModalOpen && (
                <ExecutiveModal
                    open={isModalOpen}
                    onOpenChange={setIsModalOpen}
                    member={selectedMember}
                    isCurrent={selectedMember?.isCurrent}
                />
            )}
        </div>
    )
}
