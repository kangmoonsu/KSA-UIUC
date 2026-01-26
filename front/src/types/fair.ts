export interface ConsultingPostResponseDto {
    id: number;
    title: string;
    content: string;

    writer: string;
    writerId: number;
    writerClerkId: string;

    viewCount: number;
    createdDate: string;
    modifiedDate: string;

    eventDate: string;
    location: string;
}

export interface Page<T> {
    content: T[];
    pageable: {
        sort: {
            empty: boolean;
            sorted: boolean;
            unsorted: boolean;
        };
        offset: number;
        pageNumber: number;
        pageSize: number;
        paged: boolean;
        unpaged: boolean;
    };
    last: boolean;
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
    sort: {
        empty: boolean;
        sorted: boolean;
        unsorted: boolean;
    };
    first: boolean;
    numberOfElements: number;
    empty: boolean;
}

export interface ConsultingPostListResponseDto {
    posts: Page<ConsultingPostResponseDto>;
}

export interface ConsultingPostCreateRequestDto {
    title: string;
    content: string;
    eventDate: string;
    location: string;
}
