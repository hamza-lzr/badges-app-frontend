import axios from 'axios';
import type  {Request, ReqStatus, ReqType}   from '../types.ts';

// ✔️ Base URL (adapte si besoin)
const api = axios.create({
    baseURL: 'http://localhost:8080/requests',
    headers: {
        'Content-Type': 'application/json',
    },
});

// ✔️ Get all requests
export const fetchRequests = async (): Promise<Request[]> => {
    const response = await api.get<Request[]>('/');
    return response.data;
};

// ✔️ Get request by ID
export const fetchRequestById = async (id: number): Promise<Request> => {
    const response = await api.get<Request>(`/${id}`);
    return response.data;
};

// ✔️ Create a new request
export const addRequest = async (request: Request): Promise<Request> => {
    const response = await api.post<Request>('/', request);
    return response.data;
};

// ✔️ Update an existing request
export const updateRequest = async (id: number, request: Request): Promise<Request> => {
    const response = await api.put<Request>(`/${id}`, request);
    return response.data;
};

// ✔️ Update the request type
export const updateRequestType = async (id: number, reqType: ReqType): Promise<Request> => {
    const response = await api.put<Request>(`/update-type/${id}`, reqType);
    return response.data;
};

// ✔️ Update the request status
export const updateRequestStatus = async (id: number, reqStatus: ReqStatus): Promise<Request> => {
    const response = await api.put<Request >(`/update-status/${id}`, reqStatus);
    return response.data;
};

// ✔️ Delete a request
export const deleteRequest = async (id: number): Promise<string> => {
    const response = await api.delete<string>(`/${id}`);
    return response.data;
};
