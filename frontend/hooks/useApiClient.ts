import {useCallback} from 'react';
import {useSession} from '@/context/AuthContext';
import {useServerStatus} from '@/context/ServerStatusContext';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export class ServerDownError extends Error {
    constructor(message = 'The server is currently unavailable.') {
        super(message);
        this.name = 'ServerDownError';
    }
}

export class SessionExpiredError extends Error {
    constructor(message = 'Your session has expired. Please log in again.') {
        super(message);
        this.name = 'SessionExpiredError';
    }
}

export function useApiClient() {
    const {validateSession, clearTokens} = useSession();
    const {checkHealth, isServerDown} = useServerStatus();

    const apiClient = useCallback(async (endpoint: string, options: RequestInit = {}) => {
        const isServerHealthy = await checkHealth();
        if (!isServerHealthy) {
            throw new ServerDownError();
        }

        const validationResult = await validateSession();
        if (!validationResult.isValid || !validationResult.accessToken) {
            throw new SessionExpiredError();
        }

        const defaultHeaders = {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${validationResult.accessToken}`,
        };

        const config: RequestInit = {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers,
            },
        };

        const response = await fetch(`${API_URL}${endpoint}`, config);

        if (response.status === 401) {
            await clearTokens(true);
            throw new SessionExpiredError();
        }

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`HTTP error! Status: ${response.status}, Body: ${errorBody}`);
        }

        return response;
    }, [checkHealth, validateSession, clearTokens]);

    return {apiClient, isServerDown};
}