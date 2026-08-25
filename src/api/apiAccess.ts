import type { AccessDTO } from "../types";
import { createApiClient } from "./httpClient";

const api = createApiClient("access");

// ✅ Fetch all accesses
export const fetchAccesses = async (): Promise<AccessDTO[]> => {
  const response = await api.get<AccessDTO[]>('');
  return response.data;
};

// ✅ Fetch a single access by ID
export const fetchAccessById = async (id: number): Promise<AccessDTO> => {
  const response = await api.get<AccessDTO>(`/${id}`);
  return response.data;
};

// ✅ Fetch accesses by badge ID
export const fetchAccessesByBadgeId = async (badgeId: number): Promise<AccessDTO[]> => {
  const response = await api.get<AccessDTO[]>(`/badge/${badgeId}`);
  return response.data;
};

// ✅ Fetch accesses by airport ID
export const fetchAccessesByAirportId = async (airportId: number): Promise<AccessDTO[]> => {
  const response = await api.get<AccessDTO[]>(`/airport/${airportId}`);
  return response.data;
};

// ✅ Create a new access
export const createAccess = async (access: AccessDTO): Promise<AccessDTO> => {
  const response = await api.post<AccessDTO>("", access);
  return response.data;
};

// ✅ Update an access by ID
export const updateAccess = async (id: number, access: AccessDTO): Promise<AccessDTO> => {
  const response = await api.put<AccessDTO>(`/${id}`, access);
  return response.data;
};

// ✅ Delete an access by ID
export const deleteAccess = async (id: number): Promise<void> => {
  await api.delete(`/${id}`);
};

export const fetchMyAccesses = async (): Promise<AccessDTO[]> => {
  const response = await api.get<AccessDTO[]>(`/my`);
  return response.data;
};

