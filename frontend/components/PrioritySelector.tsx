import React from 'react';
import {View, Text, TouchableOpacity} from '@/components/Themed';
import {PrioritySelectorProps, TaskResponse} from '@/interfaces/interfaces';
import {useTranslation} from "react-i18next";


type Priority = TaskResponse['priority'];

// Reusable styles object
const priorityStyles = {
    low: {borderColor: 'border-green-500', textColor: 'text-green-500', activeBg: 'bg-green-500'},
    medium: {borderColor: 'border-amber-500', textColor: 'text-amber-500', activeBg: 'bg-amber-500'},
    high: {borderColor: 'border-red-500', textColor: 'text-red-500', activeBg: 'bg-red-500'},
};

const priorities: Priority[] = ['low', 'medium', 'high'];

export const PrioritySelector = ({
                                     currentPriority,
                                     onPriorityChange,
                                 }: PrioritySelectorProps) => {

    const {t} = useTranslation();
    return (
        <View>
            <Text className="text-base font-semibold text-primary mb-2" weight="semibold">{t('createTaskPage.priority')}</Text>
            <View className="flex-row items-center gap-4">
                {priorities.map((level) => {
                    const isActive = currentPriority === level;
                    const styles = priorityStyles[level];
                    return (
                        <TouchableOpacity
                            key={level}
                            className={`flex-1 py-3 items-center rounded-xl border-2 ${
                                isActive ? `${styles.activeBg} ${styles.borderColor}` : `bg-card ${styles.borderColor}`
                            }`}
                            onPress={() => onPriorityChange(level)}
                        >
                            <Text
                                className={`font-semibold ${
                                    isActive ? 'text-white' : styles.textColor
                                }`}
                            >
                                {t(`priority.${level}`)}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
};