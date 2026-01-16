import { Button } from "@/components/ui/button"
import { Mail } from "lucide-react"

export function BannedPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
            <div className="bg-red-50 p-8 rounded-2xl border border-red-100 max-w-md w-full shadow-sm">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Mail className="h-8 w-8 text-red-600" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900 mb-2">계정이 정지되었습니다</h1>
                <p className="text-slate-600 mb-8 leading-relaxed">
                    활동 정책 위반으로 인해 계정이 정지되었습니다.<br />
                    궁금하신 점이 있거나 소명이 필요하신 경우 관리자에게 이메일로 문의해 주세요.
                </p>
                <div className="space-y-3">
                    <Button
                        className="w-full bg-red-600 hover:bg-red-700"
                        onClick={() => window.location.href = 'mailto:admin@illinoisksa.org'}
                    >
                        관리자에게 메일 보내기
                    </Button>
                    <Button
                        variant="ghost"
                        className="w-full text-slate-500 hover:text-slate-700"
                        onClick={() => window.location.href = '/'}
                    >
                        홈으로 돌아가기
                    </Button>
                </div>
                <p className="mt-8 text-xs text-slate-400">
                    KSA Community Administration Support
                </p>
            </div>
        </div>
    )
}
