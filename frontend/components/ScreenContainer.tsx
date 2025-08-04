import React from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';

type ScreenContainerProps = {
    children: React.ReactNode;
    edges?: ('top' | 'bottom' | 'left' | 'right')[];
    style?: object;
};

export default function ScreenContainer({
                                            children,
                                            edges = ['top', 'left', 'right', 'bottom'],
                                        }: ScreenContainerProps) {
    return (
        <SafeAreaView edges={edges} className="flex-1 px-5 pt-5 bg-bgnd">
            {children}
        </SafeAreaView>
    );
}
