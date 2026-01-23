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
    salary: string;
    location: string;
    employmentType: string;
    deadline?: string;
    experienceLevel: string;
    applicationUrl?: string;
}

export interface RecruitPostCreateRequestDto {
    title: string;
    content: string;
    companyName: string;
    roles: string[];
    salary: string;
    location: string;
    employmentType: string;
    deadline?: string;
    experienceLevel: string;
    applicationUrl?: string;
}
