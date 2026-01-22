import { useState, useEffect } from "react"
import { useActivePopups } from "@/lib/api/popup"
import type { PopupResponseDto } from "@/types/post-popup"
import { useLocation } from "react-router-dom"
import {
    Dialog,
    DialogContent,
    DialogPortal,
    DialogOverlay,
} from "@/components/ui/dialog"
import { X } from "lucide-react"

export function AnnouncementPopup() {
    const { data: popups, isLoading } = useActivePopups()
    const [currentPopupIndex, setCurrentPopupIndex] = useState(0)
    const [open, setOpen] = useState(false)
    const location = useLocation()

    useEffect(() => {
        // Only show popups on the main page
        if (location.pathname !== "/") {
            setOpen(false)
            return
        }

        if (!isLoading && popups && popups.length > 0) {
            // Find the first popup that hasn't been dismissed within last 24 hours
            const firstActiveIndex = popups.findIndex((popup: PopupResponseDto) => {
                const dismissedAt = localStorage.getItem(`popup_dismissed_${popup.id}`)
                if (!dismissedAt) return true

                const lastDismissedTime = parseInt(dismissedAt)
                const now = Date.now()
                // Show if dismissed more than 24 hours ago
                return now - lastDismissedTime > 24 * 60 * 60 * 1000
            })

            if (firstActiveIndex !== -1) {
                setCurrentPopupIndex(firstActiveIndex)
                setOpen(true)
            } else {
                setOpen(false)
            }
        } else {
            setOpen(false)
        }
    }, [popups, isLoading, location.pathname])

    if (isLoading || !popups || popups.length === 0 || !open) return null

    const currentPopup = popups[currentPopupIndex]
    if (!currentPopup) return null

    const handleClose = () => {
        setOpen(false)
    }

    const handleDontShowToday = () => {
        localStorage.setItem(`popup_dismissed_${currentPopup.id}`, Date.now().toString())
        setOpen(false)
    }

    const handleImageClick = () => {
        if (currentPopup.linkUrl) {
            window.open(currentPopup.linkUrl, '_blank', 'noopener,noreferrer')
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogPortal>
                <DialogOverlay className="bg-transparent" />
                <DialogContent className="max-w-[400px] p-0 overflow-hidden border-none bg-transparent shadow-2xl transition-all duration-300">
                    <div className="relative group">
                        {/* Popup Image */}
                        <div
                            className={`cursor-pointer overflow-hidden rounded-t-lg ${currentPopup.linkUrl ? 'hover:opacity-95' : ''}`}
                            onClick={handleImageClick}
                        >
                            <img
                                src={currentPopup.imageUrl}
                                alt={currentPopup.title}
                                className="w-full h-auto object-cover display-block"
                            />
                        </div>

                        {/* Pagination if multiple (Optional enhancement) */}
                        {popups.length > 1 && (
                            <div className="absolute bottom-16 right-4 bg-black/50 text-white text-[10px] px-2 py-1 rounded-full">
                                {String(currentPopupIndex + 1).padStart(2, '0')} / {String(popups.length).padStart(2, '0')}
                            </div>
                        )}

                        {/* Footer Buttons */}
                        <div className="flex w-full bg-white border-t rounded-b-lg">
                            <button
                                onClick={handleDontShowToday}
                                className="flex-1 py-4 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors border-r"
                            >
                                오늘 보지 않기
                            </button>
                            <button
                                onClick={handleClose}
                                className="flex-1 py-4 text-sm font-medium text-slate-900 hover:bg-slate-50 transition-colors"
                            >
                                팝업 닫기
                            </button>
                        </div>

                        {/* Close Icon (Top Right) */}
                        <button
                            onClick={handleClose}
                            className="absolute top-2 right-2 p-1 bg-black/20 hover:bg-black/40 rounded-full text-white transition-all opacity-0 group-hover:opacity-100"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </DialogContent>
            </DialogPortal>
        </Dialog>
    )
}
