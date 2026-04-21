
import { Button } from "@/components/ui/button";

export default function HomePage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center space-y-6">
            <h1 className="text-4xl font-extrabold tracking-tighter sm:text-5xl md:text-6xl text-primary">
                UIUC Korean Student Association
            </h1>
            <p className="max-w-[700px] text-lg text-muted-foreground md:text-xl">
                Connecting the Korean community at UIUC. <br />
                Buy & Sell, Find Housing, Share Information.
            </p>
            <div className="flex gap-4">
                <Button size="lg" asChild>
                    <a href="/market">Browse Market</a>
                </Button>
                <Button size="lg" variant="outline" asChild>
                    <a href="/community/info">Community Info</a>
                </Button>
            </div>
        </div>
    );
}
