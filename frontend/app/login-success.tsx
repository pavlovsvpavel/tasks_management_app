import {useEffect} from 'react';
import {useRouter, useLocalSearchParams} from 'expo-router';
import {useAuth} from '@/contexts/AuthContext';
import {PageLoadingSpinner} from "@/components/PageLoadingSpinner";

/**
 * This is a "ghost" screen. It is the designated redirect target for the OAuth flow.
 * Its sole purpose is to:
 * 1. Capture the access and refresh tokens from the URL query parameters.
 * 2. Save these tokens using the authentication context.
 * 3. Immediately redirect the user to the main, authenticated part of the app.
 * The user should only see the loading spinner for a brief moment.
 */
export default function LoginSuccessScreen() {
    const {setTokens} = useAuth();
    const router = useRouter();

    const {access_token, refresh_token} = useLocalSearchParams<{ access_token: string, refresh_token: string }>();

    useEffect(() => {
        const processTokens = async () => {
            if (access_token && refresh_token) {
                console.log("Processing tokens from OAuth callback...");

                try {
                    const tokenPair = {
                        accessToken: access_token,
                        refreshToken: refresh_token,
                        isRefreshed: false,
                    };

                    await setTokens(tokenPair);
                    console.log("Tokens stored successfully. Navigating to main app area.");
                    router.replace('/(tabs)/userTasks');
                } catch (error) {
                    console.error("Failed to store tokens:", error);
                    router.replace('/');
                }
            } else {
                console.error("LoginSuccessScreen reached without required tokens in URL parameters.");
                console.warn(`Received - access_token: ${!!access_token}, refresh_token: ${!!refresh_token}`);
                router.replace('/');
            }
        };

        processTokens();
    }, [access_token, refresh_token]);

    return (
        <PageLoadingSpinner/>
    );
}