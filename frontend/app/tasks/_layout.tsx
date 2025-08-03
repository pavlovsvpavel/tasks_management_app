import {Stack} from 'expo-router';
import {SafeAreaView} from "react-native-safe-area-context";

export default function TasksLayout() {
    return (
        <SafeAreaView
            edges={['top', 'left', 'right', 'bottom']}
            className="flex-1 px-5 pt-5 bg-bgnd">
            <Stack
                screenOptions={{
                    headerShown: false,
                }}
            />
        </SafeAreaView>
    );
}