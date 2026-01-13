
export interface CarPostCreateRequestDto {
    title: string;
    content: string;
    price: number;
    year: number;
    mileage: number;
    model: string;
    imageUrls: string[];
}

export interface CarPostResponseDto {
    id: number;
    title: string;
    price: number;
    year: number;
    mileage: number;
    modelName: string;
    writer: string;
    createdAt: string;
    status: string;
    imageUrls: string[];
}
