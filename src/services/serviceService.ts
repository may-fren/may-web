import api from './api';
import type { PageResponse } from './userService';

export interface Service {
  id: number;
  name: string;
  city: string;
  town: string;
  address: string;
  status: string;
  createdDate: string;
  createdBy: string;
}

export interface ServiceCreateRequest {
  name: string;
  city: string;
  town: string;
  address: string;
}

export interface ServiceUpdateRequest {
  name: string;
  city: string;
  town: string;
  address: string;
  status: string;
}

export interface ServiceListParams {
  page: number;
  size: number;
  sort?: string;
  name?: string;
  city?: string;
  status?: string;
}

export async function getServices(params: ServiceListParams): Promise<PageResponse<Service>> {
  const { data } = await api.get<PageResponse<Service>>('/services', { params });
  return data;
}

export async function createService(payload: ServiceCreateRequest): Promise<Service> {
  const { data } = await api.post<Service>('/services', payload);
  return data;
}

export async function updateService(id: number, payload: ServiceUpdateRequest): Promise<Service> {
  const { data } = await api.put<Service>(`/services/${id}`, payload);
  return data;
}

export async function deleteService(id: number): Promise<void> {
  await api.delete(`/services/${id}`);
}
