import {isValidEmail} from '@/utils/validation';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const loginUser = async (
    email: string,
    password: string
): Promise<LoginResponse> => {
    if (!email.trim()) {
        throw new Error('Email is required');
    }

    if (!isValidEmail(email.trim())) {
        throw new Error('Please enter a valid email address');
    }

    if (!password) {
        throw new Error('Password is required');
    }

    try {
        const response = await fetch(`${API_URL}/users/login`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({email, password}),
            credentials: 'include',
        });

        const data = await response.json();

        if (!response.ok) {
            // Handle backend errors
            throw new Error(
                data.detail ||
                (response.status === 401 ? 'Incorrect password' :
                    response.status === 403 ? 'Your account is disabled. Please contact support.' :
                        response.status === 404 ? 'No account found with this email' :
                            'Login failed')
            );
        }

        if (!data?.tokens?.access_token) {
            throw new Error('Invalid server response - missing access token');
        }

        return data;

    } catch (error: unknown) {
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('Network request failed');
    }
};


export const registerUser = async (
    fullName: string,
    email: string,
    password: string,
    confirmPassword: string
): Promise<RegisterResponse> => {
    if (!fullName.trim()) {
        throw new Error('Full name is required');
    }

    if (!email.trim()) {
        throw new Error('Email is required');
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
        throw new Error('Please enter a valid email address');
    }

    if (!password) {
        throw new Error('Password is required');
    }

    if (password.length < 4) {
        throw new Error('Password must be at least 8 characters');
    }

    if (password !== confirmPassword) {
        throw new Error('Passwords do not match');
    }

    try {
        const response = await fetch(`${API_URL}/users/register`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                full_name: fullName,
                email,
                password
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || 'Registration failed');
        }

        return data;

    } catch (error: unknown) {
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('Network request failed');
    }
};


export const loginAfterRegister = async (email: string, password: string): Promise<LoginResponse> => {
    try {
        const response = await fetch(`${API_URL}/users/login`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({email, password}),
            credentials: 'include',
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || 'Login failed');
        }

        if (!data?.tokens?.access_token) {
            throw new Error('Invalid server response');
        }

        return data;

    } catch (error: unknown) {
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('Network request failed');
    }
};


