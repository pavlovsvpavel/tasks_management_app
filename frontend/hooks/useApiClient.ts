// src/hooks/useApiClient.ts

import { useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useServerStatus } from "@/context/ServerStatusContext";
import {
    ServerDownError,
    SessionExpiredError,
    SessionRefreshedError,
    ValidationError
} from '@/utils/errors';

// The API_URL and APP_KEY should be loaded from your .env file
const API_URL = process.env.EXPO_PUBLIC_API_URL;
const APP_KEY = process.env.EXPO_PUBLIC_APP_KEY;

// Define the options type for better autocompletion and type safety
interface ApiClientOptions extends RequestInit {
    // Allows a caller to opt-out of the automatic retry-on-401 behavior
    retryOn401?: boolean;
}

export function useApiClient() {
    // Get the current token and the session validation function from your auth context
    const { accessToken, validateSession } = useAuth();
    // Get the function to update the server status from its context
    const { setServerStatus } = useServerStatus();

    const apiClient = useCallback(async (
        endpoint: string,
        options: ApiClientOptions = {}
    ): Promise<Response> => {
        // Separate our custom option from the standard fetch options
        const { retryOn401 = true, ...fetchOptions } = options;

        /**
         * An inner function to construct and execute the actual fetch call.
         * This allows us to call it once for the initial request, and a second
         * time if we need to retry after a token refresh.
         * @param token The access token to use for the request.
         */
        const makeRequest = async (token: string | null): Promise<Response> => {
            // Start with a base set of headers required for every request
            const defaultHeaders: Record<string, string> = {
                'X-App-Key': APP_KEY || '', // Ensure APP_KEY is not undefined
            };

            // If an access token is provided, add the Authorization header
            if (token) {
                defaultHeaders['Authorization'] = `Bearer ${token}`;
            }

            // IMPORTANT: If the body is FormData, the browser must set the
            // Content-Type header itself to include the multipart boundary.
            // Do not set it manually in this case.
            if (!(fetchOptions.body instanceof FormData)) {
                defaultHeaders['Content-Type'] = 'application/json';
            }

            // Combine all configurations
            const config: RequestInit = {
                ...fetchOptions,
                headers: { ...defaultHeaders, ...fetchOptions.headers },
            };

            try {
                // Execute the fetch call
                const response = await fetch(`${API_URL}${endpoint}`, config);
                // If the request succeeds, we know the server is up.
                setServerStatus(false);
                return response;
            } catch (error) {
                // Catch low-level network errors (e.g., DNS failure, no connection)
                if (error instanceof TypeError && error.message === 'Network request failed') {
                    setServerStatus(true); // Mark the server as down
                    throw new ServerDownError();
                }
                // Re-throw any other unexpected errors
                throw error;
            }
        };

        // --- Main Execution Flow ---

        // 1. Make the initial request using the current access token (which could be null)
        let response = await makeRequest(accessToken);

        // 2. If the request fails with a 401 Unauthorized, and we had a token to begin with,
        //    it likely means the access token expired.
        if (response.status === 401 && accessToken) {
            console.log('[ApiClient] Access token expired or invalid. Attempting to refresh session...');
            try {
                // Call the function from AuthContext to handle the refresh token logic
                const validationResult = await validateSession();

                // If the session could not be refreshed, the user must log in again.
                if (!validationResult.isValid || !validationResult.accessToken) {
                    throw new SessionExpiredError("Session is invalid after attempting refresh.");
                }

                // If the original caller wants to retry the request, do so with the new token.
                if (retryOn401) {
                    console.log('[ApiClient] Session refreshed successfully. Retrying original request...');
                    response = await makeRequest(validationResult.accessToken);
                } else {
                    // If the caller opted out of retrying, we still throw a special error
                    // to let them know the session was refreshed and they can take action.
                    console.log('[ApiClient] Session refreshed. Not retrying request as per options.');
                    throw new SessionRefreshedError();
                }
            } catch (error) {
                // Ensure we bubble up the specific session errors correctly
                if (error instanceof SessionRefreshedError || error instanceof SessionExpiredError) {
                    throw error;
                }
                // Handle any other unexpected errors during the refresh process
                console.error('[ApiClient] Unexpected error during session refresh:', error);
                throw new SessionExpiredError("An unexpected error occurred during session refresh.");
            }
        }

        // 3. After the request (and potential retry), check if it was successful.
        if (!response.ok) {
            let errorBody: any = {};
            try {
                // Try to parse the error response as JSON, which is what FastAPI usually sends
                errorBody = await response.json();
            } catch (e) {
                // If the error response isn't JSON (e.g., from Nginx or another proxy),
                // use the raw text body.
                const textBody = await response.text();
                throw new Error(`HTTP error! Status: ${response.status}, Body: ${textBody}`);
            }
            // Throw our custom structured error for components to handle gracefully.
            throw new ValidationError(response.status, errorBody);
        }

        // 4. If everything was successful, return the final response object.
        return response;

    }, [accessToken, validateSession, setServerStatus]); // Dependencies for the useCallback hook

    return { apiClient };
}