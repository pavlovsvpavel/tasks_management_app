import {useCallback} from 'react';
import {useAuth} from '@/context/AuthContext';
import {useServerStatus} from "@/context/ServerStatusContext";
import {
    ServerDownError,
    SessionExpiredError,
    SessionRefreshedError,
    ValidationError
} from '@/utils/errors';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

interface ApiClientOptions extends RequestInit {
    retryOn401?: boolean;
}

export function useApiClient() {
    const {accessToken, validateSession} = useAuth();
    const {setServerStatus} = useServerStatus();

    const apiClient = useCallback(async (
        endpoint: string,
        options: ApiClientOptions = {}
    ): Promise<Response> => {
        const {retryOn401 = true, ...fetchOptions} = options;

        if (!accessToken) {
            throw new SessionExpiredError();
        }

        const makeRequest = async (token: string): Promise<Response> => {
            const defaultHeaders = {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            };
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

        if (response.status === 401) {
            console.log('[ApiClient] Token expired. Attempting refresh...');
            try {
                const validationResult = await validateSession();

                if (!validationResult.isValid || !validationResult.accessToken) {
                    throw new SessionExpiredError("Session is invalid after attempting refresh.");
                }

                if (retryOn401) {
                    console.log('[ApiClient] Session refreshed. Retrying original request...');
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

        // if (!response.ok) {
        //     const errorBody = await response.text();
        //     throw new Error(`HTTP error! Status: ${response.status}, Body: ${errorBody}`);
        // }

        if (!response.ok) {
            let errorBody = {};
            try {
                errorBody = await response.json();
            } catch (e) {
                // If the error response isn't valid JSON, throw a generic HTTP error.
                const textBody = await response.text();
                throw new Error(`HTTP error! Status: ${response.status}, Body: ${textBody}`);
            }
            // Throw our structured error for the component to handle.
            throw new ValidationError(response.status, errorBody);
        }

        return response;

    }, [accessToken, validateSession]);

    return {apiClient};
}