import api from './api';
import type { PageResponse } from './userService';

export interface RolePermissionResponse {
  id: number;
  roleId: number;
  roleName: string;
  permissionId: number;
  permissionName: string;
  createdDate: string;
  createdBy: string;
}

export interface RolePermissionRequest {
  roleId: number;
  permissionId: number;
}

export async function getPermissionsByRoleId(roleId: number): Promise<RolePermissionResponse[]> {
  const { data } = await api.get<PageResponse<RolePermissionResponse>>(`/role-permissions/role/${roleId}`, {
    params: { page: 0, size: 1000 },
  });
  return data.content;
}

export async function assignPermissionToRole(payload: RolePermissionRequest): Promise<RolePermissionResponse> {
  const { data } = await api.post<RolePermissionResponse>('/role-permissions', payload);
  return data;
}

export async function removeRolePermission(id: number): Promise<void> {
  await api.delete(`/role-permissions/${id}`);
}
