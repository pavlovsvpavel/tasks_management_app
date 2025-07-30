import {RefreshResponse, TokenPair} from "@/interfaces/interfaces";
import {getTokens, saveTokensToStorage, deleteTokensFromStorage} from '@/utils/tokenStorage';

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const APP_KEY = process.env.EXPO_PUBLIC_APP_KEY;

export class TokenValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'TokenValidationError';
    }
}

const authApiClient = async (endpoint: string, options: RequestInit = {}): Promise<Response> => {
    const defaultHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-App-Key': APP_KEY || '',
    };

    const config: RequestInit = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
    };

    const response = await fetch(`${API_URL}${endpoint}`, config);

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({detail: 'An unknown error occurred.'}));
        const errorMessage = errorData.detail || `Request to ${endpoint} failed with status ${response.status}`;
        throw new TokenValidationError(errorMessage);
    }

    return response;
};

let refreshPromise: Promise<TokenPair> | null = null;

export const validateAndRefreshTokens = async (
    existingTokens?: { accessToken: string | null; refreshToken: string | null }
): Promise<TokenPair> => {
    if (refreshPromise) {
        console.log('[TokenAuth] A refresh is already in progress. Reusing the existing promise.');
        return refreshPromise;
    }

    refreshPromise = (async () => {
        try {
            const {accessToken, refreshToken} = existingTokens || (await getTokens());

            if (!accessToken || !refreshToken) {
                throw new TokenValidationError('MISSING_TOKENS');
            }

            await validateToken(refreshToken, 'refresh');

            try {
                await validateToken(accessToken, 'access');
                console.log('[TokenAuth] Access token is still valid.');
                return {accessToken, refreshToken, isRefreshed: false};
            } catch (accessError) {
                console.log('[TokenAuth] Access token is invalid. Attempting to refresh...');
                const newTokens = await refreshTokenPair(refreshToken);

                const finalRefreshToken = newTokens.refresh_token || refreshToken;
                await saveTokensToStorage(newTokens.access_token, finalRefreshToken);

                console.log('[TokenAuth] Tokens refreshed successfully.');
                return {
                    accessToken: newTokens.access_token,
                    refreshToken: finalRefreshToken,
                    isRefreshed: true,
                };
            }
        } catch (error) {
            console.error('[TokenAuth] Unrecoverable session error, clearing tokens:', error);
            await deleteTokensFromStorage();

            const errorMessage = error instanceof Error ? error.message : 'An unknown session error occurred.';
            throw new TokenValidationError(errorMessage);

        } finally {
            refreshPromise = null;
        }
    })();

    return refreshPromise;
};


const validateToken = async (
    token: string,
    expectedType?: 'access' | 'refresh'
): Promise<void> => {
    await authApiClient('/auth/validate-token', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'X-Expected-Token-Type': expectedType || '',
        },
    });
};


const refreshTokenPair = async (
    refreshToken: string
): Promise<RefreshResponse> => {

    const response = await authApiClient('/auth/refresh-token', {
        method: 'POST',
        headers: {Authorization: `Bearer ${refreshToken}`},
    });
    return response.json();
};