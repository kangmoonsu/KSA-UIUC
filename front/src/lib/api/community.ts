import client from "./client"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { FreePostResponseDto, FreePostCreateRequestDto, FreeBoardListResponse } from "@/types/post-free"

export const useFreePosts = (page: number = 0) => {
    return useQuery<FreeBoardListResponse>({
        queryKey: ["freePosts", page],
        queryFn: async () => {
            const res = await client.get(`/free?page=${page}&size=10`);
            return res.data;
        }
    });
}

export const useFreePost = (id: string | number) => {
    return useQuery<FreePostResponseDto>({
        queryKey: ["freePost", id],
        queryFn: async () => {
            const res = await client.get(`/free/${id}`);
            return res.data;
        }
    });
}

export const useCreateFreePost = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: FreePostCreateRequestDto) => {
            const res = await client.post("/free", data);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["freePosts"] });
        }
    });
}

export const useUpdateFreePost = (id: string | number) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: FreePostCreateRequestDto) => {
            const res = await client.put(`/free/${id}`, data);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["freePosts"] });
            queryClient.invalidateQueries({ queryKey: ["freePost", id] });
        }
    });
}

export const useDeleteFreePost = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string | number) => {
            await client.delete(`/free/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["freePosts"] });
        }
    });
}
