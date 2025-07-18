import type { NotificationDTO } from '../types';
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080/notification',
    headers: { 'Content-Type': 'application/json' },

});

export const fetchNotifications = async (): Promise<NotificationDTO[]> => {
    const response = await api.get<NotificationDTO[]>(``);
    return response.data;
};

export const fetchNotificationById = async (id: number): Promise<NotificationDTO> => {
    const response = await api.get<NotificationDTO>(`/${id}`);
    return response.data;
};

export const createNotification = async (notification: NotificationDTO): Promise<NotificationDTO> => {
    const response = await api.post<NotificationDTO>(``, notification);
    return response.data;
};

export const updateNotification = async (id: number, notification: NotificationDTO): Promise<NotificationDTO> => {
    const response = await api.put<NotificationDTO>(`/${id}`, notification);
    return response.data;
};

export const deleteNotification = async (id: number): Promise<string> => {
    const response = await api.delete<string>(`/${id}`);
    return response.data;
};

export const fetchNotificationsByUserId = async (userId: number): Promise<NotificationDTO[]> => {
    const response = await api.get<NotificationDTO[]>(`/user-id/${userId}`);
    return response.data;
};

export const markNotificationAsRead = async (id: number): Promise<NotificationDTO> => {
    const response = await api.patch<NotificationDTO>(`/${id}`);
    return response.data;
};


