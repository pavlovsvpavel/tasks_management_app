
const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const loginUser = async (
    email: string,
    password: string
): Promise<{ accessToken: string; refreshToken: string }> => {
    if (!email.trim()) throw new Error('Email is required');
    if (!password) throw new Error('Password is required');

    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);

    const response = await fetch(`${API_URL}/users/login`, {
        method: 'POST',
        body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.detail ||
            (response.status === 401 ? 'Invalid credentials' : 'Login failed')
        );
    }

    return {
        accessToken: data.tokens.access_token,
        refreshToken: data.tokens.refresh_token
    };
};
