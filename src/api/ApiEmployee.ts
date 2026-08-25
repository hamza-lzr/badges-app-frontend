import type { UserDTO, CreateEmployeeDTO } from "../types";
import { createApiClient } from "./httpClient";

const api = createApiClient("users");

// ✔️ Get all employees
export const fetchEmployees = async (): Promise<UserDTO[]> => {
  const { data } = await api.get<UserDTO[]>("");
  return data;
};

// ✔️ Get employee by ID
export const fetchEmployeeById = async (id: number): Promise<UserDTO> => {
  const { data } = await api.get<UserDTO>(`/${id}`);
  return data;
};

// ✔️ Create employee
export const createEmployee = async (employee: CreateEmployeeDTO): Promise<UserDTO> => {
  const { data } = await api.post<UserDTO>("", employee);
  return data;
};

// ✔️ Update employee
export const updateEmployee = async (
  id: number,
  employee: UserDTO
): Promise<UserDTO> => {
  const { data } = await api.put<UserDTO>(`/${id}`, employee);
  return data;
};

// ✔️ Delete employee
export const deleteEmployee = async (id: number): Promise<string> => {
  const { data } = await api.delete<string>(`/${id}`);
  return data;
};

// ✔️ Update employee status
export const updateEmployeeStatus = async (
  id: number,
  employee: UserDTO
): Promise<UserDTO> => {
  const { data } = await api.put<UserDTO>(`/${id}/status`, employee);
  return data;
};

// ✔️ Remove badge from employee
export const removeEmployeeBadge = async (id: number): Promise<UserDTO> => {
  const { data } = await api.delete<UserDTO>(`/${id}/badge`);
  return data;
};

// ✔️ Add or update badge
export const addOrUpdateBadge = async (
  id: number,
  badgeId: number
): Promise<UserDTO> => {
  const { data } = await api.put<UserDTO>(`/${id}/badge`, badgeId);
  return data;
};

// ✔️ Add or update company
export const addOrUpdateCompany = async (
  id: number,
  companyId: number
): Promise<UserDTO> => {
  const { data } = await api.put<UserDTO>(`/${id}/company`, companyId);
  return data;
};

export const fetchMyProfile = async (): Promise<UserDTO> => {
  const { data } = await api.get<UserDTO>("/me");
  return data;
};

export const changeMyPassword = async (newPassword: string): Promise<void> => {
  await api.post("/change-password", { newPassword });
};

