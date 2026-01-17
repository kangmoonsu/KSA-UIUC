import { useEffect, useState, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAuth } from "@/context/auth-context"
import client from "@/lib/api/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Send } from "lucide-react"
import { Client } from "@stomp/stompjs"
import SockJS from "sockjs-client"
import { toast } from "sonner"

interface Message {
    id: number
    senderId: number
    senderClerkId: string
    senderName: string
    content: string
    isRead: boolean
    createdAt: string
    messageType?: 'TALK' | 'ENTER' | 'LEAVE'
}

interface RoomInfo {
    roomId: number
    partnerName: string
    partnerId: number
    postTitle: string
    category: string
    thumbnail?: string
    itemName?: string
    partnerActive: boolean
}

export function ChatRoomPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { user } = useAuth()
    const [room, setRoom] = useState<RoomInfo | null>(null)
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState("")
    const [isConnected, setIsConnected] = useState(false)
    const stompClient = useRef<Client | null>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    // Fetch room info and history
    useEffect(() => {
        const fetchRoomData = async () => {
            try {
                const [roomRes, msgRes] = await Promise.all([
                    client.get(`/chat/room/${id}`),
                    client.get(`/chat/room/${id}/messages`)
                ])
                setRoom(roomRes.data)
                setMessages(msgRes.data)

                // Mark as read when entering
                await client.post(`/chat/room/${id}/read`)
            } catch (error) {
                console.error("Failed to fetch room data", error)
                toast.error("채팅방 정보를 불러올 수 없습니다.")
                navigate('/mypage')
            }
        }
        if (id) fetchRoomData()
    }, [id, navigate])

    // WebSocket connection
    useEffect(() => {
        if (!id || !user) return

        const baseURL = import.meta.env.VITE_API_BASE_URL.replace('/api', '');
        const socket = new SockJS(`${baseURL}/ws-chat`)
        const stompClientInstance = new Client({
            webSocketFactory: () => socket,
            onConnect: () => {
                console.log("Connected to WebSocket")
                setIsConnected(true)
                stompClientInstance.subscribe(`/topic/room.${id}`, async (message) => {
                    const newMsg = JSON.parse(message.body)
                    setMessages(prev => [...prev, newMsg])

                    // Update partner active state if they left
                    if (newMsg.messageType === 'LEAVE' && newMsg.senderClerkId !== user.sub) {
                        setRoom(prev => prev ? { ...prev, partnerActive: false } : null)
                    }

                    // Mark as read if I'm the recipient
                    if (newMsg.senderClerkId !== user.sub) {
                        try {
                            await client.post(`/chat/room/${id}/read`)
                        } catch (err) {
                            console.error("Failed to mark as read", err)
                        }
                    }
                })
            },
            onDisconnect: () => {
                setIsConnected(false)
                console.log("Disconnected from WebSocket")
            },
            onStompError: (frame) => {
                console.error('Broker reported error: ' + frame.headers['message']);
                console.error('Additional details: ' + frame.body);
            },
        })

        stompClientInstance.activate()
        stompClient.current = stompClientInstance

        return () => {
            if (stompClient.current) stompClient.current.deactivate()
        }
    }, [id, user])

    // Auto scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    const handleLeaveRoom = async () => {
        if (!window.confirm("채팅방을 나가시겠습니까? 나간 후에는 대화 목록에서 사라집니다.")) return

        try {
            await client.post(`/chat/room/${id}/leave`)
            toast.success("채팅방에서 나갔습니다.")
            navigate('/mypage')
        } catch (error) {
            console.error("Failed to leave room", error)
            toast.error("채팅방 나가기에 실패했습니다.")
        }
    }

    const sendMessage = (e?: React.FormEvent) => {
        e?.preventDefault()
        // Use stompClient.current.active for readiness check
        if (!input.trim() || !stompClient.current?.active || !user) return

        const payload = {
            roomId: Number(id),
            senderClerkId: user.sub,
            content: input.trim()
        }

        stompClient.current.publish({
            destination: "/app/chat/send",
            body: JSON.stringify(payload)
        })

        setInput("")
    }

    if (!room) return <div className="p-20 text-center">채팅방 로딩 중...</div>

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b px-4 py-3 flex items-center gap-4 sticky top-0 z-10 shadow-sm">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <h2 className="font-bold text-slate-800 truncate">{room.partnerName}</h2>
                        {isConnected ? (
                            <span className="w-2 h-2 rounded-full bg-green-500" title="Connected"></span>
                        ) : (
                            <span className="w-2 h-2 rounded-full bg-slate-300" title="Disconnected"></span>
                        )}
                    </div>
                    <p className="text-xs text-slate-500 truncate">
                        {room.itemName ? `[물품: ${room.itemName}] ` : ''}{room.postTitle}
                    </p>
                </div>
                <Button variant="outline" size="sm" onClick={handleLeaveRoom} className="text-red-500 hover:text-red-600 border-red-200 hover:bg-red-50">
                    나가기
                </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, idx) => {
                    const isMine = msg.senderClerkId === user?.sub

                    if (msg.messageType === 'LEAVE') {
                        return (
                            <div key={msg.id || idx} className="flex justify-center my-4">
                                <div className="bg-slate-200 text-slate-500 text-[11px] px-3 py-1 rounded-full">
                                    {msg.content}
                                </div>
                            </div>
                        )
                    }

                    return (
                        <div key={msg.id || idx} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] rounded-2xl px-4 py-2 shadow-sm ${isMine ? 'bg-orange-500 text-white rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none border'
                                }`}>
                                {!isMine && <p className="text-[10px] font-bold opacity-70 mb-1">{msg.senderName}</p>}
                                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                <div className="flex items-center justify-end gap-1.5 mt-1">
                                    <p className={`text-[9px] ${isMine ? 'text-orange-100' : 'text-slate-400'}`}>
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t sticky bottom-0">
                {!room.partnerActive && (
                    <div className="text-center text-xs text-slate-400 mb-2">
                        상대방이 채팅방을 나갔습니다. 메시지를 보낼 수 없습니다.
                    </div>
                )}
                <form onSubmit={sendMessage} className="flex gap-2 max-w-4xl mx-auto">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={!room.partnerActive ? "상대방이 나갔습니다" : isConnected ? "메시지를 입력하세요..." : "연결 중..."}
                        className="flex-1"
                        disabled={!isConnected || !room.partnerActive}
                    />
                    <Button type="submit" disabled={!input.trim() || !isConnected || !room.partnerActive} className="bg-orange-500 hover:bg-orange-600">
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            </div>

        </div>
    )
}
