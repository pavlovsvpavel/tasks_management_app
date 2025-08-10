import React from 'react';
import {View, Text, TouchableOpacity} from '@/components/Themed';
import {Ionicons} from '@expo/vector-icons';
import {SortControlsProps, SortField} from '@/interfaces/interfaces';
import {useTranslation} from "react-i18next";

export const SortControls = (
    {
        sortBy,
        sortDirection,
        onSortChange,
    }: SortControlsProps) => {
    const {t} = useTranslation();
    const getButtonClass = (field: SortField) => {
        return sortBy === field ? 'bg-[#3B82F6]' : 'btn-inactive';
    };

    const getButtonTextClass = (field: SortField) => {
        return sortBy === field ? 'text-white' : 'text-white';
    };

    const SortButton = ({field, label}: { field: SortField, label: string }) => (
        <TouchableOpacity
            className={`flex-row items-center justify-center py-2 px-4 rounded-full ${getButtonClass(field)}`}
            onPress={() => onSortChange(field)}
        >
            <Text className={`${getButtonTextClass(field)}`} weight="semibold">{label}</Text>
            {sortBy === field && (
                <Ionicons
                    name={sortDirection === 'asc' ? 'arrow-up' : 'arrow-down'}
                    size={16}
                    color="white"
                    style={{marginLeft: 8}}
                />
            )}
        </TouchableOpacity>
    );

    return (
        <View className="flex-row justify-end items-center gap-x-5 mb-4">
            <Text className="text-sm text-primary">{t('userTasks.userTasksSortTitle')}</Text>
            <SortButton field="due_date" label={t('userTasks.userTasksSortByDueDate')}/>
            <SortButton field="status" label={t('userTasks.userTasksSortByStatus')}/>
        </View>
    );
};