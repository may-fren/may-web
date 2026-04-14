import api from './api';
import type { PageResponse } from './userService';

export interface Analysis {
  id: number;
  name: string;
  description: string;
  moduleId: number;
  moduleName: string;
  note: string;
  status: string;
  createdDate: string;
  createdBy: string;
}

export interface AnalysisCreateRequest {
  name: string;
  description: string;
  moduleId: number;
  note: string;
}

export interface AnalysisUpdateRequest {
  name: string;
  description: string;
  moduleId: number;
  note: string;
  status: string;
}

export interface AnalysisListParams {
  page: number;
  size: number;
  sort?: string;
  name?: string;
  status?: string;
}

export async function getAnalyses(params: AnalysisListParams): Promise<PageResponse<Analysis>> {
  const { data } = await api.get<PageResponse<Analysis>>('/analyses', { params });
  return data;
}

export async function createAnalysis(payload: AnalysisCreateRequest): Promise<Analysis> {
  const { data } = await api.post<Analysis>('/analyses', payload);
  return data;
}

export async function updateAnalysis(id: number, payload: AnalysisUpdateRequest): Promise<Analysis> {
  const { data } = await api.put<Analysis>(`/analyses/${id}`, payload);
  return data;
}

export async function deleteAnalysis(id: number): Promise<void> {
  await api.delete(`/analyses/${id}`);
}
