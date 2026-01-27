import client from "./client"

export interface CarouselImage {
    id: number
    imageUrl: string
    orderIndex: number
}

export const carouselService = {
    getImages: async (): Promise<CarouselImage[]> => {
        const response = await client.get("/carousel")
        return response.data
    },

    addImage: async (file: File): Promise<CarouselImage> => {
        const formData = new FormData()
        formData.append("file", file)
        const response = await client.post("/carousel", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        })
        return response.data
    },

    deleteImage: async (id: number): Promise<void> => {
        await client.delete(`/carousel/${id}`)
    },

    updateOrder: async (ids: number[]): Promise<void> => {
        await client.post("/carousel/order", ids)
    },
}
