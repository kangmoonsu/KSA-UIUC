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

export interface ConsultingPostCreateRequestDto {
    title: string;
    content: string;
    eventDate: string;
    location: string;
}
