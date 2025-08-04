import {createContext, useState, useContext, useEffect, ReactNode, useMemo, useCallback} from 'react';
import {useColorScheme} from 'nativewind';
import * as SecureStore from 'expo-secure-store';
import {PageLoadingSpinner} from "@/components/PageLoadingSpinner";

interface ThemeContextType {
    theme: 'light' | 'dark';
    toggleTheme: () => void;
    setTheme: (theme: 'light' | 'dark') => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({children}: { children: ReactNode }) => {
    const {colorScheme, setColorScheme} = useColorScheme();
    const [isThemeLoading, setIsThemeLoading] = useState(true);

    useEffect(() => {
        const loadTheme = async () => {
            try {
                const savedTheme = await SecureStore.getItemAsync('app-theme');
                if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
                    setColorScheme(savedTheme);
                }
            } catch (error) {
                console.error('Failed to load theme from storage', error);
            } finally {
                setIsThemeLoading(false);
            }
        };
        loadTheme();
    }, [setColorScheme]);


    const toggleTheme = useCallback(async () => {
        const newTheme = colorScheme === 'light' ? 'dark' : 'light';
        setColorScheme(newTheme);
        try {
            await SecureStore.setItemAsync('app-theme', newTheme);
        } catch (error) {
            console.error('Failed to save theme to storage', error);
        }
    }, [colorScheme, setColorScheme]);

    const setTheme = useCallback(async (theme: 'light' | 'dark') => {
        setColorScheme(theme);
        try {
            await SecureStore.setItemAsync('app-theme', theme);
        } catch (error) {
            console.error('Failed to save theme to storage', error);
        }
    }, [setColorScheme]);


    const value = useMemo(() => ({
        theme: colorScheme as 'light' | 'dark',
        toggleTheme,
        setTheme,
    }), [colorScheme, toggleTheme, setTheme]);


    if (isThemeLoading) {
        return <PageLoadingSpinner/>;
    }

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};