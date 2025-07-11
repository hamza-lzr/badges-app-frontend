import axios from 'axios';
import type { UserDTO } from '../types';

const api = axios.create({
    baseURL: 'http://localhost:8080/users',
    headers: { 'Content-Type': 'application/json' },

});

// ✔️ Get all employees
export const fetchEmployees = async (): Promise<UserDTO[]> => {
    const response = await api.get<UserDTO[]>('');
    return response.data;
};

// ✔️ Get employee by ID
export const fetchEmployeeById = async (id: number): Promise<UserDTO> => {
    const response = await api.get<UserDTO>(`/${id}`);
    return response.data;
};

// ✔️ Create employee
export const createEmployee = async (employee: UserDTO): Promise<UserDTO> => {
    const response = await api.post<UserDTO>('', employee);
    return response.data;
};

// ✔️ Update employee
export const updateEmployee = async (id: number, employee: UserDTO): Promise<UserDTO> => {
    const response = await api.put<UserDTO >(`/${id}`, employee);
    return response.data;
};

// ✔️ Delete employee
export const deleteEmployee = async (id: number): Promise<string> => {
    const response = await api.delete<string>(`/${id}`);
    return response.data;
};

// ✔️ Update employee status
export const updateEmployeeStatus = async (id: number, employee: UserDTO): Promise<UserDTO> => {
    const response = await api.put<UserDTO>(`/${id}/status`, employee);
    return response.data;
};

// ✔️ Remove badge from employee
export const removeEmployeeBadge = async (id: number): Promise<UserDTO> => {
    const response = await api.delete<UserDTO>(`/${id}/badge`);
    return response.data;
};

// ✔️ Add or update badge
export const addOrUpdateBadge = async (id: number, badgeId: number): Promise<UserDTO> => {
    const response = await api.put<UserDTO>(`/${id}/badge`, badgeId);
    return response.data;
};

// ✔️ Add or update company
export const addOrUpdateCompany = async (id: number, companyId: number): Promise<UserDTO> => {
    const response = await api.put<UserDTO>(`/${id}/company`, companyId);
    return response.data;
};
