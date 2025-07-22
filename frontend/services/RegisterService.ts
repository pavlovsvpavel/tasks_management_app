import {RegisterResponse} from "@/interfaces/interfaces";


const API_URL = process.env.EXPO_PUBLIC_API_URL;

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