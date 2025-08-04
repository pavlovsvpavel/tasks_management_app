import {createContext, useState, useContext, useEffect, ReactNode, useMemo, useCallback} from 'react';
import {useColorScheme} from 'nativewind';
import * as SecureStore from 'expo-secure-store';
import {PageLoadingSpinner} from '@/components/PageLoadingSpinner';


type ThemePreference = 'light' | 'dark' | 'system';

interface ThemeContextType {
    theme: 'light' | 'dark';
    themePreference: ThemePreference;
    setThemePreference: (preference: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_PREFERENCE_KEY = 'theme-preference';

export const ThemeProvider = ({children}: { children: ReactNode }) => {
    const {colorScheme, setColorScheme} = useColorScheme();
    const [themePreference, setThemePreferenceState] = useState<ThemePreference>('system');
    const [isThemeLoading, setIsThemeLoading] = useState(true);

    useEffect(() => {
        const loadThemePreference = async () => {
            try {
                const savedPreference = await SecureStore.getItemAsync(THEME_PREFERENCE_KEY);
                if (savedPreference && ['light', 'dark', 'system'].includes(savedPreference)) {
                    const pref = savedPreference as ThemePreference;
                    setColorScheme(pref);
                    setThemePreferenceState(pref);
                }
            } catch (error) {
                console.error('Failed to load theme preference from storage', error);
            } finally {
                setIsThemeLoading(false);
            }
        };
        loadThemePreference();
    }, [setColorScheme]);


    const setThemePreference = useCallback(async (preference: ThemePreference) => {
        setColorScheme(preference);
        setThemePreferenceState(preference);
        try {
            await SecureStore.setItemAsync(THEME_PREFERENCE_KEY, preference);
        } catch (error) {
            console.error('Failed to save theme preference to storage', error);
        }
    }, [setColorScheme]);

    const value = useMemo(() => ({
        theme: colorScheme as 'light' | 'dark',
        themePreference,
        setThemePreference,
    }), [colorScheme, themePreference, setThemePreference]);

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