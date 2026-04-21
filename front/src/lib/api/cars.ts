import { useMutation, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import client from './client';
import type { CarPostResponseDto, CarPostCreateRequestDto } from '../../types/cars';

export const useCreateCarPost = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (postData: CarPostCreateRequestDto) => {
            await client.post('/cars', postData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['car-posts'] });
        },
    });
};

export const useCarPosts = () => {
    return useInfiniteQuery({
        queryKey: ['car-posts'],
        queryFn: async ({ pageParam = 0 }) => {
            const params = new URLSearchParams();
            params.append('page', pageParam.toString());
            params.append('size', '12');
            params.append('sort', 'createdAt,desc');

            const { data } = await client.get<{ content: CarPostResponseDto[], last: boolean, number: number }>(`/cars?${params.toString()}`);
            return data;
        },
        getNextPageParam: (lastPage) => {
            return lastPage.last ? undefined : lastPage.number + 1;
        },
        initialPageParam: 0,
    });
};
