import {View, Text, TouchableOpacity, TextInput} from '@/components/Themed';
import Ionicons from '@expo/vector-icons/Ionicons';
import {PrioritySelector} from "@/components/PrioritySelector";
import {ButtonSpinner} from "@/components/ButtonSpinner";
import {TaskFormProps} from "@/interfaces/interfaces";
import React, {useState} from "react";
import {useTranslation} from "react-i18next";
import ReminderPickerModal from "@/components/ReminderPickerModal";


const textInputClass = "input-default border-default text-primary focus:border-blue-500 focus:ring-blue-500";
const labelClass = "text-base font-semibold text-primary mb-2";
export type Priority = 'low' | 'medium' | 'high';

const TaskForm: React.FC<TaskFormProps> = (
    {
        title,
        description,
        dueDate,
        priority,

        onTitleChange,
        onDescriptionChange,
        onPriorityChange,

        onShowDatePicker,
        onSubmit,

        isSubmitting,
        submitButtonText,
        submitButtonIconName,
        formatDisplayDate,

        reminderOffset,
        onReminderChange,
        reminderOptions
    }
) => {
    const {t} = useTranslation();
    const [isReminderPickerVisible, setReminderPickerVisibility] = useState(false);
    const showReminderPicker = () => setReminderPickerVisibility(true);
    const hideReminderPicker = () => setReminderPickerVisibility(false);

    const handleSelectReminder = (value: number | null) => {
        onReminderChange(value);
        hideReminderPicker();
    };

    const formatDisplayReminder = (value: number | null) => {
        const selectedOption = reminderOptions.find(opt => opt.value === value);
        return selectedOption ? selectedOption.label : 'Select a reminder';
    };

    return (
        <View className="flex-1 gap-3 bg-card rounded-xl p-5">
            {/* Title Input */}
            <View>
                <Text className={labelClass} weight="semibold">{t('createTaskPage.title')}</Text>
                <TextInput
                    className={textInputClass}
                    value={title}
                    onChangeText={onTitleChange}
                    placeholder={t('createTaskPage.titlePlaceholder')}
                    placeholderTextColor="#9CA3AF"
                />
            </View>

            {/* Description Input */}
            <View>
                <Text className={labelClass} weight="semibold">{t('createTaskPage.description')}</Text>
                <TextInput
                    className={`${textInputClass} h-32`}
                    value={description}
                    onChangeText={onDescriptionChange}
                    placeholder={t('createTaskPage.descriptionPlaceholder')}
                    placeholderTextColor="#9CA3AF"
                    multiline
                    textAlignVertical="top"
                />
            </View>

            {/* Due Date Picker */}
            <View>
                <Text className={labelClass} weight="semibold">{t('createTaskPage.dueDate')}</Text>
                <TouchableOpacity
                    onPress={onShowDatePicker}
                    className={`${textInputClass} flex-row items-center justify-between`}
                >
                    <Text className={`text-base ${dueDate ? 'text-primary' : 'text-secondary'}`}>
                        {formatDisplayDate(dueDate)}
                    </Text>
                    <Ionicons name="calendar-outline" size={20} color="#6B7280"/>
                </TouchableOpacity>
            </View>

            {/* Reminder Time Picker Modal */}
            <View>
                <Text className={labelClass} weight="semibold">{t('createTaskPage.reminderLabel')}</Text>
                <TouchableOpacity
                    onPress={showReminderPicker}
                    className={`${textInputClass} flex-row items-center justify-between`}
                >
                    <Text className={`text-base ${reminderOffset !== null ? 'text-primary' : 'text-secondary'}`}>
                        {formatDisplayReminder(reminderOffset)}
                    </Text>
                    <Ionicons name="alarm-outline" size={20} color="#6B7280"/>
                </TouchableOpacity>
            </View>

            {/* Priority Buttons */}
            <PrioritySelector
                currentPriority={priority}
                onPriorityChange={onPriorityChange}
            />
            <ReminderPickerModal
                isVisible={isReminderPickerVisible}
                onClose={hideReminderPicker}
                options={reminderOptions}
                onSelect={handleSelectReminder}
                currentValue={reminderOffset}
            />

            {/* Dynamic Submit Button */}
            <TouchableOpacity
                className="btn-primary mt-6"
                onPress={onSubmit}
                disabled={isSubmitting}
            >
                {isSubmitting ? (
                    <ButtonSpinner/>
                ) : (
                    <>
                        <Ionicons name={submitButtonIconName} size={20} color="#ffffff"/>
                        <Text className="btn-primary-text text-base ml-2" weight="bold">{submitButtonText}</Text>
                    </>
                )}
            </TouchableOpacity>
        </View>
    );
};

export default TaskForm;