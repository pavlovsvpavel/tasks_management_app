import React from 'react';
import {Modal, TouchableOpacity, SafeAreaView} from 'react-native';
import {View, Text} from '@/components/Themed';
import {Ionicons} from '@expo/vector-icons';
import {useTheme} from '@/contexts/ThemeContext';
import {ReminderPickerModalProps} from "@/interfaces/interfaces";
import {useTranslation} from "react-i18next";


export default function ReminderPickerModal(
    {
        isVisible,
        onClose,
        options,
        onSelect,
        currentValue,
    }
    : ReminderPickerModalProps) {
    const {theme} = useTheme();
    const iconColor = theme === 'dark' ? '#FFF' : '#000';
    const {t} = useTranslation();

    const handleSelect = (value: number | null) => {
        onSelect(value);
        onClose();
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={isVisible}
            onRequestClose={onClose}
        >
            <View className="flex-1 px-5 bg-black/80">
                <TouchableOpacity className="flex-1" onPress={onClose}/>

                <SafeAreaView className="bg-card rounded-t-2xl">
                    <View className="p-4 border-default">
                        <Text className="text-lg text-center text-primary" weight="bold">
                            {t('reminderOptions.label')}
                        </Text>
                    </View>

                    {options.map((option) => (
                        <TouchableOpacity
                            key={option.label}
                            onPress={() => handleSelect(option.value)}
                            className="flex-row items-center justify-between p-4 border-b border-default"
                        >
                            <Text className="text-base text-primary">{option.label}</Text>
                            {currentValue === option.value && (
                                <Ionicons name="checkmark-sharp" size={24} color={iconColor}/>
                            )}
                        </TouchableOpacity>
                    ))}

                    <TouchableOpacity
                        onPress={onClose}
                        className="p-4 mt-2"
                    >
                        <Text className="text-base text-center text-red-500" weight="bold">
                            {t('cancel')}
                        </Text>
                    </TouchableOpacity>
                </SafeAreaView>
            </View>
        </Modal>
    );
}