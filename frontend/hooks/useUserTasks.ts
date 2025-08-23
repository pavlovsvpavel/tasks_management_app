import {useState, useMemo, useCallback, useRef} from 'react';
import {FlatList} from 'react-native';
import {useFocusEffect} from 'expo-router';
import dayjs from 'dayjs';
import {useApiClient} from '@/hooks/useApiClient';
import {useApiErrorHandler} from '@/hooks/useApiErrorHandler';
import {useAlert} from '@/contexts/AlertContext';
import {useTaskCache} from '@/contexts/TaskCacheContext';
import {useRefresh} from '@/contexts/RefreshContext';
import {cancelNotification} from "@/services/NotificationService";
import {TaskResponse, SortField, SortDirection, DateRange} from '@/interfaces/interfaces';
import {DateType} from 'react-native-ui-datepicker';
import {useTranslation} from "react-i18next";

export function useUserTasks() {
    const [tasks, setTasks] = useState<TaskResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [updatingTaskId, setUpdatingTaskId] = useState<number | null>(null);
    const [sortBy, setSortBy] = useState<SortField>('status');
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
    const [isFilterVisible, setIsFilterVisible] = useState(false);
    const [isSortingVisible, setIsSortingVisible] = useState(false);
    const [dateRange, setDateRange] = useState<DateRange>({startDate: null, endDate: null});
    const [calendarKey, setCalendarKey] = useState(0);
    const flatListRef = useRef<FlatList>(null);
    const {t} = useTranslation();
    const {registerRefreshHandler, unregisterRefreshHandler, triggerRefresh, isRefreshing} = useRefresh();
    const {apiClient} = useApiClient();
    const {showAlert} = useAlert();
    const {updateTaskInCache} = useTaskCache();

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

    useFocusEffect(useCallback(() => {
        fetchTasks();
        registerRefreshHandler(fetchTasks);
        return () => unregisterRefreshHandler();
    }, [fetchTasks, registerRefreshHandler, unregisterRefreshHandler]));

    const filteredTasks = useMemo(() => {
        const {startDate, endDate} = dateRange;

        if (!startDate) {
            return tasks;
        }

        return tasks.filter(task => {
            if (!task.due_date) return false;
            const taskDueDate = task.due_date.substring(0, 10);
            if (startDate && !endDate) {
                return taskDueDate === startDate;
            }

            if (startDate && endDate) {
                return taskDueDate >= startDate && taskDueDate <= endDate;
            }

            return false;
        });

    }, [tasks, dateRange]);

    const sortedTasks = useMemo(() => {
        return [...filteredTasks].sort((a, b) => {
            let primaryComparison = 0;

            if (sortBy === 'status') {
                primaryComparison = Number(a.completed) - Number(b.completed);
            } else if (sortBy === 'due_date') {
                primaryComparison = new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
            }
            const finalPrimaryComparison = sortDirection === 'desc' ? primaryComparison * -1 : primaryComparison;

            if (finalPrimaryComparison !== 0) {
                return finalPrimaryComparison;
            }
            return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
        });
    }, [filteredTasks, sortBy, sortDirection]);

    const handleSortChange = (field: SortField) => {
        if (sortBy === field) {
            setSortDirection(prevDirection => (prevDirection === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortBy(field);
            setSortDirection('asc');
        }
    };

    const handleDateRangeChange = useCallback((params: { startDate: DateType, endDate: DateType }) => {
        const {startDate, endDate} = params;
        setDateRange({
            startDate: startDate ? dayjs(startDate).format('YYYY-MM-DD') : null,
            endDate: endDate ? dayjs(endDate).format('YYYY-MM-DD') : null,
        });
        if (startDate && endDate) {
            setCalendarKey(prevKey => prevKey + 1);
        }
    }, []);

    const togglePanel = (panel: 'filter' | 'sort') => {
        const isPanelVisible = panel === 'filter' ? isFilterVisible : isSortingVisible;
        if (!isPanelVisible) {
            flatListRef.current?.scrollToOffset({offset: 0, animated: true});
        }
        if (panel === 'filter') {
            setIsFilterVisible(!isFilterVisible);
        } else {
            setIsSortingVisible(!isSortingVisible);
        }
    };

    const handleTodayPress = () => {
        const today = dayjs().format('YYYY-MM-DD');
        setDateRange({startDate: today, endDate: today});
        setCalendarKey(prevKey => prevKey + 1);
    };

    const clearDateFilter = () => {
        setDateRange({startDate: null, endDate: null});
    };

    return {
        tasks,
        isLoading,
        isRefreshing,
        triggerRefresh,
        updatingTaskId,
        sortedTasks,
        isFilterVisible,
        isSortingVisible,
        dateRange,
        calendarKey,
        sortBy,
        sortDirection,
        flatListRef,
        isFilterActive: dateRange.startDate !== null,
        promptForStatusChange,
        handleSortChange,
        handleDateRangeChange,
        togglePanel,
        handleTodayPress,
        clearDateFilter,
    };
}