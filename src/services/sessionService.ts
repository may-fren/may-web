import api from './api';
import type { PageResponse } from './userService';

export interface UserSession {
  id: number;
  platform: string;
  deviceInfo: string;
  ipAddress: string;
  loginDate: string;
  lastActivityDate: string;
  currentSession: boolean;
}

export async function getMySessionsApi(): Promise<UserSession[]> {
  const { data } = await api.get<PageResponse<UserSession>>('/sessions/me', {
    params: { page: 0, size: 1000 },
  });
  return data.content;
}

export async function terminateSessionApi(sessionId: number): Promise<void> {
  await api.delete(`/sessions/${sessionId}`);
}
