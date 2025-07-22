import {Stack} from "expo-router";
import './globals.css';
import {SessionProvider, useSession} from '@/context/AuthContext';
import {SplashScreenController} from '@/screens/SplashScreen';
import {View} from "react-native";
import {StatusBar} from 'expo-status-bar';
import {PageLoadingSpinner} from "@/components/PageLoadingSpinner";
import {ServerStatusProvider, useServerStatus} from "@/context/ServerStatusContext";
import {RefreshProvider} from "@/context/RefreshContext";
import ServerStatusOverlay from "@/components/ServerStatusOverlay";
import {RetryProvider} from "@/context/RetryContext";
import SessionStatusOverlay from "@/components/SessionStatusOverlay";
import {AlertProvider} from "@/context/AlertContext";


export default function RootLayout() {
    return (
        <>
            <StatusBar style="dark" translucent={true}/>
            <AlertProvider>
            <RetryProvider>
                <ServerStatusProvider>
                    <SessionProvider>
                        <RefreshProvider>
                            <SplashScreenController/>
                            <AppContent/>
                        </RefreshProvider>
                    </SessionProvider>
                </ServerStatusProvider>
            </RetryProvider>
                </AlertProvider>
        </>
    );
}

function AppContent() {
    const {isServerDown} = useServerStatus();

    return (
        <>
            <RootNavigator/>
            {isServerDown && <ServerStatusOverlay/>}
        </>
    );
}


function RootNavigator() {
    const {accessToken, isLoading: isSessionLoading, sessionError} = useSession();
    console.log('RootNavigator render, isSessionLoading:', isSessionLoading, 'at', new Date().toISOString());

    if (isSessionLoading) {
        return (
            <View className="flex-1 justify-center items-center">
                <PageLoadingSpinner/>
            </View>
        );
    }

    if (sessionError === 'SESSION_EXPIRED') {
        return <SessionStatusOverlay />;
    }

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

