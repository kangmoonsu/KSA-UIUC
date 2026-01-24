import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import client from './client';
import type { RecruitPostResponseDto, RecruitPostCreateRequestDto } from '../../types/recruit';

// List (Infinite Scroll)
// List (Standard Pagination)
export const useRecruitPosts = (page: number = 0, size: number = 10) => {
    return useQuery({
        queryKey: ['recruit-posts', page, size],
        queryFn: async () => {
            const params = new URLSearchParams();
            params.append('page', page.toString());
            params.append('size', size.toString());
            params.append('sort', 'createdAt,desc');

            const { data } = await client.get<any>(`/market/recruit?${params.toString()}`);
            // Return the Page object directly (content, totalPages, etc.)
            return data.posts;
        },
        placeholderData: (previousData) => previousData, // Keep previous data while fetching new page
    });
};

// Detail
export const useRecruitPost = (id: string) => {
    return useQuery({
        queryKey: ['recruit-post', id],
        queryFn: async () => {
            const { data } = await client.get<RecruitPostResponseDto>(`/market/recruit/${id}`);
            return data;
        },
        enabled: !!id,
    });
};

// Create
export const useCreateRecruitPost = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (postData: RecruitPostCreateRequestDto) => {
            const { data } = await client.post<number>('/market/recruit', postData);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['recruit-posts'] });
        },
    });
};

// Update
export const useUpdateRecruitPost = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }: { id: string, data: RecruitPostCreateRequestDto }) => {
            await client.put(`/market/recruit/${id}`, data);
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['recruit-posts'] });
            queryClient.invalidateQueries({ queryKey: ['recruit-post', variables.id] });
        },
    });
};

// Delete
export const useDeleteRecruitPost = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            await client.delete(`/market/recruit/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['recruit-posts'] });
        },
    });
};
