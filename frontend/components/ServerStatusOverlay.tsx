import {useState} from 'react';
import { View, Text, TouchableOpacity } from '@/components/Themed';
import {useServerStatus} from "@/contexts/ServerStatusContext";
import {useRetry} from "@/contexts/RetryContext";
import {ButtonSpinner} from "@/components/ButtonSpinner";

export default function ServerStatusOverlay() {
    const {isServerDown, checkHealth} = useServerStatus();
    const {triggerRetry} = useRetry();
    const [isRetrying, setIsRetrying] = useState(false);

    if (!isServerDown) return null;

    const handleRetry = async () => {
        setIsRetrying(true);
        const isServerNowUp = await checkHealth();
        if (isServerNowUp) {
            triggerRetry();
        }
        setIsRetrying(false);
    };

    return (
        <View className="absolute inset-0 bg-black/85 justify-center items-center z-[9999]">
            <View className="w-4/5 bg-zinc-800 p-5 rounded-lg items-center border border-zinc-700">
                <Text className="text-white text-xl mb-3" weight="bold">
                    Service Unavailable
                </Text>
                <Text className="text-neutral-200 text-center mb-5">
                    Our services are temporarily down. Please try again later.
                </Text>
                <TouchableOpacity
                    className="bg-[#007AFF] py-2.5 px-5 rounded-lg min-w-[150px] items-center justify-center disabled:opacity-50"
                    onPress={handleRetry}
                    disabled={isRetrying}
                >
                    {isRetrying ? (
                        <ButtonSpinner/>
                    ) : (
                        <Text className="text-white" weight="bold">Retry Connection</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
};
