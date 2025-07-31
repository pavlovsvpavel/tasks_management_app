import {Stack} from "expo-router";
import './globals.css';
import '../i18n';
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
import {TaskCacheProvider} from "@/context/TaskCacheContext";
import {ThemeProvider} from '@/context/ThemeContext';
import {useTheme} from '@/context/ThemeContext';

export default function RootLayout() {
    return (
        <ThemeProvider>
            <AlertProvider>
                <RetryProvider>
                    <ServerStatusProvider>
                        <TaskCacheProvider>
                            <AuthProvider>
                                <RefreshProvider>
                                    <AppContent/>
                                </RefreshProvider>
                            </AuthProvider>
                        </TaskCacheProvider>
                    </ServerStatusProvider>
                </RetryProvider>
            </AlertProvider>
        </ThemeProvider>
    );
}

function AppContent() {
    const {isServerDown, isInitialCheckComplete} = useServerStatus();
    const {isLoading: isAuthLoading} = useAuth();
    const {theme} = useTheme();

    const [fontsLoaded] = useFonts({
        'ubuntu-normal': require('../assets/fonts/Ubuntu-Regular.ttf'),
        'ubuntu-bold': require('../assets/fonts/Ubuntu-Bold.ttf'),
        'ubuntu-semibold': require('../assets/fonts/Ubuntu-Medium.ttf'),
        'ubuntu-light': require('../assets/fonts/Ubuntu-Light.ttf'),
        'ubuntu-italic': require('../assets/fonts/Ubuntu-Italic.ttf'),
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
            <StatusBar style={theme === 'dark' ? 'light' : 'dark'}/>
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
                <Stack.Screen
                    name="tasks"
                    options={{ headerShown: false }}
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

