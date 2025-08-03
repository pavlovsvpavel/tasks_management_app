import {SafeAreaView} from "react-native-safe-area-context";
import {ActivityIndicator} from "react-native";

export function PageLoadingSpinner() {
    return (
        <SafeAreaView className="flex-1 w-full bg-bgnd justify-center items-center">
            <ActivityIndicator size="large" color="#3B82F6"/>
        </SafeAreaView>
    );
}

