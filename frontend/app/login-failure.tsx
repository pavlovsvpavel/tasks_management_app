import {useRouter, useLocalSearchParams} from 'expo-router';
import LoginFailureUI from '@/components/LoginFailureUI';


export default function LoginFailureScreen() {
    const router = useRouter();
    const {error} = useLocalSearchParams<{ error?: string }>();

    const errorMessage = error || "An unexpected error occurred. Please try again.";

    const handleRetry = () => {
        router.replace('/');
    };

    return (
        <LoginFailureUI
            errorMessage={errorMessage}
            onRetry={handleRetry}
        />
    );
}