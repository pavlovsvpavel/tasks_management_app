import {useFocusEffect} from 'expo-router';
import {useCallback, useState, useMemo} from 'react';
import {FlatList, RefreshControl, TouchableOpacity} from 'react-native';
import {View, Text} from '@/components/Themed';
import {Ionicons} from '@expo/vector-icons';
import {useApiClient} from '@/hooks/useApiClient';
import {PageLoadingSpinner} from '@/components/PageLoadingSpinner';
import {useApiErrorHandler} from '@/hooks/useApiErrorHandler';
import {useAlert} from '@/contexts/AlertContext';
import {TaskItem} from '@/components/TaskItem';
import {SortControls} from '@/components/SortControls';
import {TaskResponse, SortField, SortDirection, DateFilterValue} from '@/interfaces/interfaces';
import {useTaskCache} from '@/contexts/TaskCacheContext';
import {useTranslation} from 'react-i18next';
import {cancelNotification} from "@/services/NotificationService";
import {DateScroller} from '@/components/DateScroller';
import {useRefresh} from "@/contexts/RefreshContext";


export default function UserTasksScreen() {
    const {registerRefreshHandler, unregisterRefreshHandler, triggerRefresh, isRefreshing} = useRefresh();
    const {apiClient} = useApiClient();
    const {showAlert} = useAlert();
    const {updateTaskInCache} = useTaskCache();
    const [tasks, setTasks] = useState<TaskResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [updatingTaskId, setUpdatingTaskId] = useState<number | null>(null);
    const [sortBy, setSortBy] = useState<SortField>('due_date');
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
    const {t} = useTranslation();
    const [isFilterVisible, setIsFilterVisible] = useState(false);
    const [dateFilter, setDateFilter] = useState<DateFilterValue>(null);


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
        const actionKey = task.completed
            ? 'userTasks.userTaskStatusChangeActionTextPending'
            : 'userTasks.userTaskStatusChangeActionTextComplete';

        const actionText = t(actionKey);

        showAlert({
            title: t('userTasks.userTaskStatusChangeTitle', {action: actionText}),
            message: t('userTasks.userTaskStatusChangeMessage', {action: actionText}),
            buttons: [
                {text: t('userTasks.userTaskStatusChangeButtonNo'), style: 'cancel'},
                {
                    text: t('userTasks.userTaskStatusChangeButtonYes'),
                    onPress: () => handleToggleComplete(task, !task.completed)
                },
            ],
        });
    };

    const handleToggleComplete = async (task: TaskResponse, completed: boolean) => {
        if (completed && task.notification_id) {
            try {
                console.log(`Task ${task.id} marked as complete. Cancelling notification ID: ${task.notification_id}`);
                await cancelNotification(task.notification_id);
            } catch (error) {
                console.error("Failed to cancel notification, but proceeding with task update:", error);
            }
        }
        setUpdatingTaskId(task.id);
        try {
            const response = await apiClient(`/tasks/update/${task.id}`, {
                method: 'PATCH',
                body: JSON.stringify({
                    completed: completed,
                    notification_id: null
                }),
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

    const filteredTasks = useMemo(() => {
        if (!dateFilter) {
            return tasks;
        }

        return tasks.filter(task => {
            if (!task.due_date) return false;
            return task.due_date.startsWith(dateFilter);
        });

    }, [tasks, dateFilter]);

    const sortedTasks = useMemo(() => {
        return [...filteredTasks].sort((a, b) => {
            let comparison = 0;
            if (sortBy === 'due_date') {
                comparison = new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
            } else if (sortBy === 'status') {
                comparison = Number(a.completed) - Number(b.completed);
            }
            return sortDirection === 'desc' ? comparison * -1 : comparison;
        });
    }, [filteredTasks, sortBy, sortDirection]);

    useFocusEffect(
        useCallback(() => {
            registerRefreshHandler(fetchTasks);
            return () => unregisterRefreshHandler();
        }, [registerRefreshHandler, unregisterRefreshHandler, fetchTasks])
    );



    if (isLoading) {
        return <PageLoadingSpinner/>;
    }

    return (
        <View className="flex-1 bg-bgnd">
            <FlatList
                refreshControl={
                <RefreshControl
                    refreshing={isRefreshing}
                    onRefresh={triggerRefresh}
                    tintColor="#3B82F6"
                    colors={['#3B82F6']}
                />
            }
                data={sortedTasks}
                showsVerticalScrollIndicator={false}
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
                    <View>
                        <View className="flex-row justify-between items-center mb-4">
                            <Text className="text-xl text-primary" weight="bold">
                                {t('yourTasks')}
                            </Text>
                            <TouchableOpacity onPress={() => setIsFilterVisible(!isFilterVisible)}>
                                <Ionicons
                                    name={isFilterVisible ? "close-circle" : "options-outline"}
                                    size={26}
                                    color={isFilterVisible ? '#EF4444' : '#3B82F6'}
                                />
                            </TouchableOpacity>
                        </View>

                        {isFilterVisible && (
                            <View className="bg-card p-4 rounded-xl mb-4">
                                <DateScroller
                                    selectedDate={dateFilter}
                                    onSelectDate={setDateFilter}
                                />
                            </View>
                        )}

                        {sortedTasks.length > 0 && (
                            <SortControls
                                sortBy={sortBy}
                                sortDirection={sortDirection}
                                onSortChange={handleSortChange}
                            />
                        )}
                    </View>
                }
                ListEmptyComponent={
                    <View className="flex-1 justify-center items-center mt-20">
                        <Ionicons name="file-tray-outline" size={64} color="#676767"/>
                        <Text className="text-lg text-primary mt-4" weight="bold">{t('noTasks')}</Text>
                        <Text className="text-secondary" weight="normal">{t('noTasksDescription')}</Text>
                    </View>
                }
            />
        </View>
    );
}