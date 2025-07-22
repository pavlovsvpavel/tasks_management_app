import {createContext, ReactNode, useCallback, useContext, useEffect, useState} from 'react';
import {ServerStatusContextType} from '@/interfaces/interfaces';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const ServerStatusContext = createContext<ServerStatusContextType>({
    isServerDown: false,
    checkHealth: async () => true,
});

export const ServerStatusProvider = ({children}: { children: ReactNode }) => {
    const [isServerDown, setIsServerDown] = useState(false);

    const checkHealth = useCallback(async (): Promise<boolean> => {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            const response = await fetch(`${API_URL}/health`, {
                method: 'HEAD',
                signal: controller.signal,
            });

            clearTimeout(timeoutId);
            const isServerOk = response.ok;
            setIsServerDown(!isServerOk);
            return isServerOk;
        } catch (error) {
            console.warn('Server health check failed:', error);
            setIsServerDown(true);
            return false;
        }
    }, []);

    useEffect(() => {
        checkHealth();
        const interval = setInterval(checkHealth, 120000);
        return () => clearInterval(interval);
    }, [checkHealth]);

    return (
        <ServerStatusContext.Provider value={{
            isServerDown,
            checkHealth,
        }}>
            {children}
        </ServerStatusContext.Provider>
    );
};

export const useServerStatus = () => {
    const context = useContext(ServerStatusContext);
    if (!context) {
        throw new Error('useContext must be used within a ServerStatusProvider');
    }
    return context;
}