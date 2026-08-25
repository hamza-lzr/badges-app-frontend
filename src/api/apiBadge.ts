import type { BadgeDTO } from '../types';
import { createApiClient } from './httpClient';

const api = createApiClient('badges');

// ✔️ Get all badges
export const fetchBadges = async (): Promise<BadgeDTO[]> => {
    const response = await api.get<BadgeDTO[]>('');
    return response.data;
};

// ✔️ Get badge by ID
export const fetchBadgeById = async (id: number): Promise<BadgeDTO> => {
    const response = await api.get<BadgeDTO>(`/${id}`);
    return response.data;
};

// ✔️ Create a badge
export const createBadge = async (badge: Omit<BadgeDTO, 'id'>): Promise<BadgeDTO> => {
    const response = await api.post<BadgeDTO>('', badge);
    return response.data;
};

// ✔️ Update a badge
export const updateBadge = async (id: number, badge: BadgeDTO): Promise<BadgeDTO> => {
    const response = await api.put<BadgeDTO>(`/${id}`, badge);
    return response.data;
};

// ✔️ Delete a badge
export const deleteBadge = async (id: number): Promise<string> => {
    const response = await api.delete<string>(`/${id}`);
    return response.data;
};

// ✔️ Update badge expiry date
export const updateBadgeExpiryDate = async (id: number, expiryDate: string): Promise<BadgeDTO> => {
    const badge: Partial<BadgeDTO> = { expiryDate };
    const response = await api.put<BadgeDTO>(`/${id}/expiryDate`, badge);
    return response.data;
};

export const fetchBadgesByEmployee = async (): Promise<BadgeDTO[]> => {
    const response = await api.get<BadgeDTO[]>(`/my`);
    return response.data;
};




