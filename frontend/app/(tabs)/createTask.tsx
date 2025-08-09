import {useCallback, useMemo, useState} from 'react';
import {ScrollView, KeyboardAvoidingView} from 'react-native';
import {View, Text, TouchableOpacity} from '@/components/Themed';
import {router, useFocusEffect} from 'expo-router';
import {Ionicons} from "@expo/vector-icons";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import {useApiClient} from '@/hooks/useApiClient';
import {PageLoadingSpinner} from "@/components/PageLoadingSpinner";
import {useAlert} from "@/contexts/AlertContext";
import {useApiErrorHandler} from '@/hooks/useApiErrorHandler';
import TaskForm from "@/components/TaskForm";
import {useTranslation} from "react-i18next";
import {TaskResponse} from "@/interfaces/interfaces";
import {scheduleTaskNotification} from "@/services/NotificationService";
import {getReminderOptions} from "@/utils/reminderOptions";


export default function CreateTaskScreen() {
    const {showAlert} = useAlert();
    const {apiClient} = useApiClient();
    const [isCreating, setIsCreating] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState<Date | null>(null);
    const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [isScreenLoading, setIsScreenLoading] = useState(true);
    const {t} = useTranslation();
    const [reminderOffset, setReminderOffset] = useState<number | null>(30);
    const reminderOptions = useMemo(() => getReminderOptions(t), [t]);

    useFocusEffect(
        useCallback(() => {
            setIsScreenLoading(true);

            const timer = setTimeout(() => {
                setIsScreenLoading(false);
            }, 200);
            return () => {
                clearTimeout(timer);
            };
        }, [])
    );

    const showDatePicker = () => {
        setDatePickerVisibility(true);
    };
    const hideDatePicker = () => {
        setDatePickerVisibility(false);
    };

    const handleConfirmDate = (date: Date) => {
        setDueDate(date);
        hideDatePicker();
    };

    const formatDisplayDate = (date: Date | null) => {
        if (!date) return t('createTaskPage.dueDateDescription');

        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();

        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');

        return `${day}-${month}-${year} at ${hours}:${minutes}`;
    }

    const handleApiError = useApiErrorHandler({
        validationTitles: {
            task: 'Creation Failed'
        }
    });

    const handleCreateTask = async () => {
        if (!title || !dueDate || !priority) {
            showAlert({
                title: t('createTaskPage.missingFieldsTitle'),
                message: t('createTaskPage.missingFieldsMessage'),
                buttons: [{text: 'OK'}]
            });
            return;
        }

        setIsCreating(true);
        try {
            const response = await apiClient('/tasks/create', {
                method: 'POST',
                body: JSON.stringify({
                    title: title,
                    description: description,
                    priority: priority,
                    due_date: dueDate.toISOString(),
                }),
                retryOn401: false,
            });

            const createdTask: TaskResponse = await response.json();

            if (createdTask) {
                const newNotificationId = await scheduleTaskNotification({
                        id: createdTask.id,
                        title: createdTask.title,
                        dueDate: createdTask.due_date,
                        notification_id: null
                    }, reminderOffset
                );
                console.log('[Create Task] Scheduling complete. Notification ID is:', newNotificationId);

                if (newNotificationId) {
                    try {
                        console.log(`[Create Task] Attempting to PATCH task ${createdTask.id} with notification_id: ${newNotificationId}`);

                        const updateResponse = await apiClient(`/tasks/update/${createdTask.id}`, {
                            method: 'PATCH',
                            body: JSON.stringify({
                                notification_id: newNotificationId
                            }),
                        });

                        if (!updateResponse.ok) {
                            console.error('[Create Task] Failed to update task with notification ID. Status:', updateResponse.status);
                        } else {
                            console.log('[Create Task] Successfully updated task with notification ID.');
                        }

                    } catch (updateError) {
                        console.error('[Create Task] Error during the notification ID update PATCH call:', updateError);
                    }
                }
            }
            showAlert({
                title: t('createTaskPage.successFieldsTitle'),
                message: t('createTaskPage.successFieldsMessage'),
                buttons: [
                    {
                        text: t('createTaskPage.successFieldsButtonCreateAnother'),
                        onPress: () => {
                        },
                        style: 'cancel'
                    },
                    {
                        text: t('createTaskPage.successFieldsButtonViewTasks'),
                        onPress: () => router.push('/userTasks'),
                        style: 'default'
                    }
                ]
            });

            setTitle('');
            setDescription('');
            setPriority('medium');
            setDueDate(null);
        } catch (error) {
            handleApiError(error, 'task');
        } finally {
            setIsCreating(false);
        }
    };

    if (isScreenLoading) {
        return <PageLoadingSpinner/>;
    }

    return (
        <KeyboardAvoidingView
            className="flex-1"
            behavior="height"
        >
            <ScrollView
                className="bg-bgnd"
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View className="flex-row justify-between items-center mb-5">
                    <Text className="text-xl text-primary" weight="bold">{t('createTaskPage.createNewTask')}</Text>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="close-outline" size={24} color="#EF4444"/>
                    </TouchableOpacity>
                </View>
                {/* Form Fields */}
                <TaskForm
                    title={title}
                    description={description}
                    dueDate={dueDate}
                    priority={priority}
                    onTitleChange={setTitle}
                    onDescriptionChange={setDescription}
                    onPriorityChange={setPriority}
                    onShowDatePicker={showDatePicker}
                    onSubmit={handleCreateTask}
                    isSubmitting={isCreating}
                    submitButtonText={t('createTaskPage.button')}
                    submitButtonIconName="save-outline"
                    formatDisplayDate={formatDisplayDate}
                    reminderOffset={reminderOffset}
                    onReminderChange={setReminderOffset}
                    reminderOptions={reminderOptions}
                />
            </ScrollView>

            {/* Date Picker Modal */}
            <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode="datetime"
                onConfirm={handleConfirmDate}
                onCancel={hideDatePicker}
                date={dueDate || new Date()}
                minimumDate={new Date()}
            />
        </KeyboardAvoidingView>
    );
}