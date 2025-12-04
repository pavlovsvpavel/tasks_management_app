import i18next from 'i18next';
import {initReactI18next} from 'react-i18next';
import * as Localization from 'expo-localization';
import * as SecureStore from 'expo-secure-store';
import en from '../translations/en/common.json';
import bg from '../translations/bg/common.json';

const LANGUAGE_KEY = 'user-language';

const languageDetector = {
    type: 'languageDetector' as const,
    async: true,
    detect: async (callback: (lang: string) => void) => {
        try {
            const storedLanguage = await SecureStore.getItemAsync(LANGUAGE_KEY);
            if (storedLanguage) {
                return callback(storedLanguage);
            }
            const locales = Localization.getLocales();
            const deviceLanguage = locales?.[0]?.languageCode;

            return callback(deviceLanguage || 'en');

        } catch (error) {
            console.error('Error reading language from storage:', error);
            return callback('en');
        }
    },
    init: () => {
    },
    cacheUserLanguage: async (lng: string) => {
        try {
            await SecureStore.setItemAsync(LANGUAGE_KEY, lng);
        } catch (error) {
            console.error('Error saving language to storage:', error);
        }
    },
};


(async () => {
    try {
        await i18next
            .use(languageDetector)
            .use(initReactI18next)
            .init({
                compatibilityJSON: 'v4',
                resources: {
                    en: {
                        common: en,
                    },
                    bg: {
                        common: bg,
                    },
                },
                fallbackLng: 'en',
                defaultNS: 'common',
                interpolation: {
                    escapeValue: false,
                },
                react: {
                    useSuspense: false,
                },
            });
    } catch (error) {
        console.error('Failed to initialize i18next:', error);
    }
})();


export default i18next;