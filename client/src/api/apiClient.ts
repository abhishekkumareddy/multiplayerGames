import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { getBackendUrl, normalizeBackendUrl } from '../socket/socketClient';

/**
 * Centralized Axios instance for Friends Arcade frontend.
 * Automatically configured with the production Render backend URL
 * (or local development server if running on localhost).
 * Directly respects import.meta.env.VITE_API_URL and prevents duplicate /api prefixes.
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: getBackendUrl(),
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true,
});

// Update the axios baseURL if the active server URL changes
export function updateApiBaseUrl(url: string): void {
  apiClient.defaults.baseURL = normalizeBackendUrl(url);
}

export interface HealthCheckResponse {
  status: string;
  service?: string;
  uptimeSec?: number;
  timestamp?: string;
  environment?: string;
  storage?: string;
  activeRooms?: number;
  cors?: {
    allowedOrigins?: string[];
  };
}

export interface RoomDetailsResponse {
  success: boolean;
  room?: {
    roomId: string;
    game: string | null;
    status: string;
    playerCount: number;
    maxPlayers: number;
    isFull: boolean;
    canJoin: boolean;
  };
  error?: {
    code: string;
    message: string;
  };
}

export interface GamesApiResponse {
  success: boolean;
  games: any[];
}

export const api = {
  /**
   * Health check to verify backend connectivity.
   * Hits GET /health (with fallback to GET /api/health).
   * Used on initial page mount to wake sleeping Render free-tier instances.
   */
  checkHealth: async (): Promise<HealthCheckResponse> => {
    try {
      const response: AxiosResponse<HealthCheckResponse> = await apiClient.get<HealthCheckResponse>('/health');
      return response.data;
    } catch (err) {
      // Fallback to /api/health if /health is unavailable
      const fallback: AxiosResponse<HealthCheckResponse> = await apiClient.get<HealthCheckResponse>('/api/health');
      return fallback.data;
    }
  },

  /**
   * Fetch catalog of multiplayer arcade games.
   */
  getGames: async (): Promise<GamesApiResponse> => {
    const response: AxiosResponse<GamesApiResponse> = await apiClient.get<GamesApiResponse>('/api/games');
    return response.data;
  },

  /**
   * Query details and capacity of a specific room.
   */
  getRoomDetails: async (roomId: string): Promise<RoomDetailsResponse> => {
    const response: AxiosResponse<RoomDetailsResponse> = await apiClient.get<RoomDetailsResponse>(
      `/api/rooms/${encodeURIComponent(roomId.trim().toUpperCase())}`
    );
    return response.data;
  },
};

export default apiClient;
