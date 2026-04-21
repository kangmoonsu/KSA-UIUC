import type { PageResponse } from "./post-free";

export interface NewsPostResponseDto {
    id: number;
    title: string;
    content: string;
    author: string;
    authorClerkId: string;
    viewCount: number;
    createdAt: string;
}

export interface NewsBoardListResponse {
    posts: PageResponse<NewsPostResponseDto>;
}

export interface NewsPostCreateRequestDto {
    title: string;
    content: string;
}
