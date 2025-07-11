import axios from 'axios';
import type { EmployeeDTO } from '../types';

const api = axios.create({
    baseURL: 'http://localhost:8080/employees',
    headers: { 'Content-Type': 'application/json' },

});

// ✔️ Get all employees
export const fetchEmployees = async (): Promise<EmployeeDTO[]> => {
    const response = await api.get<EmployeeDTO[]>('');
    return response.data;
};

// ✔️ Get employee by ID
export const fetchEmployeeById = async (id: number): Promise<EmployeeDTO> => {
    const response = await api.get<EmployeeDTO>(`/${id}`);
    return response.data;
};

// ✔️ Create employee
export const createEmployee = async (employee: EmployeeDTO): Promise<EmployeeDTO> => {
    const response = await api.post<EmployeeDTO>('', employee);
    return response.data;
};

// ✔️ Update employee
export const updateEmployee = async (id: number, employee: EmployeeDTO): Promise<EmployeeDTO> => {
    const response = await api.put<EmployeeDTO>(`/${id}`, employee);
    return response.data;
};

// ✔️ Delete employee
export const deleteEmployee = async (id: number): Promise<string> => {
    const response = await api.delete<string>(`/${id}`);
    return response.data;
};

// ✔️ Update employee status
export const updateEmployeeStatus = async (id: number, employee: EmployeeDTO): Promise<EmployeeDTO> => {
    const response = await api.put<EmployeeDTO>(`/${id}/status`, employee);
    return response.data;
};

// ✔️ Remove badge from employee
export const removeEmployeeBadge = async (id: number): Promise<EmployeeDTO> => {
    const response = await api.delete<EmployeeDTO>(`/${id}/badge`);
    return response.data;
};

// ✔️ Add or update badge
export const addOrUpdateBadge = async (id: number, badgeId: number): Promise<EmployeeDTO> => {
    const response = await api.put<EmployeeDTO>(`/${id}/badge`, badgeId);
    return response.data;
};

// ✔️ Add or update company
export const addOrUpdateCompany = async (id: number, companyId: number): Promise<EmployeeDTO> => {
    const response = await api.put<EmployeeDTO>(`/${id}/company`, companyId);
    return response.data;
};
