import {useCallback} from 'react';
import {useAuth} from '@/contexts/AuthContext';
import {useServerStatus} from "@/contexts/ServerStatusContext";
import {
    ServerDownError,
    SessionExpiredError,
    SessionRefreshedError,
    ValidationError
} from '@/utils/errors';
import {ApiClientOptions} from "@/interfaces/interfaces";

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const APP_KEY = process.env.EXPO_PUBLIC_APP_KEY;

export function useApiClient() {
    const {accessToken, validateSession} = useAuth();
    const {setServerStatus} = useServerStatus();

    const apiClient = useCallback(async (
        endpoint: string,
        options: ApiClientOptions = {}
    ): Promise<Response> => {
        const {retryOn401 = true, ...fetchOptions} = options;

        /**
         * An inner function to construct and execute the actual fetch call.
         * This allows us to call it once for the initial request, and a second
         * time if we need to retry after a token refresh.
         * @param token The access token to use for the request.
         */
        const makeRequest = async (token: string | null): Promise<Response> => {
            const defaultHeaders: Record<string, string> = {
                'X-App-Key': APP_KEY || '',
            };

            if (token) {
                defaultHeaders['Authorization'] = `Bearer ${token}`;
            }

            if (!(fetchOptions.body instanceof FormData)) {
                defaultHeaders['Content-Type'] = 'application/json';
            }

            const config: RequestInit = {
                ...fetchOptions,
                headers: {...defaultHeaders, ...fetchOptions.headers},
            };

            try {
                const response = await fetch(`${API_URL}${endpoint}`, config);
                setServerStatus(false);
                return response;
            } catch (error) {
                if (error instanceof TypeError && error.message === 'Network request failed') {
                    setServerStatus(true);
                    throw new ServerDownError();
                }
                throw error;
            }
        };

        let response = await makeRequest(accessToken);

        if (response.status === 401 && accessToken) {
            console.log('[ApiClient] Access token expired or invalid. Attempting to refresh session...');
            try {
                const validationResult = await validateSession();

                if (!validationResult.isValid || !validationResult.accessToken) {
                    throw new SessionExpiredError("Session is invalid after attempting refresh.");
                }

                if (retryOn401) {
                    console.log('[ApiClient] Session refreshed successfully. Retrying original request...');
                    response = await makeRequest(validationResult.accessToken);
                } else {
                    console.log('[ApiClient] Session refreshed. Not retrying request as per options.');
                    throw new SessionRefreshedError();
                }
            } catch (error) {
                if (error instanceof SessionRefreshedError || error instanceof SessionExpiredError) {
                    throw error;
                }
                console.error('[ApiClient] Unexpected error during session refresh:', error);
                throw new SessionExpiredError("An unexpected error occurred during session refresh.");
            }
        }

        if (!response.ok) {
            let errorBody: any = {};
            try {
                errorBody = await response.json();
            } catch (e) {
                const textBody = await response.text();
                throw new Error(`HTTP error! Status: ${response.status}, Body: ${textBody}`);
            }
            throw new ValidationError(response.status, errorBody);
        }

        return response;

    }, [accessToken, validateSession, setServerStatus]);

    return {apiClient};
}