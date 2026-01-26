export interface RecruitPostResponseDto {
    id: number;
    title: string;
    content: string;

    writer: string;
    writerId: number;
    writerClerkId: string;

    viewCount: number;
    createdDate: string;
    modifiedDate: string;

    companyName: string;
    roles: string[];
    applicationLinks?: string[];
}

export interface RecruitPostCreateRequestDto {
    title: string;
    content: string;
    companyName: string;
    roles: string[];
    applicationLinks?: string[];
}
