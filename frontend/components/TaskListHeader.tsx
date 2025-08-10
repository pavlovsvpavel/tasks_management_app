import React from 'react';
import {View, Text, TouchableOpacity} from '@/components/Themed';
import {Ionicons, MaterialCommunityIcons} from '@expo/vector-icons';
import {useTranslation} from 'react-i18next';
import {TaskListHeaderProps} from "@/interfaces/interfaces";


export function TaskListHeader({isSortingVisible, isFilterVisible, onSortPress, onFilterPress}: TaskListHeaderProps) {
    const {t} = useTranslation();

    return (
        <View className="flex-row justify-between items-center mb-8">
            <Text className="text-xl text-primary" weight="bold">
                {t('yourTasks')}
            </Text>
            <View className="flex-row gap-x-12 items-center">
                <TouchableOpacity onPress={onSortPress}>
                    <MaterialCommunityIcons name={"sort"} size={26} color={isSortingVisible ? '#EF4444' : '#3B82F6'}/>
                </TouchableOpacity>
                <TouchableOpacity onPress={onFilterPress}>
                    <Ionicons name={"calendar-outline"} size={26} color={isFilterVisible ? '#EF4444' : '#3B82F6'}/>
                </TouchableOpacity>
            </View>
        </View>
    );
}