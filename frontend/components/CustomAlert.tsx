import React from 'react';
import { View, Text, TouchableOpacity } from '@/components/Themed';
import {Ionicons} from '@expo/vector-icons';
import {CustomAlertProps} from "@/interfaces/interfaces";


export interface AlertButton {
    text: string;
    onPress?: () => void;
    style?: 'default' | 'cancel' | 'destructive';
}

const buttonClasses = {
    default: {
        button: 'bg-blue-500',
        text: 'text-white'
    },
    destructive: {
        button: 'bg-red-600',
        text: 'text-white'
    },
    cancel: {
        button: 'bg-gray-200',
        text: 'text-gray-800'
    },
};

export default function CustomAlert({isVisible, title, message, buttons}: CustomAlertProps) {
    if (!isVisible) return null;

    return (
        <View className="absolute inset-0 bg-black/60 justify-center items-center z-[10000]">
            <View className="w-[85%] max-w-[340px] bg-white p-6 rounded-2xl items-center shadow-lg shadow-black/25">
                <View className="mb-3">
                    <Ionicons name="information-circle-outline" size={48} color="#007AFF"/>
                </View>

                <Text className="text-gray-900 text-xl mb-2 text-center" weight="bold">
                    {title}
                </Text>

                {message && (
                    <Text className="text-gray-600 text-center mb-6 text-base leading-[22px]">
                        {message}
                    </Text>
                )}

                <View className="flex-row w-full gap-x-2.5">
                    {buttons.map((button, index) => {
                        const variant = button.style || 'default';
                        const variantClasses = buttonClasses[variant];

                        return (
                            <TouchableOpacity
                                key={index}
                                className={`flex-1 items-center justify-center py-3 rounded-lg ${variantClasses.button}`}
                                onPress={button.onPress}
                            >
                                <Text weight="bold" className={`text-base ${variantClasses.text}`}>
                                    {button.text}
                                </Text>
                            </TouchableOpacity>
                        )
                    })}
                </View>
            </View>
        </View>
    );
};