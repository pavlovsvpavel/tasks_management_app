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
        if (access_token && refresh_token) {
            console.log("Processing tokens on login-success screen...");

            const tokenPair = {
                accessToken: access_token,
                refreshToken: refresh_token,
                isRefreshed: false,
            };

            setTokens(tokenPair).then(() => {
                console.log("Tokens stored successfully. Navigating to main app area.");
                router.replace('/(tabs)/userTasks');
            });
        } else {
            console.error("LoginSuccessScreen was reached without the required tokens in the URL.");
            router.replace('/');
        }
    }, [access_token, refresh_token]);


    return (
        <PageLoadingSpinner/>
    );
}