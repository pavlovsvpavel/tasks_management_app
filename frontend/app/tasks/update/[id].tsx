import {SafeAreaView} from 'react-native-safe-area-context';
import {router, useLocalSearchParams} from 'expo-router';
import {useEffect, useState} from 'react';
import {ScrollView, KeyboardAvoidingView} from 'react-native';
import {View, Text, TouchableOpacity, TextInput} from '@/components/Themed';
import {Ionicons} from '@expo/vector-icons';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {useApiClient} from '@/hooks/useApiClient';
import {PageLoadingSpinner} from '@/components/PageLoadingSpinner';
import {useApiErrorHandler} from '@/hooks/useApiErrorHandler';
import {TaskResponse} from '@/interfaces/interfaces';
import {useAlert} from '@/context/AlertContext';
import {PrioritySelector} from "@/components/PrioritySelector";
import {ButtonSpinner} from "@/components/ButtonSpinner";
import {useTaskCache} from '@/context/TaskCacheContext';


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

    const textInputClass = "bg-gray-50 border border-gray-300 rounded-lg p-3 text-base text-gray-800 w-full focus:border-blue-500 focus:ring-blue-500"

    return (
        <SafeAreaView
            edges={['top', 'left', 'right']}
            className="flex-1 px-5"
        >
            <KeyboardAvoidingView
                className="flex-1"
                behavior="height"
            >
                <ScrollView
                    className="flex-1 py-5"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header */}
                    <View className="flex-row items-center mb-5">
                        <TouchableOpacity onPress={() => router.back()}>
                            <Ionicons name="arrow-back" size={24} color="#333"/>
                        </TouchableOpacity>
                        <Text className="text-xl pl-4" weight="bold">Update Task</Text>
                    </View>
                    {/* Form Fields */}
                    <View className="flex-1 gap-3 bg-white rounded-xl p-5">
                        {/* Title Input */}
                        <View>
                            <Text className="text-base font-semibold text-gray-700 mb-2" weight="semibold">Title
                                *</Text>
                            <TextInput
                                className={textInputClass}
                                value={title}
                                onChangeText={setTitle}
                                placeholder="Enter task title"
                                placeholderTextColor="#9CA3AF"
                            />
                        </View>
                        {/* Description Input */}
                        <View>
                            <Text className="text-base font-semibold text-gray-700 mb-2"
                                  weight="semibold">Description</Text>
                            <TextInput
                                className={`${textInputClass} h-28`}
                                value={description}
                                onChangeText={setDescription}
                                placeholder="Add more details about the task..."
                                placeholderTextColor="#9CA3AF"
                                multiline
                                textAlignVertical="top"
                            />
                        </View>
                        {/* Due Date Picker */}
                        <View>
                            <Text className="text-base font-semibold text-gray-700 mb-2" weight="semibold">Due Date
                                *</Text>
                            <TouchableOpacity
                                onPress={showDatePicker}
                                className={`${textInputClass} flex-row items-center justify-between`}
                            >
                                <Text className={`text-base ${dueDate ? 'text-gray-800' : 'text-gray-400'}`}>
                                    {formatDisplayDate(dueDate)}
                                </Text>
                                <Ionicons name="calendar-outline" size={20} color="#6B7280"/>
                            </TouchableOpacity>
                        </View>
                        {/* Priority Buttons */}
                        <PrioritySelector
                            currentPriority={priority}
                            onPriorityChange={setPriority}
                        />

                        <TouchableOpacity
                            className="bg-btn_color rounded-lg py-3 flex-row items-center justify-center mt-8 h-[48px]"
                            onPress={handleUpdateTask}
                            disabled={isUpdating}
                        >
                            {isUpdating ? (
                                <ButtonSpinner/>
                            ) : (
                                <>
                                    <Ionicons name="save-outline" size={20} color="#ffffff"/>
                                    <Text className="text-white text-base ml-2" weight="bold">Save Changes</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
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
        </SafeAreaView>
    );
}