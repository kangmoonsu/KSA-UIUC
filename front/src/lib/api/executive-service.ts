import client from './client';

export interface ExecutiveMember {
    id: number;
    name: string;
    position: string;
    period: string;
    major: string;
    imageUrl: string;
    email: string;
    isCurrent: boolean;
    displayOrder: number;
}

export const executiveService = {
    getCurrentExecutives: async (): Promise<ExecutiveMember[]> => {
        const response = await client.get('/executives/current');
        return response.data;
    },
    getPastExecutives: async (): Promise<Record<string, ExecutiveMember[]>> => {
        const response = await client.get('/executives/past');
        return response.data;
    },
    createExecutive: async (data: Omit<ExecutiveMember, 'id'>): Promise<ExecutiveMember> => {
        const response = await client.post('/executives', data);
        return response.data;
    },
    updateExecutive: async (id: number, data: Omit<ExecutiveMember, 'id'>): Promise<ExecutiveMember> => {
        const response = await client.put(`/executives/${id}`, data);
        return response.data;
    },
    deleteExecutive: async (id: number) => {
        await client.delete(`/executives/${id}`);
    },
    archiveCurrentTerm: async () => {
        await client.post('/executives/archive');
    }
};
