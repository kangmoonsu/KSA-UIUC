export interface FreePostResponseDto {
    id: number;
    title: string;
    content: string;
    author: string;
    authorClerkId: string;
    notice: boolean;
    viewCount: number;
    commentCount: number;
    commentEnabled: boolean;
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
    commentEnabled: boolean;
}

export interface CommentRequestDto {
    content: string;
    parentId?: number;
    isSecret: boolean;
}

export interface CommentResponseDto {
    id: number;
    content: string;
    authorName: string;
    authorProfileImage: string;
    authorClerkId: string;
    createdAt: string;
    isSecret: boolean;
    isDeleted: boolean;
    children: CommentResponseDto[];
}

export interface PageResponse<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
}
