import { useNavigate } from "react-router-dom"
import client from "@/lib/api/client"
import { toast } from "sonner"
import { useAuth } from "@/context/auth-context"

export function useChatRoom() {
    const navigate = useNavigate()
    const { user } = useAuth()

    const enterChatRoom = async (params: { postId?: number; itemId?: number; category: string }) => {
        if (!user) {
            toast.error("로그인이 필요한 서비스입니다.")
            return
        }

        try {
            const res = await client.post("/chat/room", params)
            const { roomId } = res.data
            navigate(`/chat/room/${roomId}`)
        } catch (error: any) {
            console.error("Failed to enter chat room", error)
            toast.error(error.response?.data || "채팅방 연결에 실패했습니다.")
        }
    }

    return { enterChatRoom }
}
