import React from 'react';
import {View, Text, TouchableOpacity} from '@/components/Themed';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import {useTranslation} from "react-i18next";

type IconName = 'sunny-outline' | 'moon-outline' | 'cog-outline';

const ThemeSwitcher = () => {
    const {t} = useTranslation();
    const { theme, themePreference, setThemePreference } = useTheme();

    const themeOptions: { key: 'light' | 'dark' | 'system'; label: string; iconName: IconName }[] = [
        { key: 'system', label: t('automatic'), iconName: 'cog-outline' },
        { key: 'light', label: t('light'), iconName: 'sunny-outline' },
        { key: 'dark', label: t('dark'), iconName: 'moon-outline' },
    ];

    const radioColor = '#3B82F6';
    const themeAwareIconColor = theme === 'dark' ? '#E5E7EB' : '#1F2937';

    return (
        <View className="flex-1 gap-3 border-t border-default mt-4 pt-4">
            {themeOptions.map((option) => (
                <TouchableOpacity
                    key={option.key}
                    className="flex-row items-center justify-between p-3 rounded-lg"
                    onPress={() => setThemePreference(option.key)}
                    activeOpacity={0.7}
                >
                    <View className="flex-row items-center">
                        <Ionicons
                            name={option.iconName}
                            size={24}
                            color={themeAwareIconColor}
                        />
                        <Text className="ml-4 text-base text-primary">
                            {option.label}
                        </Text>
                    </View>

                    <Ionicons
                        name={themePreference === option.key ? 'radio-button-on' : 'radio-button-off'}
                        size={24}
                        color={radioColor}
                    />
                </TouchableOpacity>
            ))}
        </View>
    );
};

export default ThemeSwitcher;