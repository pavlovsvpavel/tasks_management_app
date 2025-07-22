import * as SecureStore from 'expo-secure-store';

// export const getTokens = async () => {
//     try {
//         const [accessToken, refreshToken] = await Promise.all([
//             SecureStore.getItemAsync('access_token'),
//             SecureStore.getItemAsync('refresh_token'),
//         ]);
//
//         console.log('Tokens fetched from SecureStore:', {
//             accessToken: !!accessToken,
//             refreshToken: !!refreshToken
//         });
//         return {accessToken, refreshToken};
//     } catch (error) {
//         console.error('getTokens error:', error, 'at', new Date().toISOString());
//         return {accessToken: null, refreshToken: null};
//     }
// };
//
// export const saveTokensToStorage = async (accessToken: string, refreshToken: string) => {
//     try {
//         console.log('Saving tokens to SecureStore at', new Date().toISOString());
//         await Promise.all([
//             SecureStore.setItemAsync('access_token', accessToken),
//             SecureStore.setItemAsync('refresh_token', refreshToken),
//         ]);
//     } catch (error) {
//         console.error('saveTokens error:', error, 'at', new Date().toISOString());
//         throw error; // Let the caller handle it (e.g., show a toast)
//     }
// };
//
// export const deleteTokensFromStorage = async () => {
//     try {
//         console.log('Deleting tokens from SecureStore at', new Date().toISOString());
//         await Promise.all([
//             SecureStore.deleteItemAsync('access_token'),
//             SecureStore.deleteItemAsync('refresh_token'),
//         ]);
//     } catch (error) {
//         console.error('deleteTokens error:', error, 'at', new Date().toISOString());
//         throw error;
//     }
// };
//

export const getTokens = async (): Promise<{
    accessToken: string | null;
    refreshToken: string | null;
}> => {
    try {
        const [accessToken, refreshToken] = await Promise.all([
            SecureStore.getItemAsync('access_token'),
            SecureStore.getItemAsync('refresh_token'),
        ]);
        return {accessToken, refreshToken};
    } catch (error) {
        console.error('Storage read error:', error);
        return {accessToken: null, refreshToken: null};
    }
};

export const saveTokensToStorage = async (
    accessToken: string,
    refreshToken: string
): Promise<void> => {
    try {
        // Atomic write pattern
        await SecureStore.setItemAsync('temp_access', accessToken);
        await SecureStore.setItemAsync('temp_refresh', refreshToken);

        await Promise.all([
            SecureStore.deleteItemAsync('access_token'),
            SecureStore.deleteItemAsync('refresh_token'),
            SecureStore.setItemAsync('access_token', accessToken),
            SecureStore.setItemAsync('refresh_token', refreshToken),
        ]);

        await Promise.all([
            SecureStore.deleteItemAsync('temp_access'),
            SecureStore.deleteItemAsync('temp_refresh'),
        ]);
    } catch (error) {
        await deleteTokensFromStorage();
        throw error;
    }
};

export const deleteTokensFromStorage = async (): Promise<void> => {
    await Promise.allSettled([
        SecureStore.deleteItemAsync('access_token'),
        SecureStore.deleteItemAsync('refresh_token'),
    ]);
};