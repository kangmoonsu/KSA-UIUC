import client from './client';

export const greetingService = {
    getGreeting: async (): Promise<string> => {
        const response = await client.get('/greetings');
        return response.data;
    },
    updateGreeting: async (content: string): Promise<void> => {
        await client.put('/greetings', content, {
            headers: {
                'Content-Type': 'text/plain'
            }
        });
    }
};
