interface Task {
    id: number;
    name: string;
    description: string;
    created_at: datetime;
    completed_at: datetime;
    completed: boolean;
    user_id: number;
}

interface LoginResponse {
    tokens: {
        access_token: string;
        refresh_token?: string;
        token_type?: string;
        expires_in?: number;
    };
    user?: {
        id: string;
        email: string;
        name?: string;
    };
    message?: string;
}

interface RegisterResponse {
  message: string;
  user?: {
    id: string;
    email: string;
    full_name: string;
  };
}
