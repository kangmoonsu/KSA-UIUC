import { useQuery } from "@tanstack/react-query";
import client from "@/lib/api/client";
import { PostCarousel } from "./PostCarousel";
import { CarouselItem } from "@/components/ui/carousel";
import { Link } from "react-router-dom";
import { Newspaper } from "lucide-react";

interface NewsPost {
    id: number;
    title: string;
    content: string;
    createdAt: string;
    author: string;
    viewCount: number;
}

export function NewsCarousel() {
    const { data: posts, isLoading } = useQuery<NewsPost[]>({
        queryKey: ["latestNews"],
        queryFn: async () => {
            const response = await client.get("/news/latest?limit=5");
            return response.data;
        },
    });

    return (
        <PostCarousel
            title="KSA 뉴스"
            description="한인 학생회의 최신 소식을 전해드립니다."
            icon={<Newspaper className="w-6 h-6" />}
            viewAllUrl="/community/news"
            isLoading={isLoading}
        >
            {posts?.map((post) => (
                <CarouselItem key={post.id} className="pl-4 basis-full sm:basis-1/2 lg:basis-1/4">
                    <Link to={`/community/news/${post.id}`}>
                        <div className="group h-full bg-slate-50 rounded-2xl p-6 border border-slate-100 transition-all hover:shadow-lg hover:border-orange/20 flex flex-col">
                            <div className="flex-1">
                                <span className="text-xs font-semibold text-orange mb-2 block uppercase tracking-wider">Announcement</span>
                                <h3 className="text-xl font-bold text-navy line-clamp-2 leading-snug group-hover:text-orange transition-colors">
                                    {post.title}
                                </h3>
                                <div className="mt-4 text-sm text-muted-foreground line-clamp-3"
                                    dangerouslySetInnerHTML={{ __html: post.content.replace(/<[^>]*>?/gm, '') }}
                                />
                            </div>
                            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-muted-foreground">
                                <span>{post.author || 'Admin'}</span>
                                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </Link>
                </CarouselItem>
            ))}
        </PostCarousel>
    );
}
