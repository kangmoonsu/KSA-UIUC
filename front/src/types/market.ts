
export interface MarketItemDto {
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
    link: string;
    status: string;
    imageUrls: string[];
}

export interface MarketPostResponseDto {
    id: number;
    title: string;
    content: string;
    authorName: string;
    contactPlace: string;
    type: 'BUY' | 'SELL';
    viewCount: number;
    createdDate: string;
    items: MarketItemResponseDto[];
}
