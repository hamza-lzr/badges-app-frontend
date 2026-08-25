import type { CompanyDTO } from '../types';
import { createApiClient } from './httpClient';

const api = createApiClient('company');

export const fetchCompanies = async (): Promise<CompanyDTO[]> => {
    const response = await api.get<CompanyDTO[]>('');
    return response.data;
};

export const fetchCompanyById = async (id: number): Promise<CompanyDTO> => {
    const response = await api.get<CompanyDTO>(`/${id}`);
    return response.data;
};

export const createCompany = async (company: CompanyDTO): Promise<CompanyDTO> => {
    const response = await api.post<CompanyDTO>('', company);
    return response.data;
};

export const updateCompany = async (id: number, company: CompanyDTO): Promise<CompanyDTO> => {
    const response = await api.put<CompanyDTO>(`/${id}`, company);
    return response.data;
};

export const deleteCompany = async (id: number): Promise<string> => {
    const response = await api.delete<string>(`/${id}`);
    return response.data;
};
