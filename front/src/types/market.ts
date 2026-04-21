
export interface MarketItemDto {
    id?: number;
    name: string;
    price: number;
    description: string;
    link?: string;
    imageUrls: string[];
}

export interface MarketPostCreateRequestDto {
    title: string;
    content: string;
    contactPlace: string;
    type: 'BUY' | 'SELL';
    items: MarketItemDto[];
}

export interface MarketItemResponseDto {
    id: number;
    name: string;
    price: number;
    description: string;
    productLink: string;
    status: string;
    imageUrls: string[];
}

export interface MarketPostResponseDto {
    id: number;
    title: string;
    content: string;
    writer: string;
    writerId?: number;
    location: string;
    type: 'BUY' | 'SELL';
    viewCount: number;
    createdAt: string;
    writerClerkId?: string;
    items: MarketItemResponseDto[];
}
