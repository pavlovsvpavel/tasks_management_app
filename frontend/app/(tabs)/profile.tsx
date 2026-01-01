import React, {useState} from 'react';
import {ScrollView, RefreshControl, View, Text, TouchableOpacity} from 'react-native';
import {Ionicons, MaterialCommunityIcons} from "@expo/vector-icons";
import {useTranslation} from "react-i18next";
import {PageLoadingSpinner} from "@/components/PageLoadingSpinner";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import ChangePasswordSwitcher from "@/components/ChangePasswordSwitcher";
import {useProfile} from "@/hooks/useProfile";
import {ProfileHeader} from "@/components/ProfileHeader";
import {PersonalInfo} from "@/components/PersonalInfo";


export default function ProfileScreen() {
    const {t} = useTranslation();
    const {
        user, isLoading, isSaving, isRefreshing,
        triggerRefresh, logout, showAlert,
        updateProfile, uploadImage, version
    } = useProfile();

    const [showLanguageSettings, setShowLanguageSettings] = useState(false);
    const [showThemeSettings, setShowThemeSettings] = useState(false);

    if (isLoading) return <PageLoadingSpinner/>;

    return (
        <View className="flex-1 bg-bgnd">
            {/* Top Bar */}
            <View className="flex-row justify-between items-center mb-5 px-4 pt-4">
                <Text className="text-xl text-primary font-bold">{t('profile')}</Text>
                <TouchableOpacity
                    onPress={() =>
                        showAlert({
                            title: t('logoutConfirmationTitle'),
                            message: t('logoutConfirmationMessage'),
                            buttons: [
                                {text: t('cancel'), style: 'cancel'},
                                {text: t('logout'), style: 'destructive', onPress: logout},
                            ],
                        })
                    }
                >
                    <Ionicons name="log-out-outline" size={24} color="#EF4444"/>
                </TouchableOpacity>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={triggerRefresh}
                        tintColor="#3B82F6"
                        colors={['#3B82F6']}
                    />
                }
            >
                <ProfileHeader
                    pictureUrl={user.pictureUrl}
                    fullName={user.fullName}
                    email={user.email}
                    onUpload={uploadImage}
                    disabled={isSaving}
                />

                <PersonalInfo
                    initialName={user.fullName}
                    email={user.email}
                    onSave={updateProfile}
                    isSaving={isSaving}
                />

                {user.provider === 'local' && <ChangePasswordSwitcher/>}

                {/* Settings Section */}
                <View className="bg-card rounded-xl p-5 mb-5 gap-4">
                    <View className="flex-row justify-between items-center mb-5">
                        <Text className="text-lg text-primary font-bold">{t('settings')}</Text>
                        <Ionicons name="settings-outline" size={22} color="#3B82F6"/>
                    </View>

                    {/* Language Toggle */}
                    <TouchableOpacity
                        className="expandable-btn"
                        onPress={() => setShowLanguageSettings(!showLanguageSettings)}
                    >
                        <View className="flex-row items-center">
                            <Ionicons name="language" size={20} color="#6B7280"/>
                            <Text className="ml-3 text-base text-primary font-semibold">{t('changeLanguage')}</Text>
                        </View>
                        <Ionicons name={showLanguageSettings ? "chevron-up" : "chevron-down"} size={20}
                                  color="#6B7280"/>
                    </TouchableOpacity>
                    {showLanguageSettings && <LanguageSwitcher/>}

                    {/* Theme Toggle */}
                    <TouchableOpacity
                        className="expandable-btn"
                        onPress={() => setShowThemeSettings(!showThemeSettings)}
                    >
                        <View className="flex-row items-center">
                            <MaterialCommunityIcons name="theme-light-dark" size={24} color="#6B7280"/>
                            <Text className="ml-3 text-base text-primary font-semibold">{t('theme')}</Text>
                        </View>
                        <Ionicons name={showThemeSettings ? "chevron-up" : "chevron-down"} size={20} color="#6B7280"/>
                    </TouchableOpacity>
                    {showThemeSettings && <ThemeSwitcher/>}
                </View>

                <Text className="mb-5 text-base text-primary text-center">Version {version}</Text>
            </ScrollView>
        </View>
    );
}