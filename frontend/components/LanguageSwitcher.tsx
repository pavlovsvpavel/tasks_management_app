import {Text, TouchableOpacity, View} from "@/components/Themed";
import {Ionicons} from "@expo/vector-icons";
import {useTranslation} from "react-i18next";
import * as SecureStore from "expo-secure-store";

const LanguageSwitcher = () => {
    const {i18n} = useTranslation();
    const changeLanguage = async (lng: 'en' | 'bg') => {
        try {
            await i18n.changeLanguage(lng);
            await SecureStore.setItemAsync('user-language', lng);
        } catch (error) {
            console.error("Failed to change or save language:", error);
        }
    };

    return (
        <View className="justify-between gap-3 border-t border-default mt-4 pt-4">
            <TouchableOpacity
                className="flex-row items-center justify-between p-3 rounded-lg"
                onPress={() => changeLanguage('en')}
            >
                <Text className="text-base text-primary">English</Text>
                <Ionicons
                    name={i18n.language === 'en' ? 'radio-button-on' : 'radio-button-off'}
                    size={24}
                    color={i18n.language === 'en' ? '#3B82F6' : '#9CA3AF'}
                />

            </TouchableOpacity>

            <TouchableOpacity
                className="flex-row items-center justify-between p-3 rounded-lg"
                onPress={() => changeLanguage('bg')}
            >
                <Text className="text-base text-primary">Български</Text>
                <Ionicons
                    name={i18n.language === 'bg' ? 'radio-button-on' : 'radio-button-off'}
                    size={24}
                    color={i18n.language === 'bg' ? '#3B82F6' : '#9CA3AF'}
                />

            </TouchableOpacity>
        </View>
    )
}

export default LanguageSwitcher;