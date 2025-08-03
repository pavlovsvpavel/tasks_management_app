import {useCallback, useState} from 'react';
import {ScrollView, KeyboardAvoidingView} from 'react-native';
import {View, Text, TouchableOpacity} from '@/components/Themed';
import {router, useFocusEffect} from 'expo-router';
import {Ionicons} from "@expo/vector-icons";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import {useApiClient} from '@/hooks/useApiClient';
import {PageLoadingSpinner} from "@/components/PageLoadingSpinner";
import {useAlert} from "@/context/AlertContext";
import {useApiErrorHandler} from '@/hooks/useApiErrorHandler';
import TaskForm from "@/components/TaskForm";


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
        if (!date) return 'Select a date and time';

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
                title: 'Missing Fields',
                message: 'Please fill out all fields marked with *',
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

            await response.json();
            showAlert({
                title: 'Task created',
                message: 'Your task created successfully.',
                buttons: [{text: 'OK'}]
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
                className="flex-1 bg-bgnd"
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View className="flex-row justify-between items-center mb-5 px-4">
                    <Text className="text-xl text-primary" weight="bold">Create New Task</Text>
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
                    submitButtonText="Create Task"
                    submitButtonIconName="add-circle-outline"
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