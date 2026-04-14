import api from './api';
import type { PageResponse } from './userService';

export interface Test {
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

export interface TestCreateRequest {
  name: string;
  description: string;
  moduleId: number;
  note: string;
}

export interface TestUpdateRequest {
  name: string;
  description: string;
  moduleId: number;
  note: string;
  status: string;
}

export interface TestListParams {
  page: number;
  size: number;
  sort?: string;
  name?: string;
  status?: string;
}

export async function getTests(params: TestListParams): Promise<PageResponse<Test>> {
  const { data } = await api.get<PageResponse<Test>>('/tests', { params });
  return data;
}

export async function createTest(payload: TestCreateRequest): Promise<Test> {
  const { data } = await api.post<Test>('/tests', payload);
  return data;
}

export async function updateTest(id: number, payload: TestUpdateRequest): Promise<Test> {
  const { data } = await api.put<Test>(`/tests/${id}`, payload);
  return data;
}

export async function deleteTest(id: number): Promise<void> {
  await api.delete(`/tests/${id}`);
}
