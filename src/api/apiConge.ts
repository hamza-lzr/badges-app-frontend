import type { CongeDTO } from "../types";
import { createApiClient } from "./httpClient";

const api = createApiClient("conge");


export const fetchConges = async (): Promise<CongeDTO[]> => {
  const response = await api.get<CongeDTO[]>("");
  return response.data;
};

export const fetchCongeById = async (id: number): Promise<CongeDTO> => {
  const response = await api.get<CongeDTO>(`${id}`);
  return response.data;
};

export const createConge = async (
  conge: Omit<CongeDTO, "id" >
): Promise<CongeDTO> => {
  const response = await api.post<CongeDTO>("", conge);
  return response.data;
};

export const updateConge = async (
  id: number,
  conge: Partial<CongeDTO>
): Promise<CongeDTO> => {
  const response = await api.put<CongeDTO>(`${id}`, conge);
  return response.data;
};

export const deleteConge = async (id: number): Promise<string> => {
  const response = await api.delete(`${id}`);
  return response.data;
};

export const approveConge = async (id: number): Promise<CongeDTO> => {
  const response = await api.put<CongeDTO>(`approve/${id}`);
  return response.data;
};

export const rejectConge = async (id: number): Promise<CongeDTO> => {
  const response = await api.put<CongeDTO>(`reject/${id}`);
  return response.data;
};

export const fetchMyConges = async (): Promise<CongeDTO[]> => {
  const response = await api.get<CongeDTO[]>("/my");
  return response.data;
};
