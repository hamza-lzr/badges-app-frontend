import axios from "axios";
import type { CountryDTO } from "../types";

const api = axios.create({
  baseURL: "http://localhost:8080/country",
  headers: { "Content-Type": "application/json" },
});

// ✅ Get all countries
export const fetchCountries = async (): Promise<CountryDTO[]> => {
  const response = await api.get<CountryDTO[]>('');
  return response.data;
};

// ✅ Get country by ID
export const fetchCountryById = async (id: number): Promise<CountryDTO> => {
  const response = await api.get<CountryDTO>(`/${id}`);
  return response.data;
};

// ✅ Create new country
export const createCountry = async (country: Omit<CountryDTO, "id">): Promise<CountryDTO> => {
  const response = await api.post<CountryDTO>('', country);
  return response.data;
};

// ✅ Update country
export const updateCountry = async (id: number, country: Omit<CountryDTO, "id">): Promise<CountryDTO> => {
  const response = await api.put<CountryDTO>(`/${id}`, country);
  return response.data;
};

// ✅ Delete country
export const deleteCountry = async (id: number): Promise<string> => {
  const response = await api.delete<string>(`/${id}`);
  return response.data;
};
