import axios from 'axios';
import type { CityDTO } from '../types';

const api = axios.create({
    baseURL: 'http://localhost:8080/city',
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

export const fetchCities = async (): Promise<CityDTO[]> => {
    const response = await api.get<CityDTO[]>('');
    return response.data;
};

export const fetchCityById = async (id: number): Promise<CityDTO> => {
    const response = await api.get<CityDTO>(`/${id}`);
    return response.data;
};

export const fetchCitiesByCountry = async (countryId: number): Promise<CityDTO[]> => {
    const response = await api.get<CityDTO[]>(`/country-id/${countryId}`);
    return response.data;
};

export const createCity = async (city: CityDTO): Promise<CityDTO> => {
    const response = await api.post<CityDTO>('', city);
    return response.data;
};

export const updateCity = async (id: number, city: CityDTO): Promise<CityDTO> => {
    const response = await api.put<CityDTO>(`/${id}`, city);
    return response.data;
};

export const deleteCity = async (id: number): Promise<string> => {
    const response = await api.delete<string>(`/${id}`);
    return response.data;
};


