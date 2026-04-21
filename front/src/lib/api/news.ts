import client from "./client"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { NewsPostResponseDto, NewsPostCreateRequestDto, NewsBoardListResponse } from "@/types/post-news"

export const useNewsPosts = (page: number = 0) => {
    return useQuery<NewsBoardListResponse>({
        queryKey: ["newsPosts", page],
        queryFn: async () => {
            const res = await client.get(`/news?page=${page}&size=10`);
            return res.data;
        }
    });
}

export const useNewsPost = (id: string | number) => {
    return useQuery<NewsPostResponseDto>({
        queryKey: ["newsPost", id],
        queryFn: async () => {
            const res = await client.get(`/news/${id}`);
            return res.data;
        }
    });
}

export const useCreateNewsPost = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: NewsPostCreateRequestDto) => {
            const res = await client.post("/news", data);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["newsPosts"] });
        }
    });
}

export const useUpdateNewsPost = (id: string | number) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: NewsPostCreateRequestDto) => {
            const res = await client.put(`/news/${id}`, data);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["newsPosts"] });
            queryClient.invalidateQueries({ queryKey: ["newsPost", id] });
        }
    });
}

export const useDeleteNewsPost = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string | number) => {
            await client.delete(`/news/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["newsPosts"] });
        }
    });
}
