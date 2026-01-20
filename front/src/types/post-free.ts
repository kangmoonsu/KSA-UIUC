export interface FreePostResponseDto {
    id: number;
    title: string;
    content: string;
    author: string;
    authorClerkId: string;
    notice: boolean;
    viewCount: number;
    createdAt: string;
}

export interface FreeBoardListResponse {
    notices: FreePostResponseDto[];
    posts: PageResponse<FreePostResponseDto>;
}

export interface FreePostCreateRequestDto {
    title: string;
    content: string;
    notice: boolean;
}

export interface PageResponse<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
}
