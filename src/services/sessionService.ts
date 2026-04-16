import api from './api';

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
  const { data } = await api.get<UserSession[]>('/sessions/me');
  return data;
}

export async function terminateSessionApi(sessionId: number): Promise<void> {
  await api.delete(`/sessions/${sessionId}`);
}
