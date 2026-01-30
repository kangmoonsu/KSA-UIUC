import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import client from "@/lib/api/client"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import { Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/context/auth-context"

interface UserAdminResponse {
    clerkId: string;
    email: string;
    name: string;
    nickname: string;
    role: string;
    banned: boolean;
    banReason?: string;
    banExpiresAt?: string;
    createdAt: string;
}

export function AdminDashboard() {
    const navigate = useNavigate()
    const { isAuthenticated, isLoading: authLoading } = useAuth()

    const [users, setUsers] = useState<UserAdminResponse[]>([])
    const [search, setSearch] = useState("")
    const [page, setPage] = useState(0)
    const [totalPages, setTotalPages] = useState(0)
    const [isLoading, setIsLoading] = useState(true)

    const fetchUsers = async () => {
        if (!isAuthenticated) return
        setIsLoading(true)
        try {
            const res = await client.get(`/users/admin/users`, {
                params: {
                    query: search,
                    page: page,
                    size: 10
                }
            })
            setUsers(res.data.content)
            setTotalPages(res.data.totalPages)
        } catch (err) {
            console.error("Failed to fetch users", err)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (!authLoading && isAuthenticated) {
            fetchUsers()
        }
    }, [page, authLoading, isAuthenticated])

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (page === 0) {
            fetchUsers()
        } else {
            setPage(0)
        }
    }

    const openUserDetail = (clerkId: string) => {
        navigate(`/admin/users/${clerkId}`)
    }

    return (
        <div className="container mx-auto py-10 px-4">
            <div className="flex flex-col gap-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
                    <p className="text-muted-foreground">Manage users and community content.</p>
                </div>

                <form onSubmit={handleSearch} className="flex gap-2 max-w-sm">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Email or Nickname..."
                            className="pl-8"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Button type="submit">Search</Button>
                </form>

                <div className="rounded-md border bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name/Nickname</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Joined At</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">Loading...</TableCell>
                                </TableRow>
                            ) : users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">No users found.</TableCell>
                                </TableRow>
                            ) : (
                                users.map((u) => (
                                    <TableRow
                                        key={u.clerkId}
                                        className="cursor-pointer hover:bg-muted/50"
                                        onClick={() => openUserDetail(u.clerkId)}
                                    >
                                        <TableCell>
                                            <div className="font-medium">{u.nickname || u.name}</div>
                                            <div className="text-xs text-muted-foreground">{u.name}</div>
                                        </TableCell>
                                        <TableCell>{u.email}</TableCell>
                                        <TableCell>
                                            <Badge variant={u.role === 'MASTER' ? "default" : u.role === 'ADMIN' ? "secondary" : "outline"}>
                                                {u.role}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {u.banned ? (
                                                <div className="flex flex-col gap-1">
                                                    <Badge variant="destructive">Banned</Badge>
                                                    <span className="text-[10px] text-destructive font-medium">
                                                        {u.banExpiresAt ? new Date(u.banExpiresAt).toLocaleString() : "Permanent"}
                                                    </span>
                                                </div>
                                            ) : (
                                                <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Active</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            {u.createdAt ? new Date(u.createdAt).toLocaleString() : "-"}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {totalPages > 1 && (
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    href="#"
                                    onClick={(e: React.MouseEvent) => { e.preventDefault(); if (page > 0) setPage(page - 1) }}
                                    className={page === 0 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                />
                            </PaginationItem>
                            {[...Array(totalPages)].map((_, i) => (
                                <PaginationItem key={i}>
                                    <PaginationLink
                                        href="#"
                                        isActive={page === i}
                                        onClick={(e: React.MouseEvent) => { e.preventDefault(); setPage(i) }}
                                    >
                                        {i + 1}
                                    </PaginationLink>
                                </PaginationItem>
                            ))}
                            <PaginationItem>
                                <PaginationNext
                                    href="#"
                                    onClick={(e: React.MouseEvent) => { e.preventDefault(); if (page < totalPages - 1) setPage(page + 1) }}
                                    className={page === totalPages - 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                )}
            </div>
        </div>
    )
}
