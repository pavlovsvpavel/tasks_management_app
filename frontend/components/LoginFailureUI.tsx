import {Button} from 'react-native';
import {View, Text} from '@/components/Themed';
import CustomScreenContainer from "@/components/CustomScreenContainer";


interface LoginFailureUIProps {
    errorMessage: string;
    onRetry: () => void;
}

/**
 * This is the "dumb" UI component for the login failure screen.
 * It is only responsible for displaying the error and the retry button.
 * It receives all data and actions as props.
 */
export default function LoginFailureUI({errorMessage, onRetry}: LoginFailureUIProps) {
    return (
        <CustomScreenContainer>
            <View className=" flex-1 gap-8 px-3 items-center justify-center">
                <Text className="text-xl text-primary" weight="bold">
                    Login Failed
                </Text>
                <Text className="text-primary text-center" weight="italic">
                    {errorMessage}
                </Text>
                <Button title="Try Again" onPress={onRetry}/>
            </View>
        </CustomScreenContainer>

    );
}