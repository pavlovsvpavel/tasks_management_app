import React, {
    createContext,
    useContext,
    type PropsWithChildren,
    useState,
    useEffect,
    useCallback,
    useMemo,
} from 'react';
import {AuthContextType, TokenPair} from '@/interfaces/interfaces';
import {getTokens, saveTokensToStorage, deleteTokensFromStorage} from '@/utils/tokenStorage';
import {validateAndRefreshTokens, TokenValidationError} from '@/services/TokenAuth';
import {useRetry} from "@/contexts/RetryContext";
import {useServerStatus} from "@/contexts/ServerStatusContext";
import {useAlert} from './AlertContext';
import {cancelAllNotifications} from "@/services/NotificationService";

const AuthContext = createContext<AuthContextType>({
    isAuthenticated: false,
    setTokens: () => Promise.resolve(),
    clearTokens: () => Promise.resolve(),
    logout: () => Promise.resolve(),
    accessToken: null,
    refreshToken: null,
    isLoading: true,
    validateSession: () => Promise.resolve({isValid: false, accessToken: null}),
    sessionError: null,
    clearSessionError: () => {
    },
});

export const AuthProvider = ({children}: PropsWithChildren) => {
    const [isLoading, setIsLoading] = useState(true);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [refreshToken, setRefreshToken] = useState<string | null>(null);
    const [sessionError, setSessionError] = useState<string | null>(null);
    const {registerRetryHandler, unregisterRetryHandler} = useRetry();
    const {isServerDown, isInitialCheckComplete} = useServerStatus();
    const {showAlert} = useAlert();


    const clearSessionError = useCallback(() => setSessionError(null), []);

    const setTokens = useCallback(async (tokens: TokenPair) => {
        try {
            await saveTokensToStorage(tokens.accessToken, tokens.refreshToken);
            setAccessToken(tokens.accessToken);
            setRefreshToken(tokens.refreshToken);
            setSessionError(null);
        } catch (error) {
            console.error('[AuthContext] Failed to persist tokens:', error);
            throw error;
        }
    }, []);

    const clearTokens = useCallback(async (isSessionExpired: boolean = false) => {
        try {
            await deleteTokensFromStorage();
            setAccessToken(null);
            setRefreshToken(null);
            if (isSessionExpired) {
                setSessionError('SESSION_EXPIRED');
            }
        } catch (error) {
            console.error('[AuthContext] Failed to delete tokens:', error);
            throw error;
        }
    }, []);

    const logout = useCallback(async () => {
        console.log('[AuthContext] User logout initiated.');
        await clearTokens(false);
        await cancelAllNotifications();
    }, [clearTokens]);

    useEffect(() => {
        if (sessionError) {
            if (sessionError === 'SESSION_EXPIRED') {
                showAlert({
                    title: "Session Expired",
                    message: "Your session has ended. Please log in again to continue.",
                    buttons: [{text: "OK"}]
                });
            }
            clearSessionError();
        }
    }, [sessionError, showAlert, clearSessionError]);


    useEffect(() => {
        const initialize = async () => {
            console.log('[AuthContext] Starting initialization...');
            setIsLoading(true);

            if (!isInitialCheckComplete) {
                console.log('[AuthContext] Paused. Waiting for initial server health check.');
                return;
            }

            if (isServerDown) {
                console.warn('[AuthContext] Initialization halted: Server is down.');
                setSessionError('SERVER_UNAVAILABLE');
                setIsLoading(false);
                return;
            }

            console.log('[AuthContext] Server is up. Proceeding with full validation.');

            try {
                const tokens = await getTokens();
                if (tokens.accessToken && tokens.refreshToken) {
                    try {
                        const validationResult = await validateAndRefreshTokens(tokens);
                        if (validationResult.isRefreshed) {
                            await setTokens(validationResult);
                        } else {
                            setAccessToken(tokens.accessToken);
                            setRefreshToken(tokens.refreshToken);
                        }
                    } catch (error) {
                        if (error instanceof TokenValidationError) {
                            console.error('[AuthContext] Stored tokens are invalid. Clearing them.', error);
                            await clearTokens(true);
                        } else {
                            console.warn('[AuthContext] Validation failed (network error). Retaining tokens.', error);
                            setAccessToken(tokens.accessToken);
                            setRefreshToken(tokens.refreshToken);
                        }
                    }
                } else {
                    console.log('[AuthContext] No tokens found in storage.');
                    setAccessToken(null);
                    setRefreshToken(null);
                }
            } catch (error) {
                console.error('[AuthContext] Critical failure during initialization:', error);
            } finally {
                setIsLoading(false);
                console.log('[AuthContext] Initialization finished.');
            }
        };

        registerRetryHandler('auth', initialize);
        (async () => {
            try {
                await initialize();
            } catch (error) {
                console.error('[AuthContext] An unexpected top-level error occurred during initialization:', error);
            }
        })();

        return () => unregisterRetryHandler('auth');
    }, [isServerDown, isInitialCheckComplete, setTokens, clearTokens]);

    const validateSession = useCallback(async (): Promise<{ isValid: boolean; accessToken: string | null }> => {
        if (!accessToken || !refreshToken) {
            return {isValid: false, accessToken: null};
        }
        try {
            const tokens = await validateAndRefreshTokens({accessToken, refreshToken});
            if (tokens.isRefreshed) {
                await setTokens(tokens);
            }
            return {isValid: true, accessToken: tokens.accessToken};
        } catch (error) {
            console.error('[AuthContext] On-demand session validation failed:', error);
            if (error instanceof TokenValidationError) {
                await clearTokens(true);
            }
            return {isValid: false, accessToken: null};
        }
    }, [accessToken, refreshToken, setTokens, clearTokens]);

    const isAuthenticated = useMemo(() => !!accessToken && !!refreshToken, [accessToken, refreshToken]);

    const contextValue = useMemo(() => ({
        isAuthenticated,
        setTokens,
        clearTokens,
        logout,
        accessToken,
        refreshToken,
        isLoading,
        validateSession,
        sessionError,
        clearSessionError,
    }), [isAuthenticated, setTokens, clearTokens, logout, accessToken, refreshToken, isLoading, validateSession, sessionError, clearSessionError]);

    return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within a AuthProvider');
    }
    return context;
}