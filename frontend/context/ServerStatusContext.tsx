import {createContext, ReactNode, useCallback, useContext, useEffect, useState} from 'react';
import {ServerStatusContextType} from '@/interfaces/interfaces';

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const APP_KEY = process.env.EXPO_PUBLIC_APP_KEY;

const ServerStatusContext = createContext<ServerStatusContextType>({
    isServerDown: false,
    checkHealth: async () => true,
    isInitialCheckComplete: false,
    setServerStatus: (isDown: boolean) => false
});

export const ServerStatusProvider = ({children}: { children: ReactNode }) => {
    const [isServerDown, setIsServerDown] = useState(false);
    const [isInitialCheckComplete, setIsInitialCheckComplete] = useState(false);

    const setServerStatus = (isDown: boolean) => {
        setIsServerDown(isDown);
    };

    const checkHealth = useCallback(async (): Promise<boolean> => {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            const response = await fetch(`${API_URL}/health`, {
                method: 'GET',
                signal: controller.signal,
                headers: {'Content-Type': 'application/json', 'X-App-Key': `${APP_KEY}`},
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
        let isMounted = true;

        const runInitialCheck = async () => {
            await checkHealth();
            if (isMounted) {
                setIsInitialCheckComplete(true);
            }
        };

        void runInitialCheck();
        const interval = setInterval(checkHealth, 120000);
        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, [checkHealth, setIsInitialCheckComplete]);

    return (
        <ServerStatusContext.Provider value={{
            isServerDown,
            checkHealth,
            isInitialCheckComplete,
            setServerStatus,
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