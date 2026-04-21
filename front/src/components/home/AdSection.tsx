import { useQuery } from "@tanstack/react-query";
import client from "@/lib/api/client";

interface Ad {
    id: number;
    imageUrl: string;
    targetUrl: string;
    orderIndex: number;
}

export function AdSection() {
    const { data: ads, isLoading } = useQuery<Ad[]>({
        queryKey: ["activeAds"],
        queryFn: async () => {
            const response = await client.get("/ads/active");
            return response.data;
        },
    });

    if (isLoading) {
        return (
            <div className="w-full max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="aspect-2/1 bg-slate-100 animate-pulse rounded-lg" />
                    ))}
                </div>
            </div>
        );
    }

    // Ensure we show at least 4 slots as per requirements, filling with placeholders if needed
    const displayAds = [...(ads || [])];
    while (displayAds.length < 4) {
        displayAds.push({
            id: -(displayAds.length + 1),
            imageUrl: "",
            targetUrl: "",
            orderIndex: displayAds.length,
        } as Ad);
    }

    return (
        <div className="w-full max-w-7xl mx-auto px-4 py-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {displayAds.slice(0, 4).map((ad) => (
                    <div key={ad.id} className="relative aspect-2/1 group overflow-hidden rounded-lg bg-slate-50 border border-slate-100 transition-all hover:shadow-md">
                        {ad.imageUrl ? (
                            <a
                                href={ad.targetUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block w-full h-full"
                            >
                                <img
                                    src={ad.imageUrl}
                                    alt="Advertisement"
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                            </a>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300 font-medium text-sm">
                                ADS
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
