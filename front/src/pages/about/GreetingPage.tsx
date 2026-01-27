import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { greetingService } from "@/lib/api/greeting-service"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Edit2, Save, X } from "lucide-react"
import { toast } from "sonner"
import { RichTextEditorWithImage } from "@/components/ui/rich-text-editor-with-image"

export function GreetingPage() {
    const { user, isAuthenticated } = useAuth()
    const isMaster = isAuthenticated && user?.role === 'MASTER'
    const queryClient = useQueryClient()
    const [isEditing, setIsEditing] = useState(false)
    const [editContent, setEditContent] = useState("")

    const { data: content, isLoading } = useQuery({
        queryKey: ["greeting"],
        queryFn: greetingService.getGreeting
    })

    const mutation = useMutation({
        mutationFn: greetingService.updateGreeting,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["greeting"] })
            toast.success("인사말이 수정되었습니다.")
            setIsEditing(false)
        },
        onError: () => toast.error("수정에 실패했습니다.")
    })

    const handleEditStart = () => {
        setEditContent(content || "")
        setIsEditing(true)
    }

    const handleSave = () => {
        mutation.mutate(editContent)
    }

    if (isLoading) {
        return (
            <div className="container max-w-4xl mx-auto py-20 px-4">
                <div className="h-8 w-48 bg-slate-100 animate-pulse mb-8 rounded" />
                <div className="space-y-4">
                    <div className="h-4 w-full bg-slate-50 animate-pulse rounded" />
                    <div className="h-4 w-3/4 bg-slate-50 animate-pulse rounded" />
                    <div className="h-4 w-5/6 bg-slate-50 animate-pulse rounded" />
                </div>
            </div>
        )
    }

    return (
        <div className="bg-background min-h-screen pb-20">
            <div className="container max-w-4xl mx-auto px-4 pt-16">
                <div className="flex justify-between items-center mb-12 border-b pb-6">
                    <h1 className="text-3xl font-extrabold text-[#002855]">인사말</h1>
                    {isMaster && !isEditing && (
                        <Button onClick={handleEditStart} variant="outline" className="rounded-full gap-2">
                            <Edit2 className="w-4 h-4" /> 수정하기
                        </Button>
                    )}
                </div>

                {isEditing ? (
                    <div className="space-y-6">
                        <RichTextEditorWithImage
                            value={editContent}
                            onChange={setEditContent}
                            className="border rounded-xl overflow-hidden shadow-sm"
                        />
                        <div className="flex justify-end gap-3">
                            <Button variant="ghost" onClick={() => setIsEditing(false)} className="rounded-full">
                                <X className="w-4 h-4 mr-2" /> 취소
                            </Button>
                            <Button
                                onClick={handleSave}
                                disabled={mutation.isPending}
                                className="bg-[#002855] hover:bg-[#002855]/90 text-white rounded-full px-8"
                            >
                                <Save className="w-4 h-4 mr-2" /> 저장하기
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="prose prose-slate max-w-none">
                        {content ? (
                            <div
                                className="greeting-content"
                                dangerouslySetInnerHTML={{ __html: content }}
                            />
                        ) : (
                            <div className="py-20 text-center text-slate-400 font-medium italic">
                                등록된 인사말이 없습니다.
                            </div>
                        )}
                    </div>
                )}
            </div>

            <style>
                {`
                .greeting-content img {
                    max-width: 100%;
                    height: auto;
                    border-radius: 1.5rem;
                    margin-bottom: 2rem;
                    box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
                }
                .greeting-content p {
                    font-size: 1.125rem;
                    line-height: 1.8;
                    color: #475569;
                    margin-bottom: 1.5rem;
                    white-space: pre-wrap;
                }
                .greeting-content strong {
                    color: #0f172a;
                }
                .ql-align-center {
                    text-align: center;
                }
                .ql-align-right {
                    text-align: right;
                }
                .ql-align-justify {
                    text-align: justify;
                }
                .greeting-content img {
                    display: block;
                    margin-left: auto;
                    margin-right: auto;
                }
                `}
            </style>
        </div>
    )
}
