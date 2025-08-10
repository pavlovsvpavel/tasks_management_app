import {useTranslation} from 'react-i18next';
import {View, Text} from '@/components/Themed';
import {Ionicons} from '@expo/vector-icons';
import React from "react";
import {TaskEmptyProps} from "@/interfaces/interfaces";


export const TaskEmptyState = ({totalTaskCount, isFilterActive}: TaskEmptyProps) => {
    const {t} = useTranslation();

    let iconName: React.ComponentProps<typeof Ionicons>['name'] = 'file-tray-outline';
    let titleKey = 'noTasks';
    let descriptionKey = 'noTasksDescription';

    if (isFilterActive && totalTaskCount > 0) {
        iconName = 'search-outline';
        titleKey = 'noTasksMatchFilter';
        descriptionKey = 'noTasksMatchFilterDescription';
    }

    return (
        <View className="flex-1 justify-center items-center mt-2 px-6">
            <Ionicons name={iconName} size={64} color="#676767"/>
            <Text className="text-lg text-primary text-center mt-4" weight="bold">
                {t(titleKey)}
            </Text>
            <Text className="text-secondary text-center" weight="normal">
                {t(descriptionKey)}
            </Text>
        </View>
    );
};