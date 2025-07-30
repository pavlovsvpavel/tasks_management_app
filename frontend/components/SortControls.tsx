import React from 'react';
import {View, Text, TouchableOpacity} from '@/components/Themed';
import {Ionicons} from '@expo/vector-icons';
import {SortControlsProps, SortField, SortDirection} from '@/interfaces/interfaces';

export const SortControls = (
    {
        sortBy,
        sortDirection,
        onSortChange,
    }: SortControlsProps) => {
    const getButtonClass = (field: SortField) => {
        return sortBy === field ? 'bg-btn_color' : 'bg-gray-300';
    };

    const getButtonTextClass = (field: SortField) => {
        return sortBy === field ? 'text-white' : 'text-primary';
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
        <View className="flex-row justify-end items-center mb-4 px-4 gap-3">
            <Text className="text-sm text-gray-500">Sort by:</Text>
            <SortButton field="due_date" label="Due Date"/>
            <SortButton field="title" label="Title"/>
        </View>
    );
};