import {router, useLocalSearchParams} from 'expo-router';
import {useEffect, useState} from 'react';
import {ScrollView, KeyboardAvoidingView,} from 'react-native';
import {View, Text, TouchableOpacity} from '@/components/Themed';
import {Ionicons} from '@expo/vector-icons';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {useApiClient} from '@/hooks/useApiClient';
import {PageLoadingSpinner} from '@/components/PageLoadingSpinner';
import {useApiErrorHandler} from '@/hooks/useApiErrorHandler';
import {TaskResponse} from '@/interfaces/interfaces';
import {useAlert} from '@/context/AlertContext';;
import {useTaskCache} from '@/context/TaskCacheContext';
import TaskForm from "@/components/TaskForm";


export default function UpdateTaskScreen() {
    const {id} = useLocalSearchParams();
    const {apiClient} = useApiClient();
    const {showAlert} = useAlert();
    const handleApiError = useApiErrorHandler({
        validationTitles: {
            'fetch-task': 'Failed to load task',
            'update-task': 'Update Failed',
        },
    });
    const {updateTaskInCache} = useTaskCache();
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState<Date | null>(null);
    const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);


    useEffect(() => {
        if (!id) return;

        const fetchTask = async () => {
            setIsLoading(true);
            try {
                const response = await apiClient(`/tasks/get/${id}`);
                const task: TaskResponse = await response.json();

                setTitle(task.title);
                setDescription(task.description || '');
                setDueDate(new Date(task.due_date));
                setPriority(task.priority);
            } catch (error) {
                handleApiError(error, 'fetch-task');
                router.back();
            } finally {
                setIsLoading(false);
            }
        };

        fetchTask();
    }, [id, apiClient]);


    const handleUpdateTask = async () => {
        if (!title || !dueDate) {
            showAlert(
                {
                    title: 'Missing Fields',
                    message: 'Please fill out all fields marked with *',
                    buttons: [{text: 'OK'}]
                });
            return;
        }

        setIsUpdating(true);
        try {
            const response = await apiClient(`/tasks/update/${id}`, {
                method: 'PATCH',
                body: JSON.stringify({
                    title: title,
                    description,
                    priority,
                    due_date: dueDate.toISOString(),
                }),
            });
            const updatedTask: TaskResponse = await response.json();

            updateTaskInCache(updatedTask);

            showAlert({
                title: 'Task Updated',
                message: 'Your task has been updated successfully.',
                buttons: [{text: 'OK', onPress: () => router.back()}],
            });
        } catch (error) {
            handleApiError(error, 'update-task');
        } finally {
            setIsUpdating(false);
        }
    };

    const showDatePicker = () => setDatePickerVisibility(true);
    const hideDatePicker = () => setDatePickerVisibility(false);
    const handleConfirmDate = (date: Date) => {
        setDueDate(date);
        hideDatePicker();
    };
    const formatDisplayDate = (date: Date | null) => {
        if (!date) return 'Select a date and time';
        return new Intl.DateTimeFormat('en-GB', {dateStyle: 'long', timeStyle: 'short'}).format(date);
    };

    if (isLoading) {
        return <PageLoadingSpinner/>;
    }


    return (
        <KeyboardAvoidingView
            className="flex-1"
            behavior="height"
        >
            <ScrollView
                className="flex-1 bg-bgnd"
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View className="flex-row items-center mb-5">
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color='#3B82F6'/>
                    </TouchableOpacity>
                    <Text className="text-xl text-primary pl-4" weight="bold">Update Task</Text>
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
                    onSubmit={handleUpdateTask}
                    isSubmitting={isUpdating}
                    submitButtonText="Save Changes"
                    submitButtonIconName="save-outline"
                    formatDisplayDate={formatDisplayDate}
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