import { useQuery } from "@tanstack/react-query";
import client from "@/lib/api/client";
import { PostCarousel } from "./PostCarousel";
import { CarouselItem } from "@/components/ui/carousel";
import { Link } from "react-router-dom";
import { Home, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface HousingPost {
    id: number;
    title: string;
    price: number;
    location: string;
    housingType: string;
    status: string;
    imageUrls: string[];
    writer: string;
    createdAt: string;
}

export function HousingCarousel() {
    const { data: posts, isLoading } = useQuery<HousingPost[]>({
        queryKey: ["latestHousing"],
        queryFn: async () => {
            const response = await client.get("/housings/latest?limit=4");
            return response.data;
        },
    });

    return (
        <PostCarousel
            title="하우징"
            description="너에게 딱 맞는 집을 찾아줄게. 캠퍼스 근처 매물을 확인해보세요."
            icon={<Home className="w-6 h-6" />}
            viewAllUrl="/market/housing"
            isLoading={isLoading}
        >
            {posts?.map((post) => (
                <CarouselItem key={post.id} className="pl-4 basis-full sm:basis-1/2 lg:basis-1/4">
                    <Link to={`/market/housing/${post.id}`}>
                        <div className="group h-full bg-white rounded-2xl overflow-hidden border border-slate-100 transition-all hover:shadow-xl flex flex-col">
                            <div className="aspect-16/10 overflow-hidden bg-slate-100 relative">
                                {post.imageUrls && post.imageUrls.length > 0 ? (
                                    <img
                                        src={post.imageUrls[0]}
                                        alt={post.title}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                                        <Home className="w-12 h-12" />
                                    </div>
                                )}
                                <Badge className="absolute top-4 left-4 bg-orange text-white border-none px-3 py-1">
                                    {post.housingType}
                                </Badge>
                            </div>
                            <div className="p-5 flex-1 flex flex-col">
                                <h3 className="text-lg font-bold text-navy line-clamp-1 mb-2 group-hover:text-orange transition-colors">
                                    {post.title}
                                </h3>
                                <div className="flex items-center gap-1 text-muted-foreground text-sm mb-4">
                                    <MapPin className="w-3.5 h-3.5" />
                                    <span className="truncate">{post.location}</span>
                                </div>
                                <div className="mt-auto flex items-center justify-between pt-3 border-t border-slate-50">
                                    <div className="flex flex-col">
                                        <span className="text-xs text-muted-foreground">Monthly</span>
                                        <span className="font-bold text-xl text-orange">
                                            ${post.price?.toLocaleString()}
                                        </span>
                                    </div>
                                    <Badge variant="outline" className={post.status === '완료' ? 'text-muted-foreground' : 'text-green-600 border-green-100 bg-green-50'}>
                                        {post.status || '구하는중'}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </Link>
                </CarouselItem>
            ))}
        </PostCarousel>
    );
}
