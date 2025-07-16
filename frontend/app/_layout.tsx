import {Stack} from "expo-router";
import './globals.css';
import {SessionProvider} from '@/context/ctx';
import {SplashScreenController} from '@/screens/SplashScreen';
import {useSession} from '@/context/ctx';
import {StatusBar} from 'expo-status-bar';

export default function RootLayout() {
    return (
        <>
            <StatusBar
                style="dark"
                translucent={true}
            />
            <SessionProvider>
                <SplashScreenController/>
                <RootNavigator/>
            </SessionProvider>
        </>

    );
}

function RootNavigator() {
    const {session} = useSession();
    const isAuthenticated = session !== null && session !== undefined;

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
                    options={{headerShown: false}}
                />
                <Stack.Screen
                    name="register"
                    options={{headerShown: false}}
                />
            </Stack.Protected>
        </Stack>
    )
}

