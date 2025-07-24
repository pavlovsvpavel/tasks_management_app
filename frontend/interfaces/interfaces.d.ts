import {Ionicons} from "@expo/vector-icons";
import {AlertButton} from "@/components/CustomAlert";

interface ServerStatusContextType {
    isServerDown: boolean;
    checkHealth: () => Promise<boolean>;
    isInitialCheckComplete: boolean;
    setServerStatus: (isDown: boolean) => void;
}

interface RetryContextType {
    registerRetryHandler: (key: string, handler: () => Promise<void>) => void;
    unregisterRetryHandler: (key: string) => void;
    triggerRetry: () => void;
}

interface RefreshHandler<T = void> {
    (): Promise<T>;
}

interface RefreshContextType {
    registerRefreshHandler: <T>(handler: RefreshHandler<T>) => void;
    unregisterRefreshHandler: () => void;
    triggerRefresh: () => Promise<void>;
    isRefreshing: boolean;
}

interface AuthContextType {
    isAuthenticated: boolean;
    setTokens: (tokens: TokenPair) => Promise<void>;
    clearTokens: (isSessionExpired?: boolean) => Promise<void>;
    accessToken: string | null;
    refreshToken: string | null;
    isLoading: boolean;
    validateSession: () => Promise<{ isValid: boolean; accessToken: string | null }>;
    sessionError: string | null;
    clearSessionError: () => void;
    logout: () => Promise<void>;
}

interface TokenPair {
    accessToken: string;
    refreshToken: string;
    isRefreshed: boolean;
}

interface RefreshResponse {
    access_token: string;
    refresh_token?: string;
}

interface CustomAlertProps {
    isVisible: boolean;
    title: string;
    message?: string;
    buttons: AlertButton[];
}

interface RegisterResponse {
    message: string;
    user?: {
        id: string;
        email: string;
        full_name: string;
    };
}

interface TabIconProps {
    focused: boolean;
    color: string;
    size: number;
    name: keyof typeof Ionicons.glyphMap;
}

interface Task {
    id: number;
    name: string;
    description: string;
    created_at: datetime;
    completed_at: datetime;
    completed: boolean;
    user_id: number;
}


