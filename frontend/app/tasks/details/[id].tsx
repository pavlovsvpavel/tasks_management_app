import {router, useLocalSearchParams} from 'expo-router';
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
import {useTaskCache} from '@/contexts/TaskCacheContext';
import {useAlert} from "@/contexts/AlertContext";
import {ButtonSpinner} from "@/components/ButtonSpinner";
import {useTranslation} from "react-i18next";


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
    const {t} = useTranslation();

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

    const [isDeleting, setIsDeleting] = useState(false);

    const deleteTask = async () => {
        setIsDeleting(true);
        try {
            await apiClient(`/tasks/delete/${taskId}`, {
                method: 'DELETE',
            });

            showAlert({
                title: t('deleteTaskPage.successFieldsTitle'),
                message: t('deleteTaskPage.successFieldsMessage'),
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
            title: t('deleteTaskPage.onPressButtonTitle'),
            message: t('deleteTaskPage.onPressButtonMessage'),
            buttons: [
                {text: t('deleteTaskPage.onPressButtonCancel'), style: 'cancel'},
                {
                    text: t('deleteTaskPage.onPressButtonDelete'),
                    style: 'destructive',
                    onPress: deleteTask
                },
            ]
        });
    };

    if (isLoading) {
        return <PageLoadingSpinner/>;
    }

    if (!taskFromCache) {
        return (
            <View className="flex-1 justify-center items-center p-10">
                <Text className="text-lg text-red-600"
                      weight="bold">{t('detailsTaskPage.notFoundTaskHeader')}</Text>
                <Text className="text-center text-primary mt-2" weight="normal">
                    {t('detailsTaskPage.notFoundTaskMessage')}
                </Text>
                <TouchableOpacity onPress={() => router.back()} className="bg-btn_color rounded-lg py-2 px-6 mt-6">
                    <Text className="text-primary" weight="bold">{t('detailsTaskPage.notFoundTaskButton')}</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const priorityColors = {
        low: 'text-green-600',
        medium: 'text-amber-600',
        high: 'text-red-600',
    };

    return (
        <ScrollView
            className="bg-bgnd"
            showsVerticalScrollIndicator={false}
        >
            <View className="flex-row items-center mb-5">
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#3B82F6"/>
                </TouchableOpacity>
                <Text className="text-xl text-primary pl-4" weight="bold">{t('detailsTaskPage.taskDetails')}</Text>
            </View>

            <View className="gap-3 bg-card rounded-xl p-5 mb-5 ">
                <Text className="text-lg text-primary" weight="bold">{taskFromCache.title}</Text>
                <View className="py-4 border-b border-default">
                    <Text className="text-sm text-secondary mt-2" weight="semibold">
                        {t('detailsTaskPage.taskDetailsCreatedOn')}
                    </Text>
                    <Text className="text-base text-primary mt-1">
                        {format(new Date(taskFromCache.created_at), 'd MMM yyyy, HH:mm')}
                    </Text>
                </View>

                <View className="justify-center">
                    <TaskDetailRow
                        label={t('detailsTaskPage.taskDetailRowPriority')}
                        value={t(`priority.${taskFromCache.priority}`)}
                        valueColor={priorityColors[taskFromCache.priority]}
                    />
                    <TaskDetailRow
                        label={t('detailsTaskPage.taskDetailRowDueDate')}
                        value={format(new Date(taskFromCache.due_date), 'd MMM yyyy, HH:mm')}
                    />
                    {taskFromCache.description && (
                        <TaskDetailRow
                            label={t('detailsTaskPage.taskDetailRowDescription')}
                            value={taskFromCache.description}
                        />
                    )}
                    <TaskDetailRow
                        label={t('detailsTaskPage.taskDetailRowStatus')}
                        value={t(taskFromCache.completed ? 'taskStatus.completed' : 'taskStatus.pending')}
                        valueColor={taskFromCache.completed ? 'text-green-600' : 'text-red-600'}
                    />
                    {taskFromCache.completed_at && (
                        <TaskDetailRow
                            label={t('detailsTaskPage.taskDetailRowCompletedOn')}
                            value={format(new Date(taskFromCache.completed_at), 'd MMM yyyy, HH:mm')}
                        />
                    )}
                </View>

                <TouchableOpacity
                    disabled={taskFromCache.completed}
                    className={`rounded-lg py-3 flex-row items-center justify-center mt-8 h-[48px] 
                        ${taskFromCache.completed ? 'bg-bgnd' : 'bg-blue-500'}`}
                    onPress={() => router.push(`/tasks/update/${taskFromCache.id}`)}
                >
                    <Ionicons name="create-outline" size={20} color="#ffffff"/>
                    <Text className="btn-primary-text text-base ml-2" weight="bold">{t('detailsTaskPage.button')}</Text>
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
                            <Text className="btn-primary-text text-base ml-2"
                                  weight="bold">{t('deleteTaskPage.button')}</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}