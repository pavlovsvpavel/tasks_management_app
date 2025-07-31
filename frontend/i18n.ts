import i18next from 'i18next';
import {initReactI18next} from 'react-i18next';
import * as Localization from 'expo-localization';

import en from './translations/en/common.json';
import bg from './translations/bg/common.json';

// --- Wrap the initialization in an async IIFE ---
(async () => {
    const locales = Localization.getLocales();
    let deviceLanguage = 'en';

    if (locales && locales.length > 0) {
        deviceLanguage = locales[0].languageCode || 'en';
    }

    try {
        await i18next
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
                lng: deviceLanguage,
                fallbackLng: 'en',
                defaultNS: 'common',
                interpolation: {
                    escapeValue: false,
                },
            });
    } catch (error) {
        console.error('Failed to initialize i18next:', error);
    }
})();

export default i18next;