export interface JobPostResponseDto {
    id: number;
    title: string;
    content: string;
    salary: string;
    location: string;
    contactInfo: string;
    writer: string;
    writerId: number;
    writerClerkId: string;
    createdAt: string;
    status: string;
}

export interface JobPostCreateRequestDto {
    title: string;
    content: string;
    salary: string;
    location: string;
    contactInfo: string;
    status: string;
}
