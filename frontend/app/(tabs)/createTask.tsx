import {useCallback, useState} from 'react';
import {ScrollView, KeyboardAvoidingView} from 'react-native';
import {View, Text, TouchableOpacity, TextInput} from '@/components/Themed';
import {router, useFocusEffect} from 'expo-router';
import {Ionicons} from "@expo/vector-icons";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import {useApiClient} from '@/hooks/useApiClient';
import {PageLoadingSpinner} from "@/components/PageLoadingSpinner";
import {ButtonSpinner} from "@/components/ButtonSpinner";
import {useAlert} from "@/context/AlertContext";
import {useApiErrorHandler} from '@/hooks/useApiErrorHandler';
import {PrioritySelector} from '@/components/PrioritySelector';


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

    const textInputClass = "bg-gray-50 border border-gray-300 rounded-lg p-3 text-base text-gray-800 w-full focus:border-blue-500 focus:ring-blue-500"

    if (isScreenLoading) {
        return <PageLoadingSpinner/>;
    }

    return (
            <KeyboardAvoidingView
                className="flex-1"
                behavior="height"
            >
                <ScrollView
                    className="flex-1"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header */}
                    <View className="flex-row justify-between items-center mb-5 px-4">
                        <Text className="text-2xl text-primary" weight="bold">Create New Task</Text>
                        <TouchableOpacity onPress={() => router.back()}>
                            <Ionicons name="close-outline" size={24} color="#EF4444"/>
                        </TouchableOpacity>
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
                            className="bg-btn_color rounded-lg flex-row items-center justify-center mt-4 h-[48px]"
                            onPress={handleCreateTask}
                            disabled={isCreating}
                        >
                            {isCreating ? (
                                <ButtonSpinner/>

                            ) : (
                                <>
                                    <Ionicons name="add-circle-outline" size={20} color="#ffffff"/>
                                    <Text className="text-white text-base ml-2" weight="bold">Create Task</Text>
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
    );
}