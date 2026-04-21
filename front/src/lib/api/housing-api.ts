import client from "./client";

export type HousingType = "SUBLEASE" | "TAKEOVER" | "ROOMMATE";

export interface HousingPost {
    id: number;
    title: string;
    content: string;
    location: string;
    price: number;
    housingType: HousingType;
    writer: string;
    writerId: number;
    writerClerkId: string;
    isOwner: boolean;
    status: string;
    imageUrls: string[];
    createdAt: string;
    updatedAt: string;
}

export interface HousingPostCreateRequest {
    title: string;
    content: string;
    location: string;
    price: number;
    housingType: HousingType;
    imageUrls: string[];
}

export interface HousingPostUpdateRequest {
    title: string;
    content: string;
    location: string;
    price: number;
    housingType: HousingType;
    status: string;
    imageUrls: string[];
}

import { useInfiniteQuery } from "@tanstack/react-query";

const BASE_URL = "/housings";

export const housingApi = {
    getAll: async (page = 0, size = 12) => {
        const params = new URLSearchParams({
            page: page.toString(),
            size: size.toString(),
            sort: 'createdAt,desc'
        });
        const response = await client.get<any>(`${BASE_URL}?${params.toString()}`);
        return response.data;
    },

    getById: async (id: string | number) => {
        const response = await client.get<HousingPost>(`${BASE_URL}/${id}`);
        return response.data;
    },

    create: async (data: HousingPostCreateRequest) => {
        const response = await client.post<number>(BASE_URL, data); // Returns ID
        return response.data;
    },

    update: async (id: number | string, data: HousingPostUpdateRequest) => {
        await client.put(`${BASE_URL}/${id}`, data);
    },

    delete: async (id: number | string) => {
        await client.delete(`${BASE_URL}/${id}`);
    }
};

export const useHousingPosts = () => {
    return useInfiniteQuery({
        queryKey: ['housing-posts'],
        queryFn: ({ pageParam = 0 }) => housingApi.getAll(pageParam),
        getNextPageParam: (lastPage: any) => {
            return lastPage.last ? undefined : lastPage.number + 1;
        },
        initialPageParam: 0,
    });
};
