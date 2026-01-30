import type { ReactNode } from "react";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

interface PostCarouselProps {
    title: string;
    description?: string;
    icon?: ReactNode;
    viewAllUrl: string;
    children: ReactNode;
    isLoading?: boolean;
}

export function PostCarousel({
    title,
    description,
    icon,
    viewAllUrl,
    children,
    isLoading,
}: PostCarouselProps) {
    return (
        <section className="w-full max-w-7xl mx-auto px-4 py-12">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    {icon && (
                        <div className="w-10 h-10 rounded-xl bg-orange/10 flex items-center justify-center text-orange">
                            {icon}
                        </div>
                    )}
                    <div>
                        <h2 className="text-2xl font-bold text-navy">{title}</h2>
                        {description && (
                            <p className="text-muted-foreground mt-1">{description}</p>
                        )}
                    </div>
                </div>
                <Button variant="ghost" className="text-muted-foreground hover:text-navy" asChild>
                    <Link to={viewAllUrl} className="flex items-center gap-1">
                        바로가기 <ChevronRight className="w-4 h-4" />
                    </Link>
                </Button>
            </div>

            <Carousel
                opts={{
                    align: "start",
                    loop: true,
                }}
                className="w-full relative"
            >
                <CarouselContent className="-ml-4">
                    {isLoading ? (
                        // Skeleton loading
                        [...Array(4)].map((_, i) => (
                            <CarouselItem key={i} className="pl-4 basis-full sm:basis-1/2 lg:basis-1/4">
                                <div className="h-[380px] rounded-2xl bg-slate-100 animate-pulse" />
                            </CarouselItem>
                        ))
                    ) : (
                        children
                    )}
                </CarouselContent>
            </Carousel>
        </section>
    );
}
