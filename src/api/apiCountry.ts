import type { CountryDTO } from "../types";
import { createApiClient } from "./httpClient";

const api = createApiClient("country");

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
