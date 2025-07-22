// src/api/apiAirport.ts
import axios from 'axios';
import type { AirportDTO } from '../types';

const api = axios.create({
  baseURL: 'http://localhost:8080/airport',
  headers: { 'Content-Type': 'application/json' },
});

// ✅ Attach Authorization header dynamically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }
  
  return config;
});

// ✔ Get all airports
export const fetchAirports = async (): Promise<AirportDTO[]> => {
  const response = await api.get<AirportDTO[]>('');
  return response.data;
};

// ✔ Get one airport
export const fetchAirportById = async (id: number): Promise<AirportDTO> => {
  const response = await api.get<AirportDTO>(`/${id}`);
  return response.data;
};

// ✔ Create
export const createAirport = async (airport: AirportDTO): Promise<AirportDTO> => {
  const response = await api.post<AirportDTO>('', airport);
  return response.data;
};

// ✔ Update
export const updateAirport = async (id: number, airport: AirportDTO): Promise<AirportDTO> => {
  const response = await api.put<AirportDTO>(`/${id}`, airport);
  return response.data;
};

// ✔ Delete
export const deleteAirport = async (id: number): Promise<string> => {
  const response = await api.delete<string>(`/${id}`);
  return response.data;
};
