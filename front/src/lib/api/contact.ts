import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

export interface ContactData {
    title: string;
    email: string;
    content: string;
    file?: File | null;
}

export const sendContact = async (data: ContactData) => {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("email", data.email);
    formData.append("content", data.content);
    if (data.file) {
        formData.append("file", data.file);
    }

    const response = await axios.post(`${API_BASE_URL}/contact`, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return response.data;
};
