import {ActivityIndicator, SafeAreaView} from "react-native";

export function PageLoadingSpinner() {
    return (
        <SafeAreaView className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#3B82F6"/>
        </SafeAreaView>
    );
}

