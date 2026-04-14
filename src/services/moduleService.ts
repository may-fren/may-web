import api from './api';
import type { PageResponse } from './userService';

export interface Module {
  id: number;
  name: string;
  brand: string;
  model: string;
  year: number | null;
  code: string;
  status: string;
  createdDate: string;
  createdBy: string;
}

export interface ModuleCreateRequest {
  name: string;
  brand: string;
  model: string;
  year: number | null;
  code: string;
}

export interface ModuleUpdateRequest {
  name: string;
  brand: string;
  model: string;
  year: number | null;
  code: string;
  status: string;
}

export interface ModuleListParams {
  page: number;
  size: number;
  sort?: string;
  name?: string;
  brand?: string;
  status?: string;
}

export async function getModules(params: ModuleListParams): Promise<PageResponse<Module>> {
  const { data } = await api.get<PageResponse<Module>>('/modules', { params });
  return data;
}

export async function createModule(payload: ModuleCreateRequest): Promise<Module> {
  const { data } = await api.post<Module>('/modules', payload);
  return data;
}

export async function updateModule(id: number, payload: ModuleUpdateRequest): Promise<Module> {
  const { data } = await api.put<Module>(`/modules/${id}`, payload);
  return data;
}

export async function deleteModule(id: number): Promise<void> {
  await api.delete(`/modules/${id}`);
}
