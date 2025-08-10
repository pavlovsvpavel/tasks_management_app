import React from 'react';
import {View, Text, TouchableOpacity} from '@/components/Themed';
import DateTimePicker, {useDefaultClassNames, DateType} from 'react-native-ui-datepicker';
import {useTranslation} from 'react-i18next';
import i18n from "@/services/i18n";
import dayjs from "dayjs";
import {FilterPanelProps} from "@/interfaces/interfaces";


export function FilterPanel({
                                dateRange,
                                calendarKey,
                                onDateChange,
                                onTodayPress,
                                onClearPress
                            }: FilterPanelProps) {
    const {t} = useTranslation();
    const defaultClassNames = useDefaultClassNames();

    return (
        <View className="bg-card p-4 rounded-xl mb-4">
            <DateTimePicker
                key={calendarKey}
                mode="range"
                startDate={dateRange.startDate ? dayjs(dateRange.startDate) : undefined}
                endDate={dateRange.endDate ? dayjs(dateRange.endDate) : undefined}
                onChange={onDateChange}
                firstDayOfWeek={1}
                showOutsideDays={true}
                weekdaysFormat="short"
                monthsFormat="full"
                locale={i18n.language}
                classNames={{
                    ...defaultClassNames,
                    month_selector_label: 'text-primary font-bold text-lg',
                    year_selector_label: 'text-primary font-bold text-lg',
                    weekday_label: 'text-primary',
                    day_label: 'text-primary',
                    outside_label: 'text-primary opacity-30',

                    today: 'border-2 border-yellow-500 rounded-full',
                    today_label: 'text-primary',

                    selected: 'bg-blue-500 rounded-full',
                    selected_label: 'text-white font-bold',

                    range_start: 'bg-blue-500 rounded-full',
                    range_start_label: 'text-white font-bold',

                    range_end: 'bg-blue-500 rounded-full',
                    range_end_label: 'text-white font-bold',

                    range_fill: 'bg-blue-200',
                    range_middle_label: 'text-primary',
                }}
            />
            <View className="flex-row items-center mt-4 gap-x-16">
                <TouchableOpacity onPress={onTodayPress}
                                  className="flex-1 bg-blue-500 py-2 px-4 rounded-lg items-center">
                    <Text className="text-white font-bold">{t('userTasks.userTasksFilterTodayFilter')}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={onClearPress}
                                  className="flex-1 bg-red-500 py-2 px-4 rounded-lg items-center">
                    <Text className="text-white font-bold">{t('userTasks.userTasksFilterClearFilter')}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}