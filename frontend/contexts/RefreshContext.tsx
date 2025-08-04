import {createContext, ReactNode, useCallback, useContext, useState} from 'react';
import {RefreshContextType, RefreshHandler} from "@/interfaces/interfaces";


const RefreshContext = createContext<RefreshContextType>({
    registerRefreshHandler: () => {
    },
    unregisterRefreshHandler: () => {
    },
    triggerRefresh: async () => {
    },
    isRefreshing: false,
});

export const RefreshProvider = ({children}: { children: ReactNode }) => {
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [currentHandler, setCurrentHandler] = useState<RefreshHandler<any> | null>(null);
    console.log('[Refresh Context] RefreshProvider render', isRefreshing);

    const registerRefreshHandler = useCallback(<T, >(handler: RefreshHandler<T>) => {
        setCurrentHandler(() => handler);
    }, []);

    const unregisterRefreshHandler = useCallback(() => {
        setCurrentHandler(null);
    }, []);

    const triggerRefresh = useCallback(async () => {
        if (!currentHandler) return;
        setIsRefreshing(true)
        try {
            await currentHandler();
        } finally {
            setIsRefreshing(false)
        }

    }, [currentHandler]);

    return (
        <RefreshContext.Provider value={{
            registerRefreshHandler,
            unregisterRefreshHandler,
            triggerRefresh,
            isRefreshing
        }}>
            {children}
        </RefreshContext.Provider>
    );
};

export const useRefresh = () => {
    const context = useContext(RefreshContext);
    if (!context) {
        throw new Error('useRefresh must be used within a RefreshProvider');
    }
    return context;
};