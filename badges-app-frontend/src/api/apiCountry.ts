import axios from "axios";
import type { AxiosRequestHeaders } from 'axios';

import type { CountryDTO } from "../types";

const api = axios.create({
  baseURL: "http://localhost:8080/country",
  headers: { "Content-Type": "application/json" },
});

// ✅ Attach Authorization header dynamically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  
  if (token) {
config.headers = Object.assign({}, config.headers, {
  Authorization: `Bearer ${token}`,
}) as AxiosRequestHeaders;
  }
  
  return config;
});

// ✅ Example API calls
export const fetchCountries = async (): Promise<CountryDTO[]> => {
  const response = await api.get<CountryDTO[]>("");
  return response.data;
};

export const fetchCountryById = async (id: number): Promise<CountryDTO> => {
  const response = await api.get<CountryDTO>(`/${id}`);
  return response.data;
};

export const createCountry = async (
  country: Omit<CountryDTO, "id">
): Promise<CountryDTO> => {
  const response = await api.post<CountryDTO>("", country);
  return response.data;
};

export const updateCountry = async (
  id: number,
  country: Omit<CountryDTO, "id">
): Promise<CountryDTO> => {
  const response = await api.put<CountryDTO>(`/${id}`, country);
  return response.data;
};

export const deleteCountry = async (id: number): Promise<string> => {
  const response = await api.delete<string>(`/${id}`);
  return response.data;
};

export default api;