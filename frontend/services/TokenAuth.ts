import {RefreshResponse, TokenPair} from "@/interfaces/interfaces";
import {getTokens, saveTokensToStorage, deleteTokensFromStorage} from '@/utils/tokenStorage';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export class TokenValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'TokenValidationError';
    }
}

let refreshPromise: Promise<TokenPair> | null = null;

export const validateAndRefreshTokens = async (
    existingTokens?: { accessToken: string | null; refreshToken: string | null }
): Promise<TokenPair> => {
    if (refreshPromise) {
        console.log('[TokenAuth] Returning existing refresh promise.');
        return refreshPromise;
    }

    refreshPromise = (async () => {
        try {
            const {accessToken, refreshToken} = existingTokens || (await getTokens());

            if (!accessToken || !refreshToken) {
                throw new TokenValidationError('MISSING_TOKENS');
            }

            await validateTokens(refreshToken, 'refresh');

            try {
                await validateTokens(accessToken, 'access');
                return {accessToken, refreshToken, isRefreshed: false};
            } catch (accessError) {
                const newTokens = await refreshTokenPair(refreshToken);

                const finalRefreshToken = newTokens.refresh_token || refreshToken;
                await saveTokensToStorage(newTokens.access_token, finalRefreshToken);

                return {
                    accessToken: newTokens.access_token,
                    refreshToken: finalRefreshToken,
                    isRefreshed: true,
                };
            }
        } catch (error) {
            console.error('[TokenAuth] Unrecoverable session error:', error);
            await deleteTokensFromStorage();

            const errorMessage = error instanceof Error ? error.message : 'An unknown session error occurred.';
            throw new TokenValidationError(errorMessage);

        } finally {
            console.log('[TokenAuth] Validation process finished.');
            refreshPromise = null;
        }
    })();

    return refreshPromise;
};


const validateTokens = async (
    token: string,
    expectedType?: 'access' | 'refresh'
): Promise<void> => {
    const response = await fetch(`${API_URL}/auth/validate-token`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'X-Expected-Token-Type': expectedType || '',
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Token validation failed');
    }
};


const refreshTokenPair = async (
    refreshToken: string
): Promise<RefreshResponse> => {
    const response = await fetch(`${API_URL}/auth/refresh-token`, {
        method: 'POST',
        headers: {Authorization: `Bearer ${refreshToken}`},
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Refresh token request failed');
    }
    return await response.json();
};