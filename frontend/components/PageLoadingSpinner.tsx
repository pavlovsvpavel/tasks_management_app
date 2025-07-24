import {SafeAreaView} from "react-native-safe-area-context";
import LottieView from 'lottie-react-native';

import ANIMATION_SOURCE from '../assets/animations/loading_wave.json';

export function PageLoadingSpinner() {
    return (
        <SafeAreaView className="flex-1 justify-center items-center bg-white">
            <LottieView
                source={ANIMATION_SOURCE}
                style={{
                    width: 200,
                    height: 200,
                }}
                autoPlay
                loop
            />
        </SafeAreaView>
    );
}

