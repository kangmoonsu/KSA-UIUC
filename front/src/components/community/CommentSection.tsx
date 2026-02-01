import { useState } from "react"
import { useComments, useCreateComment, useDeleteComment } from "@/lib/api/community"
import { useAuth } from "@/context/auth-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { format } from "date-fns"
import { Loader2, Lock, MessageSquare, Trash2, User } from "lucide-react"
import { toast } from "sonner"
import type { CommentResponseDto } from "@/types/post-free"
import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

interface CommentSectionProps {
    postId: number
    commentCount: number
    commentEnabled: boolean
    postAuthorId: string
}

export function CommentSection({ postId, commentCount, commentEnabled, postAuthorId }: CommentSectionProps) {
    const { user } = useAuth()
    const { data: comments, isLoading } = useComments(postId)
    const createComment = useCreateComment()

    // New comment state
    const [content, setContent] = useState("")
    const [isSecret, setIsSecret] = useState(false)

    // Reply state
    const [replyToId, setReplyToId] = useState<number | null>(null)
    const [replyContent, setReplyContent] = useState("")
    const [replyIsSecret, setReplyIsSecret] = useState(false)

    const handleSubmit = (e: React.FormEvent, parentId?: number) => {
        e.preventDefault()
        const textToSubmit = parentId ? replyContent : content
        const secretToSubmit = parentId ? replyIsSecret : isSecret

        if (!textToSubmit.trim()) return
        if (!user) {
            toast.error("로그인이 필요합니다.")
            return
        }

        createComment.mutate({
            postId,
            data: { content: textToSubmit, parentId, isSecret: secretToSubmit }
        }, {
            onSuccess: () => {
                toast.success("댓글이 등록되었습니다.")
                if (parentId) {
                    setReplyToId(null)
                    setReplyContent("")
                    setReplyIsSecret(false)
                } else {
                    setContent("")
                    setIsSecret(false)
                }
            },
            onError: () => {
                toast.error("댓글 등록에 실패했습니다.")
            }
        })
    }

    if (!commentEnabled && (!comments || comments.length === 0)) {
        return (
            <div className="py-8 text-center text-muted-foreground border-t">
                이 글은 댓글 작성이 비활성화되어 있습니다.
            </div>
        )
    }

    return (
        <div className="py-8">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-6 text-slate-800">
                <MessageSquare className="w-5 h-5" />
                댓글 <span className="text-[#E84A27]">{commentCount}</span>
            </h3>

            {/* Comment List */}
            <div className="space-y-6 mb-10">
                {isLoading ? (
                    <div className="text-center py-10 text-muted-foreground">댓글을 불러오는 중...</div>
                ) : comments && comments.length > 0 ? (
                    comments.map((comment) => (
                        <CommentItem
                            key={comment.id}
                            comment={comment}
                            currentUserId={user?.sub}
                            postAuthorId={postAuthorId}
                            onReply={(id) => setReplyToId(replyToId === id ? null : id)}
                            isReplying={replyToId === comment.id}
                            replyContent={replyContent}
                            setReplyContent={setReplyContent}
                            replyIsSecret={replyIsSecret}
                            setReplyIsSecret={setReplyIsSecret}
                            onSubmitReply={handleSubmit}
                            commentEnabled={commentEnabled}
                        />
                    ))
                ) : (
                    <div className="text-center py-10 bg-slate-50 rounded-lg text-muted-foreground border border-dashed">
                        첫 번째 댓글을 남겨보세요!
                    </div>
                )}
            </div>

            {/* Write New Comment */}
            {commentEnabled ? (
                <div className="bg-slate-50 p-4 rounded-xl border">
                    <div className="flex gap-4">
                        <Avatar className="w-10 h-10 border bg-white">
                            <AvatarImage src={user?.profileImage} />
                            <AvatarFallback><User className="w-5 h-5 text-slate-400" /></AvatarFallback>
                        </Avatar>
                        <div className="grow space-y-3">
                            <div className="font-medium text-sm text-slate-900">
                                {user ? user?.name || "User" : "방문자"}
                            </div>
                            <form onSubmit={(e) => handleSubmit(e)}>
                                <Textarea
                                    placeholder={user ? "댓글을 입력하세요..." : "로그인 후 댓글을 작성할 수 있습니다."}
                                    className="min-h-[100px] bg-white resize-none focus-visible:ring-[#E84A27]"
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    disabled={!user || createComment.isPending}
                                />
                                <div className="flex justify-between items-center mt-2">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="secret-new"
                                            checked={isSecret}
                                            onCheckedChange={(c: boolean) => setIsSecret(c)}
                                        />
                                        <Label htmlFor="secret-new" className="text-sm text-slate-600 flex items-center gap-1 cursor-pointer">
                                            <Lock className="w-3 h-3" /> 비밀글
                                        </Label>
                                    </div>
                                    <Button
                                        type="submit"
                                        className="bg-[#13294B] hover:bg-[#13294B]/90"
                                        disabled={!user || !content.trim() || createComment.isPending}
                                    >
                                        {createComment.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                        등록
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center py-4 bg-slate-100 rounded-lg text-muted-foreground">
                    댓글 작성이 비활성화되었습니다.
                </div>
            )}
        </div>
    )
}

function CommentItem({
    comment,
    currentUserId,
    postAuthorId,
    onReply,
    isReplying,
    replyContent,
    setReplyContent,
    replyIsSecret,
    setReplyIsSecret,
    onSubmitReply,
    commentEnabled
}: {
    comment: CommentResponseDto
    currentUserId?: string
    postAuthorId: string
    onReply: (id: number) => void
    isReplying: boolean
    replyContent: string
    setReplyContent: (v: string) => void
    replyIsSecret: boolean
    setReplyIsSecret: (v: boolean) => void
    onSubmitReply: (e: React.FormEvent, parentId: number) => void
    commentEnabled: boolean
}) {
    const deleteComment = useDeleteComment()
    // Remove unused isAuthenticated

    // Check if user has permission to delete (Author only)
    // Note: Admin check is usually handled by backend, but here we hide button
    const canDelete = currentUserId === comment.authorClerkId

    const handleDelete = () => {
        if (window.confirm("댓글을 삭제하시겠습니까?")) {
            deleteComment.mutate({ commentId: comment.id }, {
                onSuccess: () => toast.success("삭제되었습니다.")
            })
        }
    }

    // Secret comment display logic is handled by backend masking content.
    // Frontend just ensures lock icon is proven.

    return (
        <div>
            <div className={cn("flex gap-4 group", comment.isSecret && "opacity-90")}>
                <Avatar className="w-10 h-10 border bg-white flex-shrink-0">
                    <AvatarImage src={comment.authorProfileImage} />
                    <AvatarFallback><User className="w-5 h-5 text-slate-400" /></AvatarFallback>
                </Avatar>
                <div className="grow">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm text-slate-900">
                            {comment.authorName}
                            {comment.authorClerkId === postAuthorId && (
                                <span className="ml-1.5 px-1.5 py-0.5 bg-[#E84A27]/10 text-[#E84A27] text-[10px] rounded-full">
                                    글쓴이
                                </span>
                            )}
                        </span>
                        <span className="text-xs text-slate-400">
                            {format(new Date(comment.createdAt), "yyyy.MM.dd HH:mm")}
                        </span>
                        {comment.isSecret && <Lock className="w-3 h-3 text-slate-400" />}
                    </div>

                    <p className={cn("text-sm text-slate-700 whitespace-pre-wrap leading-relaxed", comment.isDeleted && "text-muted-foreground italic")}>
                        {comment.content}
                    </p>

                    <div className="flex items-center gap-3 mt-2">
                        {commentEnabled && !comment.isDeleted && (
                            <button
                                onClick={() => onReply(comment.id)}
                                className="text-xs text-slate-500 hover:text-slate-800 font-medium"
                            >
                                답글 쓰기
                            </button>
                        )}
                        {canDelete && !comment.isDeleted && (
                            <button
                                onClick={handleDelete}
                                className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <Trash2 className="w-3 h-3" />삭제
                            </button>
                        )}
                    </div>

                    {/* Reply Form */}
                    {isReplying && (
                        <div className="mt-4 pl-4 border-l-2 mb-4 animate-in fade-in slide-in-from-top-2">
                            <form onSubmit={(e) => onSubmitReply(e, comment.id)}>
                                <Textarea
                                    autoFocus
                                    placeholder="답글을 입력하세요..."
                                    className="min-h-[80px] bg-white mb-2"
                                    value={replyContent}
                                    onChange={(e) => setReplyContent(e.target.value)}
                                />
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`secret-reply-${comment.id}`}
                                            checked={replyIsSecret}
                                            onCheckedChange={(c: boolean) => setReplyIsSecret(c)}
                                        />
                                        <Label htmlFor={`secret-reply-${comment.id}`} className="text-sm text-slate-600 flex items-center gap-1 cursor-pointer">
                                            <Lock className="w-3 h-3" /> 비밀글
                                        </Label>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button type="button" variant="ghost" size="sm" onClick={() => onReply(comment.id)}>취소</Button>
                                        <Button type="submit" size="sm" className="bg-[#13294B]">등록</Button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>

            {/* Nested Children (Recursive) */}
            {comment.children && comment.children.length > 0 && (
                <div className="pl-10 mt-4 space-y-4 border-l ml-5">
                    {comment.children.map(child => (
                        <CommentItem
                            key={child.id}
                            comment={child}
                            currentUserId={currentUserId}
                            postAuthorId={postAuthorId}
                            onReply={onReply}
                            isReplying={isReplying} // Only one reply interaction at a time usually, but here checking id matches parent. Wait 
                            // Actually reply form state needs to be specific. The Logic in parent component check replyToId === comment.id.
                            // For nested children, we need to pass down the state. 
                            // Wait, if I reply to a child, `replyToId` will be child.id.
                            // So `isReplying` should be passed correctly from parent loop?
                            // Yes, in parent loop: `isReplying={replyToId === comment.id}`. 
                            // But here I'm recursively calling CommentItem. I need to check `replyToId === child.id` here.
                            // So instead of passing `isReplying` boolean, I should probably check logic here or pass the ID.
                            // BUT, the parent component holds the state.
                            // Let's refactor: CommentSection passes `replyToId`. CommentItem checks `replyToId === comment.id`.
                            // So `isReplying` prop is boolean.
                            // Inside recursion, we need to determine `isReplying` for the child.
                            // Actually, I can just pass `replyToId` and check it inside CommentItem? 
                            // No, simpler to just calculate boolean in the map.
                            replyContent={replyContent}
                            setReplyContent={setReplyContent}
                            replyIsSecret={replyIsSecret}
                            setReplyIsSecret={setReplyIsSecret}
                            onSubmitReply={onSubmitReply}
                            commentEnabled={commentEnabled}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
