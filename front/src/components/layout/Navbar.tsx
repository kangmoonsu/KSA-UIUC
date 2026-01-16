import { Link, useLocation, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Menu, ChevronDown } from "lucide-react"
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from "@/components/ui/sheet"
import { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bell } from "lucide-react"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import client from "@/lib/api/client"
import { Client, type IMessage } from "@stomp/stompjs"
import SockJS from "sockjs-client"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/context/auth-context"
import { useClerk } from "@clerk/clerk-react"

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false)
    const { user, logout, isAuthenticated } = useAuth()
    const { openSignIn } = useClerk()
    const location = useLocation()
    const navigate = useNavigate()
    const [unreadCount, setUnreadCount] = useState(0)
    const [notifications, setNotifications] = useState<any[]>([])
    const [dbNickname, setDbNickname] = useState<string>("") // DB 전용 닉네임 상태 추가
    const stompClient = useRef<Client | null>(null)

    // DB 닉네임 강제 로드 로직
    useEffect(() => {
        const loadDbNickname = async () => {
            if (isAuthenticated) {
                try {
                    const res = await client.get('/users/me')
                    if (res.data && res.data.nickname) {
                        setDbNickname(res.data.nickname)
                    }
                } catch (err) {
                    console.error("Failed to load DB nickname", err)
                }
            }
        };
        loadDbNickname();
    }, [isAuthenticated, user?.sub]) // 유저가 변경될 때마다 다시 로드
    // Close mobile menu on route change
    useEffect(() => {
        setIsOpen(false)
    }, [location.pathname])

    // WebSocket for notifications
    useEffect(() => {
        if (!user) return

        const fetchInitialData = async () => {
            try {
                const [countRes, listRes] = await Promise.all([
                    client.get('/notifications/unread-count'),
                    client.get('/notifications')
                ])
                setUnreadCount(countRes.data.count)
                setNotifications(listRes.data)
            } catch (err) {
                console.error("Failed to fetch notifications", err)
            }
        }
        fetchInitialData()

        const socket = new SockJS('http://localhost:8080/ws-chat')
        const client_stomp = new Client({
            webSocketFactory: () => socket,
            onConnect: () => {
                client_stomp.subscribe(`/user/${user.sub}/queue/notifications`, (message: IMessage) => {
                    const newNotif = JSON.parse(message.body)
                    setNotifications(prev => [newNotif, ...prev])
                    setUnreadCount(prev => prev + 1)
                })
            }
        })
        client_stomp.activate()
        stompClient.current = client_stomp

        return () => {
            client_stomp.deactivate()
        }
    }, [user])

    const handleMarkAsRead = async () => {
        if (unreadCount === 0) return
        try {
            await client.post('/notifications/mark-as-read')
            setUnreadCount(0)
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
        } catch (err) {
            console.error("Failed to mark notifications as read", err)
        }
    }

    const handleDeleteReadNotifications = async () => {
        try {
            await client.delete('/notifications/read')
            setNotifications(prev => prev.filter(n => !n.isRead))
        } catch (err) {
            console.error("Failed to delete read notifications", err)
        }
    }

    const handleLogout = async () => {
        await logout()
        window.location.href = '/'
    }

    // New KSA Routes
    const ksaRoutes = [
        { name: "인사말", href: "/ksa/greeting" },
        { name: "KSA 임원진", href: "/ksa/executives" },
        { name: "역대 임원진", href: "/ksa/history" },
    ]

    // New Job Routes
    const jobRoutes = [
        { name: "취업정보", href: "/market/recruit" }, // Linking to existing job board for now
        { name: "채용설명회", href: "/job/consulting" },
    ]

    // Existing Market Routes (renamed label to 중고마켓)
    const marketRoutes = [
        { name: "중고물품", href: "/market/flea" },
        { name: "구인구직", href: "/market/job" },
        { name: "자동차", href: "/market/cars" },
        { name: "하우징", href: "/market/housing" },
    ]

    // Community Routes (moved Free/Info here)
    const communityRoutes = [
        { name: "자유게시판", href: "/free" },
        { name: "정보게시판", href: "/info" },
    ]

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md supports-backdrop-filter:bg-background/60">
            <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 md:px-8">
                <div className="flex items-center gap-8">
                    <Link to="/" className="flex items-center space-x-2">
                        <span className="font-extrabold text-2xl text-navy tracking-tight">UIUC KSA</span>
                    </Link>
                    <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
                        <NavMenu title="KSA 소개" items={ksaRoutes} />
                        <NavMenu title="취업정보" items={jobRoutes} />
                        <NavMenu title="중고마켓" items={marketRoutes} />
                        <NavMenu title="커뮤니티" items={communityRoutes} />
                        <Link
                            to="/contact"
                            className={cn(
                                "h-10 px-4 py-2 flex items-center justify-center transition-colors font-medium hover:bg-accent hover:text-accent-foreground rounded-md",
                                location.pathname === "/contact" ? "text-primary font-semibold" : "text-muted-foreground"
                            )}
                        >
                            CONTACT US
                        </Link>
                    </nav>
                </div>

                <div className="flex items-center gap-4">
                    {/* Admin Login Link - hide if logged in or check role */}
                    {!user && (
                        <Link to="/admin/login" className="hidden md:block">
                            <Button variant="ghost" size="sm" className="text-muted-foreground w-full">
                                Admin
                            </Button>
                        </Link>
                    )}

                    {user ? (
                        <div className="hidden md:flex items-center gap-4">
                            {/* Notification Bell */}
                            <Popover onOpenChange={(open: boolean) => open && handleMarkAsRead()}>
                                <PopoverTrigger asChild>
                                    <Button variant="ghost" size="icon" className="relative">
                                        <Bell className="h-5 w-5 text-muted-foreground" />
                                        {unreadCount > 0 && (
                                            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                                                {unreadCount > 9 ? '9+' : unreadCount}
                                            </span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-80 p-0" align="end">
                                    <div className="p-4 border-b">
                                        <h3 className="font-bold">알림</h3>
                                    </div>
                                    <div className="max-h-[400px] overflow-y-auto">
                                        {notifications.length === 0 ? (
                                            <div className="p-8 text-center text-sm text-muted-foreground">
                                                새로운 알림이 없습니다.
                                            </div>
                                        ) : (
                                            notifications.map((n) => (
                                                <div
                                                    key={n.id}
                                                    className={cn(
                                                        "p-4 border-b cursor-pointer hover:bg-slate-50 transition-colors",
                                                        !n.isRead && "bg-orange-50/50"
                                                    )}
                                                    onClick={() => navigate(n.relatedUrl)}
                                                >
                                                    <p className="text-sm text-slate-800 line-clamp-2">{n.message}</p>
                                                    <p className="text-[10px] text-slate-400 mt-1">
                                                        {new Date(n.createdAt).toLocaleString()}
                                                    </p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    <div className="p-2 border-t bg-slate-50 text-center">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteReadNotifications();
                                            }}
                                            className="text-xs text-slate-500 hover:text-red-500 font-medium transition-colors w-full py-1"
                                        >
                                            읽은 알림 삭제
                                        </button>
                                    </div>
                                </PopoverContent>
                            </Popover>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative h-auto w-auto rounded-full gap-2 px-2">
                                        <span className="text-sm font-medium">{dbNickname || user.nickname || user.name}</span>
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={user.profileImage} alt={dbNickname || user.nickname || user.name} />
                                            <AvatarFallback>{(dbNickname || user.nickname || user.name)[0]}</AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56" align="end" forceMount>
                                    {(user.role === 'ADMIN' || user.role === 'MASTER') && (
                                        <>
                                            <DropdownMenuItem asChild>
                                                <Link to="/admin">대시보드</Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild>
                                                <Link to="/mypage">마이페이지</Link>
                                            </DropdownMenuItem>
                                        </>
                                    )}
                                    {!(user.role === 'ADMIN' || user.role === 'MASTER') && (
                                        <DropdownMenuItem asChild>
                                            <Link to="/mypage">마이페이지</Link>
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600">
                                        로그아웃
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    ) : (
                        <div className="hidden md:flex items-center gap-2">
                            <Button
                                variant="outline"
                                className="gap-2 font-medium"
                                onClick={() => openSignIn()}
                            >
                                <svg className="w-4 h-4" viewBox="0 0 24 24">
                                    <path
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        fill="#4285F4"
                                    />
                                    <path
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        fill="#34A853"
                                    />
                                    <path
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                        fill="#FBBC05"
                                    />
                                    <path
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        fill="#EA4335"
                                    />
                                </svg>
                                로그인
                            </Button>
                        </div>
                    )}

                    {/* Mobile Menu */}
                    <Sheet open={isOpen} onOpenChange={setIsOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="md:hidden">
                                <Menu className="h-6 w-6" />
                                <span className="sr-only">Toggle Menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-[300px] sm:w-[400px] pr-0">
                            <div className="flex flex-col h-full">
                                <div className="px-7 pt-4 pb-8">
                                    <span className="font-bold text-2xl text-navy">UIUC KSA</span>
                                    {user && <p className="mt-2 text-sm text-muted-foreground">{dbNickname || user.nickname || user.name}님 안녕하세요!</p>}
                                </div>
                                <div className="flex flex-col gap-2 px-4 overflow-y-auto">
                                    <MobileNavSection title="KSA 소개" items={ksaRoutes} />
                                    <MobileNavSection title="취업정보" items={jobRoutes} />
                                    <MobileNavSection title="중고마켓" items={marketRoutes} />
                                    <MobileNavSection title="커뮤니티" items={communityRoutes} />
                                    <Link
                                        to="/contact"
                                        className={cn(
                                            "flex items-center py-3 px-4 text-base font-medium rounded-md transition-colors hover:bg-accent",
                                            location.pathname === "/contact" ? "bg-accent/50 text-primary" : "text-muted-foreground"
                                        )}
                                    >
                                        CONTACT US
                                    </Link>
                                </div>
                                <div className="mt-auto p-6 border-t">
                                    {user ? (
                                        <>
                                            <div className="flex items-center gap-3 mb-4 px-2">
                                                <Avatar className="h-10 w-10">
                                                    <AvatarImage src={user.profileImage} alt={dbNickname || user.nickname || user.name} />
                                                    <AvatarFallback>{(dbNickname || user.nickname || user.name)[0]}</AvatarFallback>
                                                </Avatar>
                                                <span className="font-medium">{dbNickname || user.nickname || user.name}</span>
                                            </div>
                                            <div className="flex flex-col gap-2 w-full mb-3">
                                                {(user.role === 'ADMIN' || user.role === 'MASTER') && (
                                                    <Link to="/admin" className="w-full">
                                                        <Button variant="outline" className="w-full">
                                                            대시보드
                                                        </Button>
                                                    </Link>
                                                )}
                                                <Link to="/mypage" className="w-full">
                                                    <Button variant="outline" className="w-full">
                                                        마이페이지
                                                    </Button>
                                                </Link>
                                            </div>
                                            <Button
                                                className="w-full bg-red-500 hover:bg-red-600 text-white"
                                                size="lg"
                                                onClick={handleLogout}
                                            >
                                                로그아웃
                                            </Button>
                                        </>
                                    ) : (
                                        <>
                                            <Button
                                                variant="outline"
                                                className="w-full mb-3 gap-2"
                                                size="lg"
                                                onClick={() => openSignIn()}
                                            >
                                                <svg className="w-4 h-4" viewBox="0 0 24 24">
                                                    <path
                                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                                        fill="#4285F4"
                                                    />
                                                    <path
                                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                                        fill="#34A853"
                                                    />
                                                    <path
                                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                                        fill="#FBBC05"
                                                    />
                                                    <path
                                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                                        fill="#EA4335"
                                                    />
                                                </svg>
                                                로그인
                                            </Button>
                                            <Link to="/admin/login">
                                                <Button variant="outline" className="w-full">관리자 로그인</Button>
                                            </Link>
                                        </>
                                    )}
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    )
}

function NavMenu({ title, items }: { title: string; items: { name: string; href: string }[] }) {
    const [isOpen, setIsOpen] = useState(false)
    const location = useLocation()
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    const handleMouseEnter = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
            timeoutRef.current = null
        }
        setIsOpen(true)
    }

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setIsOpen(false)
        }, 150)
    }

    const isActive = items.some(item => location.pathname === item.href)

    return (
        <div
            className="flex items-center"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <DropdownMenu open={isOpen} onOpenChange={setIsOpen} modal={false}>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        className={cn(
                            "h-10 px-4 py-2 hover:bg-transparent font-medium",
                            isActive ? "text-primary font-semibold" : "text-muted-foreground"
                        )}
                    >
                        {title} <ChevronDown className={cn("ml-1 h-4 w-4 transition-transform duration-200", isOpen && "rotate-180")} />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    align="center"
                    sideOffset={0}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    className="mt-1"
                >
                    {items.map((item) => (
                        <DropdownMenuItem key={item.href} asChild>
                            <Link to={item.href} className="cursor-pointer py-2">
                                {item.name}
                            </Link>
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}

function MobileNavSection({ title, items }: { title: string; items: { name: string; href: string }[] }) {
    const location = useLocation()
    const [isExpanded, setIsExpanded] = useState(false)
    const isActive = items.some(item => location.pathname === item.href)

    return (
        <div className="flex flex-col">
            <div
                className={cn(
                    "flex items-center justify-between py-3 px-4 text-base font-medium rounded-md transition-colors hover:bg-accent cursor-pointer",
                    isActive || isExpanded ? "text-primary bg-accent/30" : "text-muted-foreground"
                )}
                onClick={() => setIsExpanded(!isExpanded)}
            >
                {title}
                <ChevronDown className={cn("h-4 w-4 transition-transform", isExpanded && "rotate-180")} />
            </div>
            {isExpanded && (
                <div className="flex flex-col gap-1 pl-4 bg-muted/20 rounded-b-md">
                    {items.map((item) => (
                        <Link
                            key={item.href}
                            to={item.href}
                            className={cn(
                                "flex items-center py-2 px-8 text-sm font-medium rounded-md transition-colors hover:bg-accent",
                                location.pathname === item.href ? "text-primary bg-accent/50" : "text-muted-foreground"
                            )}
                        >
                            {item.name}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
