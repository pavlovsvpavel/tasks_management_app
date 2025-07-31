import {router, useLocalSearchParams} from 'expo-router';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useCallback, useEffect, useMemo, useState} from 'react';
import {ScrollView} from 'react-native';
import {View, Text, TouchableOpacity} from '@/components/Themed';
import {AntDesign, Ionicons} from '@expo/vector-icons';
import {useApiClient} from '@/hooks/useApiClient';
import {PageLoadingSpinner} from '@/components/PageLoadingSpinner';
import {useApiErrorHandler} from '@/hooks/useApiErrorHandler';
import {TaskResponse} from '@/interfaces/interfaces';
import {format} from 'date-fns';
import {TaskDetailRow} from "@/components/TaskDetailRow";
import {useTaskCache} from '@/context/TaskCacheContext';
import {useAlert} from "@/context/AlertContext";
import {ButtonSpinner} from "@/components/ButtonSpinner";


export default function TaskDetailScreen() {
    const {id} = useLocalSearchParams();
    const taskId = Number(id);
    const {apiClient} = useApiClient();
    const errorHandlerOptions = useMemo(() => ({
        validationTitles: {
            'fetch-task-detail': 'Failed to load task details'
        }
    }), []);
    const handleApiError = useApiErrorHandler(errorHandlerOptions);
    const {getTaskFromCache, updateTaskInCache} = useTaskCache();
    const taskFromCache = getTaskFromCache(taskId);
    const [isLoading, setIsLoading] = useState(!taskFromCache);
    const {showAlert} = useAlert();

    const fetchTask = useCallback(async () => {
        if (!taskId) return;
        setIsLoading(true);
        try {
            const response = await apiClient(`/tasks/get/${taskId}`);
            const data: TaskResponse = await response.json();
            updateTaskInCache(data);
        } catch (error) {
            handleApiError(error, 'fetch-task-detail');
        } finally {
            setIsLoading(false);
        }
    }, [taskId, apiClient, handleApiError, updateTaskInCache]);

    useEffect(() => {
        if (!taskFromCache) {
            fetchTask();
        }
    }, [taskFromCache, fetchTask]);

    const [isDeleting, setIsDeleting] = useState(false); // Add deleting state

    // ... your fetchTask and useEffect logic ...

    // --- 1. Create the function that actually performs the deletion ---
    const deleteTask = async () => {
        setIsDeleting(true);
        try {
            await apiClient(`/tasks/delete/${taskId}`, {
                method: 'DELETE',
            });

            // On success, show a confirmation and navigate away
            showAlert({
                title: 'Task Deleted',
                message: 'The task has been successfully deleted.',
                buttons: [{text: 'OK', onPress: () => router.navigate('/(tabs)/userTasks')}]
            });

        } catch (error) {
            handleApiError(error, 'delete-task');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleDeletePress = () => {
        showAlert({
            title: 'Delete Task?',
            message: 'Are you sure you want to permanently delete this task? This action cannot be undone.',
            buttons: [
                {text: 'Cancel', style: 'cancel'},
                {
                    text: 'Delete',
                    style: 'destructive', // This makes the button red on iOS
                    onPress: deleteTask // Call the delete function on confirm
                },
            ]
        });
    };

    if (isLoading) {
        return <PageLoadingSpinner/>;
    }

    if (!taskFromCache) {
        return (
            <SafeAreaView className="flex-1">
                <View className="flex-1 justify-center items-center p-10">
                    <Text className="text-lg text-red-600" weight="bold">Task Not Found</Text>
                    <Text className="text-center text-primary mt-2" weight="normal">
                        The task you are looking for might have been deleted or does not exist.
                    </Text>
                    <TouchableOpacity onPress={() => router.back()} className="bg-btn_color rounded-lg py-2 px-6 mt-6">
                        <Text className="text-white" weight="bold">Go Back</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const priorityColors = {
        low: 'text-green-600',
        medium: 'text-amber-600',
        high: 'text-red-600',
    };

    return (
        <SafeAreaView
            edges={['top', 'left', 'right', 'bottom']}
            className="flex-1 px-5">
            <ScrollView
                className="flex-1 py-5"
                showsVerticalScrollIndicator={false}
            >
                <View className="flex-row items-center mb-5">
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color="#333"/>
                    </TouchableOpacity>
                    <Text className="text-xl pl-4" weight="bold">Task Details</Text>
                </View>

                <View className="flex-1 gap-3 bg-white rounded-xl p-5 mb-5 ">
                    <Text className="text-lg text-primary" weight="bold">{taskFromCache.title}</Text>
                    <Text className="text-sm text-gray-400 mt-2">
                        Created on {format(new Date(taskFromCache.created_at), 'd MMM yyyy, HH:mm')}
                    </Text>

                    <View className="flex-1 justify-center">
                        <TaskDetailRow
                            label="Priority"
                            value={taskFromCache.priority.charAt(0).toUpperCase() + taskFromCache.priority.slice(1)}
                            valueColor={priorityColors[taskFromCache.priority]}
                        />
                        <TaskDetailRow
                            label="Due Date"
                            value={format(new Date(taskFromCache.due_date), 'd MMM yyyy, HH:mm')}
                        />
                        {taskFromCache.description && (
                            <TaskDetailRow
                                label="Description"
                                value={taskFromCache.description}
                            />
                        )}
                        <TaskDetailRow
                            label="Status"
                            value={taskFromCache.completed ? 'Completed' : 'Pending'}
                            valueColor={taskFromCache.completed ? 'text-green-600' : 'text-red-600'}
                        />
                        {taskFromCache.completed_at && (
                            <TaskDetailRow
                                label="Completed On"
                                value={format(new Date(taskFromCache.completed_at), 'd MMM yyyy, HH:mm')}
                            />
                        )}
                    </View>

                    <TouchableOpacity
                        className="bg-blue-500 rounded-lg py-3 flex-row items-center justify-center mt-8 h-[48px]"
                        onPress={() => router.push(`/tasks/update/${taskFromCache.id}`)}
                    >
                        <Ionicons name="create-outline" size={20} color="#ffffff"/>
                        <Text className="text-white text-base ml-2" weight="bold">Update Task</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        className="bg-red-600 rounded-lg py-3 flex-row items-center justify-center mt-8 h-[48px]"
                        onPress={handleDeletePress}
                        disabled={isDeleting}
                    >
                        {isDeleting ? (
                            <ButtonSpinner/>
                        ) : (
                            <>
                                <AntDesign name="delete" size={20} color="#ffffff"/>
                                <Text className="text-white text-base ml-2" weight="bold">Delete Task</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}