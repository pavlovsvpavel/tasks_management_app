import {Stack} from 'expo-router';
import ScreenContainer from '@/components/ScreenContainer';

export default function TasksLayout() {
    return (
        <ScreenContainer>
            <Stack
                screenOptions={{
                    headerShown: false,
                    animation: 'slide_from_right',
                    gestureEnabled: true,
                }}
            />
        </ScreenContainer>
    );
}