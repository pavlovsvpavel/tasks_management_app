import {use, createContext, type PropsWithChildren} from 'react';
import {useStorageState} from '@/hooks/useStorageState';
import {router} from "expo-router";

interface AuthContextType {
    signIn: (token: string) => void;
    signOut: () => void;
    session?: string | null;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
    signIn: () => null,
    signOut: () => null,
    session: null,
    isLoading: false,
});


// This hook can be used to access the user info.
export function useSession() {
    const value = use(AuthContext);

    if (!value) {
        throw new Error('useSession must be wrapped in a <SessionProvider />');
    }
    return value;
}

export function SessionProvider({children}: PropsWithChildren) {
    const [[isLoading, session], setSession] = useStorageState('session');

    return (
        <AuthContext
            value={{
                signIn: (token: string) => {
                    setSession('token');
                },
                signOut: () => {
                    setSession(null);
                    router.replace('/');
                },
                session,
                isLoading,
            }}>
            {children}
        </AuthContext>
    );
}
