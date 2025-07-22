import {useEffect, useCallback} from 'react';
import {useFonts} from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import {useSession} from '@/context/AuthContext';

SplashScreen.preventAutoHideAsync();

export function SplashScreenController() {
    const {isLoading: isSessionLoading} = useSession();

    const [fontsLoaded, fontError] = useFonts({});

    const onAppReady = useCallback(async () => {
        const isAppReady = !isSessionLoading && fontsLoaded;

        console.log(`[SplashScreen] Checking if app is ready... Session Loading: ${isSessionLoading}, Fonts Loaded: ${fontsLoaded}. App is Ready: ${isAppReady}`);

        if (isAppReady) {
            await SplashScreen.hideAsync();
            console.log('[SplashScreen] App is ready, hiding splash screen.');
        }
    }, [isSessionLoading, fontsLoaded]);

    useEffect(() => {
        if (fontError) {
            console.error("[SplashScreen] Font loading error:", fontError);
            SplashScreen.hideAsync();
        }

        onAppReady();

    }, [onAppReady, fontError]);

    return null;
}