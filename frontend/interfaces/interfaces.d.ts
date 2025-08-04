import {Ionicons} from "@expo/vector-icons";
import {AlertButton} from "@/components/CustomAlert";
import {ComponentProps} from "react";
import {Priority} from "@/components/TaskForm";

export interface ServerStatusContextType {
    isServerDown: boolean;
    checkHealth: () => Promise<boolean>;
    isInitialCheckComplete: boolean;
    setServerStatus: (isDown: boolean) => void;
}

export interface RetryContextType {
    registerRetryHandler: (key: string, handler: () => Promise<void>) => void;
    unregisterRetryHandler: (key: string) => void;
    triggerRetry: () => void;
}

export interface RefreshHandler<T = void> {
    (): Promise<T>;
}

export interface RefreshContextType {
    registerRefreshHandler: <T>(handler: RefreshHandler<T>) => void;
    unregisterRefreshHandler: () => void;
    triggerRefresh: () => Promise<void>;
    isRefreshing: boolean;
}

export interface AuthContextType {
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

export interface TokenPair {
    accessToken: string;
    refreshToken: string;
    isRefreshed: boolean;
}

export interface RefreshResponse {
    access_token: string;
    refresh_token?: string;
}

export interface CustomAlertProps {
    isVisible: boolean;
    title: string;
    message?: string;
    buttons: AlertButton[];
}

export interface RegisterResponse {
    message: string;
    user?: {
        id: string;
        email: string;
        full_name: string;
    };
}

export interface TabIconProps {
    focused: boolean;
    color: string;
    size: number;
    name: keyof typeof Ionicons.glyphMap;
}

export interface Task {
    id: number;
    name: string;
    description: string;
    created_at: datetime;
    completed_at: datetime;
    completed: boolean;
    user_id: number;
}

export interface ErrorHandlerOptions {
    validationTitles?: Record<string, string>;
}

export interface TaskResponse {
    id: number;
    user_id: number;
    title: string;
    description: string | null;
    completed: boolean;
    due_date: string;
    priority: 'low' | 'medium' | 'high';
    created_at: string;
    completed_at: string | null;
}

export type SortField = 'due_date' | 'title';
export type SortDirection = 'asc' | 'desc';

export interface SortControlsProps {
    sortBy: SortField;
    sortDirection: SortDirection;
    onSortChange: (field: SortField) => void;
}

export interface TaskItemProps {
    task: TaskResponse;
    onPrompt: () => void;
    isUpdating: boolean;
}

export interface DetailRowProps {
    label: string;
    value: string;
    valueColor?: string;
}

export interface PrioritySelectorProps {
    currentPriority: Priority;
    onPriorityChange: (priority: Priority) => void;
}

export interface TaskCacheContextType {
    getTaskFromCache: (taskId: number) => TaskResponse | undefined;
    updateTaskInCache: (task: TaskResponse) => void;
}

export interface TaskFormProps {
    title: string;
    description: string;
    dueDate: Date | null;
    priority: Priority;

    onTitleChange: (text: string) => void;
    onDescriptionChange: (text: string) => void;
    onPriorityChange: (priority: Priority) => void;

    onShowDatePicker: () => void;
    onSubmit: () => void;

    isSubmitting: boolean;
    submitButtonText: string;
    submitButtonIconName: ComponentProps<typeof Ionicons>['name'];
    formatDisplayDate: (date: Date | null) => string;
}

export interface ApiClientOptions extends RequestInit {
    retryOn401?: boolean;
}