import { Button } from "@/components/ui/button"
import { ArrowRight, MessageCircle, Info, ShoppingBag, Home as HomeIcon } from "lucide-react"
import { Link } from "react-router-dom"
import { cn } from "@/lib/utils"

export function HomePage() {
    return (
        <div className="flex flex-col items-center w-full bg-white">
            {/* Hero Section - Clean & Minimal */}
            <section className="w-full py-20 md:py-32 lg:py-40 flex flex-col items-center text-center px-4 animate-in fade-in duration-700 slide-in-from-bottom-4">
                <div className="space-y-6 max-w-4xl">
                    <div className="inline-block rounded-full bg-orange/10 px-4 py-1.5 text-sm font-semibold text-orange mb-4">
                        UIUC 유학생을 위한 모든 것
                    </div>
                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-navy leading-[1.1]">
                        함께 나누고, 성장하는<br className="hidden sm:inline" />
                        <span className="text-orange">UIUC 한인 커뮤니티</span>
                    </h1>
                    <p className="mx-auto max-w-[600px] text-muted-foreground text-lg md:text-xl leading-relaxed">
                        정보 공유부터 중고 거래, 하우징까지.<br />
                        일리노이 한인들을 위한 커뮤니티입니다.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mt-10 w-full sm:w-auto">
                    <Button size="lg" className="bg-navy hover:bg-navy/90 text-white h-12 px-8 text-base rounded-full shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5">
                        커뮤니티 시작하기
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    <Button size="lg" variant="outline" className="h-12 px-8 text-base border-border bg-background hover:bg-accent rounded-full">
                        학생회 소개
                    </Button>
                </div>
            </section>

            {/* Features Grid - Card Style Refinement */}
            <section className="w-full max-w-7xl px-4 pb-24 md:pb-32">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    <FeatureCard
                        title="자유게시판"
                        description="시시콜콜한 이야기부터 학교 생활 꿀팁까지 자유롭게 나눠요."
                        href="/free"
                        icon={<MessageCircle className="h-7 w-7 text-white" />}
                        color="bg-purple-500"
                    />
                    <FeatureCard
                        title="정보게시판"
                        description="수강신청, 족보, 맛집 등 유학 생활에 꼭 필요한 정보들이에요."
                        href="/info"
                        icon={<Info className="h-7 w-7 text-white" />}
                        color="bg-blue-500"
                    />
                    <FeatureCard
                        title="중고장터"
                        description="이사 갈 때, 전공책 팔 때. 우리 학교 학생들과 안전하게 거래해요."
                        href="/market/flea"
                        icon={<ShoppingBag className="h-7 w-7 text-white" />}
                        color="bg-orange"
                    />
                    <FeatureCard
                        title="하우징"
                        description="믿을 수 있는 룸메이트와 쾌적한 보금자리를 찾아보세요."
                        href="/market/housing"
                        icon={<HomeIcon className="h-7 w-7 text-white" />}
                        color="bg-green-500"
                    />
                </div>
            </section>
        </div>
    )
}

function FeatureCard({ title, description, href, icon, color }: { title: string, description: string, href: string, icon: React.ReactNode, color: string }) {
    return (
        <Link to={href} className="group relative flex flex-col justify-between overflow-hidden rounded-4xl bg-gray-50 p-8 transition-all hover:bg-white hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-1 border border-transparent hover:border-gray-100">
            <div className="space-y-4">
                <div className={cn("inline-flex items-center justify-center rounded-2xl p-3 shadow-sm", color)}>
                    {icon}
                </div>
                <h3 className="font-bold text-xl text-navy">{title}</h3>
                <p className="text-muted-foreground leading-relaxed text-[15px]">{description}</p>
            </div>
            <div className="mt-8 flex items-center text-sm font-semibold text-gray-400 transition-colors group-hover:text-navy">
                바로가기 <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
        </Link>
    )
}
