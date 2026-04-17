import api, { setAccessToken, clearAccessToken, setRefreshToken, getRefreshToken } from './api';

interface LoginRequest {
  username: string;
  password: string;
  forceLogin?: boolean;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  roles: string[];
  permissions: string[];
}

export interface SessionLimitError {
  code: number;
  detail: string;
  activeSessions: ActiveSession[];
}

export interface ActiveSession {
  id: number;
  platform: string;
  deviceInfo: string;
  ipAddress: string;
  loginDate: string;
  lastActivityDate: string;
}

export async function loginApi(credentials: LoginRequest): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>('/auth/login', credentials, {
    headers: { 'X-Platform': 'WEB' },
  });
  setAccessToken(data.accessToken);
  if (data.refreshToken) {
    setRefreshToken(data.refreshToken);
  }
  return data;
}

export async function logoutApi(): Promise<void> {
  try {
    const refreshToken = getRefreshToken();
    await api.post('/auth/logout', { refreshToken });
  } catch {
    // logout endpoint yoksa sessizce devam et
  } finally {
    clearAccessToken();
  }
}

export function isSessionLimitError(error: unknown): error is { response: { status: number; data: SessionLimitError } } {
  if (error && typeof error === 'object' && 'response' in error) {
    const resp = (error as { response?: { status?: number; data?: { code?: number } } }).response;
    return resp?.status === 409 && resp?.data?.code === 1007;
  }
  return false;
}
