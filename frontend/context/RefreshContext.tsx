import React, {createContext, useCallback, useContext, useState} from 'react';
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

export const RefreshProvider = ({children}: { children: React.ReactNode }) => {
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [currentHandler, setCurrentHandler] = useState<RefreshHandler<any> | null>(null);

    console.log('RefreshProvider render', isRefreshing);

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

export const useRefresh = () => useContext(RefreshContext);