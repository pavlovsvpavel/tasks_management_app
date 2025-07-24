import {createContext, useCallback, useContext, useRef, ReactNode} from 'react';
import {RetryContextType} from "@/interfaces/interfaces";


const RetryContext = createContext<RetryContextType | null>(null);

export const RetryProvider = ({children}: { children: ReactNode }) => {
    const handlers = useRef(new Map<string, () => Promise<void>>());

    const registerRetryHandler = useCallback((key: string, handler: () => Promise<void>) => {
        handlers.current.set(key, handler);
        console.log(`[RetryContext] Registered handler for: ${key}`);
    }, []);

    const unregisterRetryHandler = useCallback((key: string) => {
        handlers.current.delete(key);
        console.log(`[RetryContext] Unregistered handler for: ${key}`);
    }, []);

    const triggerRetry = useCallback(() => {
        console.log('[RetryContext] Triggering all retry handlers...');
        handlers.current.forEach(handler => handler());
    }, []);

    return (
        <RetryContext.Provider value={{registerRetryHandler, unregisterRetryHandler, triggerRetry}}>
            {children}
        </RetryContext.Provider>
    );
};

export const useRetry = () => {
    const context = useContext(RetryContext);
    if (!context) {
        throw new Error('useRetry must be used within a RetryProvider');
    }
    return context;
};