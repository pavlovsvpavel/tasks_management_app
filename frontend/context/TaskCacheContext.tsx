import {createContext, useContext, useState, useCallback, ReactNode} from 'react';
import {TaskCacheContextType, TaskResponse} from '@/interfaces/interfaces';

const TaskCacheContext = createContext<TaskCacheContextType | undefined>(undefined);

export const TaskCacheProvider = ({children}: { children: ReactNode }) => {
    const [taskCache, setTaskCache] = useState<Map<number, TaskResponse>>(new Map());

    const getTaskFromCache = useCallback(
        (taskId: number) => {
            return taskCache.get(taskId);
        },
        [taskCache]
    );

    const updateTaskInCache = useCallback((task: TaskResponse) => {
        setTaskCache(prevCache => {
            const newCache = new Map(prevCache);
            newCache.set(task.id, task);
            return newCache;
        });
    }, []);

    const value = {getTaskFromCache, updateTaskInCache};

    return (
        <TaskCacheContext.Provider value={value}>
            {children}
        </TaskCacheContext.Provider>
    );
};

export const useTaskCache = () => {
    const context = useContext(TaskCacheContext);
    if (!context) {
        throw new Error('useTaskCache must be used within a TaskCacheProvider');
    }
    return context;
};