import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import client from './client';
import type { FairPostResponseDto, FairPostCreateRequestDto, FairPostListResponseDto } from '@/types/fair';

// List (Infinite Scroll)
// List (Standard Pagination)
export const useFairPosts = (page: number = 0, size: number = 10) => {
    return useQuery({
        queryKey: ['fair-posts', page, size],
        queryFn: async () => {
            const params = new URLSearchParams();
            params.append('page', page.toString());
            params.append('size', size.toString());
            params.append('sort', 'createdAt,desc');

            const { data } = await client.get<FairPostListResponseDto>(`/market/fair?${params.toString()}`);
            return data.posts;
        },
        placeholderData: (previousData) => previousData,
    });
};

// Detail
export const useFairPost = (id: string) => {
    return useQuery({
        queryKey: ['fair-post', id],
        queryFn: async () => {
            const { data } = await client.get<FairPostResponseDto>(`/market/fair/${id}`);
            return data;
        },
        enabled: !!id,
    });
};

// Create
export const useCreateFairPost = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (postData: FairPostCreateRequestDto) => {
            const { data } = await client.post<number>('/market/fair', postData);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['fair-posts'] });
        },
    });
};

// Update
export const useUpdateFairPost = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }: { id: string, data: FairPostCreateRequestDto }) => {
            await client.put(`/market/fair/${id}`, data);
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['fair-posts'] });
            queryClient.invalidateQueries({ queryKey: ['fair-post', variables.id] });
        },
    });
};

// Delete
export const useDeleteFairPost = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            await client.delete(`/market/fair/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['fair-posts'] });
        },
    });
};
