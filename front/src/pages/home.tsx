import { AdSection } from "@/components/home/AdSection";
import { NewsCarousel } from "@/components/home/NewsCarousel";
import { MarketCarousel } from "@/components/home/MarketCarousel";
import { HousingCarousel } from "@/components/home/HousingCarousel";

export function HomePage() {
    return (
        <div className="flex flex-col items-center w-full bg-white pb-20">
            {/* Hero Section - Clean & Minimal */}
            <section className="w-full pt-16 md:pt-24 lg:pt-32 pb-12 flex flex-col items-center text-center px-4 animate-in fade-in duration-700 slide-in-from-bottom-4">
                <div className="space-y-6 max-w-4xl">
                    <div className="inline-block rounded-full bg-orange/10 px-4 py-1.5 text-sm font-semibold text-orange mb-4">
                        샴페인-어바나 한인들을 위한
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
            </section>

            <div className="w-full space-y-12">
                <AdSection />
                <NewsCarousel />
                <MarketCarousel />
                <HousingCarousel />
            </div>
        </div>
    )
}
