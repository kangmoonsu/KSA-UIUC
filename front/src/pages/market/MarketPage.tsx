
export default function MarketPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Flea Market</h1>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Placeholders for items */}
                <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                    Item 1
                </div>
                <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                    Item 2
                </div>
            </div>
        </div>
    )
}
