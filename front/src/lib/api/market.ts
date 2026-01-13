import { useMutation, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import client from './client';
import type { MarketPostResponseDto, MarketPostCreateRequestDto } from '../../types/market';

export const useUploadImage = () => {
    return useMutation({
        mutationFn: async (file: File) => {
            const formData = new FormData();
            formData.append('file', file);
            const { data } = await client.post<{ imageUrl: string }>('/images', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return data.imageUrl;
        },
    });
};

export const useUploadImages = () => {
    return useMutation({
        mutationFn: async (files: File[]) => {
            const formData = new FormData();
            files.forEach(file => formData.append('files', file));
            const { data } = await client.post<{ imageUrls: string[] }>('/images/multiple', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return data.imageUrls;
        }
    })
}

export const useCreateMarketPost = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (postData: MarketPostCreateRequestDto) => {
            const { data } = await client.post<{ id: number }>('/flea', postData);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['market-posts'] });
        },
    });
};

export const useMarketPosts = (type?: 'BUY' | 'SELL') => {
    return useInfiniteQuery({
        queryKey: ['market-posts', type],
        queryFn: async ({ pageParam = 0 }) => {
            const params = new URLSearchParams();
            if (type) params.append('type', type);
            params.append('page', pageParam.toString());
            params.append('size', '12');
            params.append('sort', 'createdAt,desc');

            const { data } = await client.get<{ content: MarketPostResponseDto[], last: boolean, number: number }>(`/flea?${params.toString()}`);
            return data;
        },
        getNextPageParam: (lastPage) => {
            return lastPage.last ? undefined : lastPage.number + 1;
        },
        initialPageParam: 0,
    });
};
