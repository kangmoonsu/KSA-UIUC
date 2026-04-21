import { useQuery } from "@tanstack/react-query";
import client from "@/lib/api/client";
import { PostCarousel } from "./PostCarousel";
import { CarouselItem } from "@/components/ui/carousel";
import { Link } from "react-router-dom";
import { ShoppingBag, MapPin } from "lucide-react";

interface MarketPost {
    id: number;
    title: string;
    createdAt: string;
    writer: string;
    items: Array<{
        id: number;
        name: string;
        price: number;
        imageUrls: string[];
        status: string;
    }>;
}

export function MarketCarousel() {
    const { data: posts, isLoading } = useQuery<MarketPost[]>({
        queryKey: ["latestMarket"],
        queryFn: async () => {
            const response = await client.get("/flea/latest?limit=4");
            return response.data;
        },
    });

    return (
        <PostCarousel
            title="중고마켓"
            description="이사갈 때, 전공책 팔 때, 우리학교 학생들과 안전하게 거래해요."
            icon={<ShoppingBag className="w-6 h-6" />}
            viewAllUrl="/market/flea"
            isLoading={isLoading}
        >
            {posts?.map((post) => {
                const firstItem = post.items[0];
                const mainImage = firstItem?.imageUrls?.[0];

                return (
                    <CarouselItem key={post.id} className="pl-4 basis-full sm:basis-1/2 lg:basis-1/4">
                        <Link to={`/market/flea/${post.id}`}>
                            <div className="group h-full bg-white rounded-2xl overflow-hidden border border-slate-100 transition-all hover:shadow-xl flex flex-col">
                                <div className="aspect-4/3 overflow-hidden bg-slate-100 relative">
                                    {mainImage ? (
                                        <img
                                            src={mainImage}
                                            alt={firstItem.name}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                                            <ShoppingBag className="w-12 h-12" />
                                        </div>
                                    )}

                                </div>
                                <div className="p-5 flex-1 flex flex-col">
                                    <h3 className="text-lg font-bold text-navy line-clamp-1 mb-2 group-hover:text-orange transition-colors">
                                        {post.title}
                                    </h3>
                                    <div className="flex items-center gap-1 text-orange text-sm mb-3">
                                        <MapPin className="w-3.5 h-3.5" />
                                        <span>Illini Union</span>
                                    </div>
                                    <div className="mt-auto flex items-center justify-between pt-3 border-t border-slate-50">
                                        <span className="font-bold text-xl text-navy">
                                            ${firstItem?.price?.toLocaleString()}
                                        </span>
                                        <span className="text-xs text-muted-foreground lowercase">
                                            By {post.writer}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </CarouselItem>
                );
            })}
        </PostCarousel>
    );
}
