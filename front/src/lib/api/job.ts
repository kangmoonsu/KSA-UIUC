import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from './client';
import type { JobPostResponseDto, JobPostCreateRequestDto } from '../../types/job';

export const useJobPosts = () => {
    return useInfiniteQuery({
        queryKey: ['job-posts'],
        queryFn: async ({ pageParam = 0 }) => {
            const params = new URLSearchParams();
            params.append('page', pageParam.toString());
            params.append('size', '12');
            params.append('sort', 'createdAt,desc');

            const { data } = await client.get<{ content: JobPostResponseDto[], last: boolean, number: number }>(`/jobs?${params.toString()}`);
            return data;
        },
        getNextPageParam: (lastPage) => {
            return lastPage.last ? undefined : lastPage.number + 1;
        },
        initialPageParam: 0,
    });
};

export const useCreateJobPost = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (postData: JobPostCreateRequestDto) => {
            const { data } = await client.post<void>('/jobs', postData);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['job-posts'] });
        },
    });
};
