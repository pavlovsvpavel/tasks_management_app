import {Stack} from "expo-router";
import './globals.css';
import {useFonts} from "expo-font";
import {View} from "react-native";
import {StatusBar} from 'expo-status-bar';
import {RetryProvider} from "@/context/RetryContext";
import {AlertProvider} from "@/context/AlertContext";
import {PageLoadingSpinner} from "@/components/PageLoadingSpinner";
import {ServerStatusProvider, useServerStatus} from "@/context/ServerStatusContext";
import ServerStatusOverlay from "@/components/ServerStatusOverlay";
import {AuthProvider, useAuth} from '@/context/AuthContext';
import {RefreshProvider} from "@/context/RefreshContext";


export default function RootLayout() {
    return (
        <>
            <StatusBar style="dark" translucent={true}/>
            <AlertProvider>
                <RetryProvider>
                    <ServerStatusProvider>
                        <AuthProvider>
                            <RefreshProvider>
                                <AppContent/>
                            </RefreshProvider>
                        </AuthProvider>
                    </ServerStatusProvider>
                </RetryProvider>
            </AlertProvider>
        </>
    );
}

function AppContent() {
    const {isServerDown, isInitialCheckComplete} = useServerStatus();
    const {isLoading: isAuthLoading} = useAuth();

    const [fontsLoaded] = useFonts({
        'ubuntu-normal': require('../assets/fonts/Ubuntu-Regular.ttf'),
        'ubuntu-bold': require('../assets/fonts/Ubuntu-Bold.ttf'),
        'ubuntu-semibold': require('../assets/fonts/Ubuntu-Medium.ttf'),
        'ubuntu-light': require('../assets/fonts/Ubuntu-Light.ttf'),
    });

    const isAppLoading = !fontsLoaded || isAuthLoading || !isInitialCheckComplete;

    if (isAppLoading) {
        return (
            <View className="flex-1 justify-center items-center">
                <PageLoadingSpinner/>
            </View>
        );
    }

    if (isServerDown) {
        return <ServerStatusOverlay/>;
    }

    return (
        <>
            <RootNavigator/>
        </>
    );
}


function RootNavigator() {
    const {accessToken, isLoading: isAuthLoading} = useAuth();
    console.log('[RootNavigator] render, isAuthLoading:', isAuthLoading, 'at', new Date().toISOString());
    const isAuthenticated = !!accessToken;

    return (
        <Stack>
            <Stack.Protected guard={isAuthenticated}>
                <Stack.Screen
                    name="(tabs)"
                    options={{headerShown: false}}
                />
            </Stack.Protected>

            <Stack.Protected guard={!isAuthenticated}>
                <Stack.Screen
                    name="index"
                    options={{headerShown: false}}
                />
                <Stack.Screen
                    name="login"
                    options={{
                        headerShown: false, animationTypeForReplace: !accessToken ? 'pop' : 'push'
                    }}

                />
                <Stack.Screen
                    name="register"
                    options={{headerShown: false}}
                />
            </Stack.Protected>
        </Stack>
    )
}

