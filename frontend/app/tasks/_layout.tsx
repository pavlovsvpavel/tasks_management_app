import {Stack} from 'expo-router';
import CustomScreenContainer from '@/components/CustomScreenContainer';

export default function TasksLayout() {
    return (
        <CustomScreenContainer>
            <Stack
                screenOptions={{
                    headerShown: false,
                    animation: 'slide_from_right',
                    gestureEnabled: true,
                }}
            />
        </CustomScreenContainer>
    );
}