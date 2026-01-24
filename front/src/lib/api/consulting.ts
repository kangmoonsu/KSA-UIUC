import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import client from './client';
import type { ConsultingPostResponseDto, ConsultingPostCreateRequestDto } from '../../types/consulting';

// List (Infinite Scroll)
// List (Standard Pagination)
export const useConsultingPosts = (page: number = 0, size: number = 10) => {
    return useQuery({
        queryKey: ['consulting-posts', page, size],
        queryFn: async () => {
            const params = new URLSearchParams();
            params.append('page', page.toString());
            params.append('size', size.toString());
            params.append('sort', 'createdAt,desc');

            const { data } = await client.get<any>(`/job/consulting?${params.toString()}`);
            return data.posts;
        },
        placeholderData: (previousData) => previousData,
    });
};

// Detail
export const useConsultingPost = (id: string) => {
    return useQuery({
        queryKey: ['consulting-post', id],
        queryFn: async () => {
            const { data } = await client.get<ConsultingPostResponseDto>(`/job/consulting/${id}`);
            return data;
        },
        enabled: !!id,
    });
};

// Create
export const useCreateConsultingPost = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (postData: ConsultingPostCreateRequestDto) => {
            const { data } = await client.post<number>('/job/consulting', postData);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['consulting-posts'] });
        },
    });
};

// Update
export const useUpdateConsultingPost = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }: { id: string, data: ConsultingPostCreateRequestDto }) => {
            await client.put(`/job/consulting/${id}`, data);
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['consulting-posts'] });
            queryClient.invalidateQueries({ queryKey: ['consulting-post', variables.id] });
        },
    });
};

// Delete
export const useDeleteConsultingPost = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            await client.delete(`/job/consulting/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['consulting-posts'] });
        },
    });
};
