import {useFocusEffect} from 'expo-router';
import {useCallback, useState, useMemo} from 'react';
import {FlatList} from 'react-native';
import {View, Text} from '@/components/Themed';
import {Ionicons} from '@expo/vector-icons';
import {useApiClient} from '@/hooks/useApiClient';
import {PageLoadingSpinner} from '@/components/PageLoadingSpinner';
import {useApiErrorHandler} from '@/hooks/useApiErrorHandler';
import {useAlert} from '@/context/AlertContext';
import {TaskItem} from '@/components/TaskItem';
import {SortControls} from '@/components/SortControls';
import {TaskResponse, SortField, SortDirection} from '@/interfaces/interfaces';
import { useTaskCache } from '@/context/TaskCacheContext';


export default function UserTasksScreen() {
    const {apiClient} = useApiClient();
    const {showAlert} = useAlert();
    const {updateTaskInCache} = useTaskCache();
    const [tasks, setTasks] = useState<TaskResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [updatingTaskId, setUpdatingTaskId] = useState<number | null>(null);
    const [sortBy, setSortBy] = useState<SortField>('due_date');
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

    const errorHandlerOptions = useMemo(() => ({
        validationTitles: {
            'fetch-tasks': 'Failed to load tasks',
            'update-task': 'Update failed'
        }
    }), []);
    const handleApiError = useApiErrorHandler(errorHandlerOptions);


    const fetchTasks = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await apiClient('/tasks/get/all-tasks');
            const fetchedTasks: TaskResponse[] = await response.json();
            setTasks(fetchedTasks);
        } catch (error) {
            handleApiError(error, 'fetch-tasks');
        } finally {
            setIsLoading(false);
        }
    }, [apiClient, handleApiError]);


    useFocusEffect(
        useCallback(() => {
            fetchTasks();
        }, [fetchTasks])
    );

    const promptForStatusChange = (task: TaskResponse) => {
        const newStatus = !task.completed;
        const actionText = newStatus ? 'complete' : 'pending';
        showAlert({
            title: `Mark as ${actionText}?`,
            message: `Are you sure you want to mark this task as ${actionText}?`,
            buttons: [
                {text: 'No', style: 'cancel'},
                {text: 'Yes', onPress: () => handleToggleComplete(task, newStatus)},
            ],
        });
    };

    const handleToggleComplete = async (task: TaskResponse, completed: boolean) => {
        setUpdatingTaskId(task.id);
        try {
            const response = await apiClient(`/tasks/update/${task.id}`, {
                method: 'PATCH',
                body: JSON.stringify({completed}),
            });
            const updatedTask: TaskResponse = await response.json();
            updateTaskInCache(updatedTask);
            setTasks(prevTasks =>
                prevTasks.map(t => (t.id === task.id ? updatedTask : t))
            );
        } catch (error) {
            handleApiError(error, 'update-task');
        } finally {
            setUpdatingTaskId(null);
        }
    };

    const handleSortChange = (field: SortField) => {
        if (sortBy === field) {
            setSortDirection(prevDirection => (prevDirection === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortBy(field);
            setSortDirection('asc');
        }
    };

    const sortedTasks = useMemo(() => {
        return [...tasks].sort((a, b) => {
            let comparison = 0;
            if (sortBy === 'due_date') {
                comparison = new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
            } else if (sortBy === 'title') {
                comparison = a.title.localeCompare(b.title);
            }
            return sortDirection === 'desc' ? comparison * -1 : comparison;
        });
    }, [tasks, sortBy, sortDirection]);


    if (isLoading) {
        return <PageLoadingSpinner/>;
    }

    return (
        <View className="flex-1">
            <FlatList
                data={sortedTasks}
                keyExtractor={item => item.id.toString()}
                renderItem={({item}) => (
                    <TaskItem
                        task={item}
                        onPrompt={() => promptForStatusChange(item)}
                        isUpdating={updatingTaskId === item.id}
                    />
                )}
                contentContainerStyle={{paddingHorizontal: 0, paddingBottom: 0}}
                ListHeaderComponent={
                    <>
                        <Text className="text-2xl text-primary mb-5 px-4" weight="bold">
                            Tasks
                        </Text>
                        {tasks.length > 0 && (
                            <View className="px-4">
                                <SortControls
                                    sortBy={sortBy}
                                    sortDirection={sortDirection}
                                    onSortChange={handleSortChange}
                                />
                            </View>
                        )}
                    </>
                }
                ListEmptyComponent={
                    <View className="flex-1 justify-center items-center mt-20">
                        <Ionicons name="file-tray-outline" size={64} color="#676767"/>
                        <Text className="text-lg text-primary mt-4" weight="bold">No tasks yet.</Text>
                        <Text className="text-dark-100" weight="normal">Use the "Create Task" tab to add one!</Text>
                    </View>
                }
            />
        </View>
    );
}