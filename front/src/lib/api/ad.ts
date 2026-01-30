import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from './client';

export interface AdDto {
    id: number;
    imageUrl: string;
    targetUrl: string;
    orderIndex: number;
    active: boolean;
    creatorNickname: string;
}

export interface AdCreateRequest {
    imageUrl: string;
    targetUrl: string;
    orderIndex: number;
    active: boolean;
}

export const useAds = () => {
    return useQuery<AdDto[]>({
        queryKey: ['ads'],
        queryFn: async () => {
            const { data } = await client.get<AdDto[]>('/ads');
            return data;
        },
    });
};

export const useAd = (id: number) => {
    return useQuery<AdDto>({
        queryKey: ['ads', id],
        queryFn: async () => {
            const { data } = await client.get<AdDto>(`/ads/${id}`);
            return data;
        },
        enabled: !!id,
    });
};

export const useCreateAd = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (adData: AdCreateRequest) => {
            const { data } = await client.post<AdDto>('/ads', adData);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ads'] });
            queryClient.invalidateQueries({ queryKey: ['activeAds'] });
        },
    });
};

export const useUpdateAd = (id: number) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (adData: AdCreateRequest) => {
            const { data } = await client.put<AdDto>(`/ads/${id}`, adData);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ads'] });
            queryClient.invalidateQueries({ queryKey: ['activeAds'] });
        },
    });
};

export const useDeleteAd = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: number) => {
            await client.delete(`/ads/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ads'] });
            queryClient.invalidateQueries({ queryKey: ['activeAds'] });
        },
    });
};
