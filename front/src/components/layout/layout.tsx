import { Navbar } from "./Navbar"
import { Footer } from "./footer"
import { Outlet } from "react-router-dom"

export function Layout() {
    return (
        <div className="relative flex min-h-screen flex-col font-sans antialiased text-foreground bg-background">
            <Navbar />
            <main className="flex-1 w-full flex flex-col">
                <Outlet />
            </main>
            <Footer />
        </div>
    )
}
