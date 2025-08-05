import {useCallback, useEffect, useState} from 'react';
import {
    Alert,
    RefreshControl,
    ScrollView,
    TextInput,
} from 'react-native';
import {Image} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as SecureStore from 'expo-secure-store';
import {View, Text, TouchableOpacity} from '@/components/Themed';
import {useFocusEffect} from "expo-router";
import {useAuth} from "@/contexts/AuthContext";
import {useRefresh} from '@/contexts/RefreshContext';
import {Ionicons, MaterialCommunityIcons} from "@expo/vector-icons";
import {useApiClient} from '@/hooks/useApiClient';
import {
    ServerDownError,
    SessionExpiredError,
} from '@/utils/errors';
import {PageLoadingSpinner} from "@/components/PageLoadingSpinner";
import {ButtonSpinner} from "@/components/ButtonSpinner";
import {useAlert} from "@/contexts/AlertContext";
import {useApiErrorHandler} from "@/hooks/useApiErrorHandler";
import {useTranslation} from "react-i18next";
import ThemeSwitcher from "@/components/ThemeSwitcher";


export default function ProfileScreen() {
    const {registerRefreshHandler, unregisterRefreshHandler, triggerRefresh, isRefreshing} = useRefresh();
    const {logout, isLoading: isAuthLoading} = useAuth();
    const {showAlert} = useAlert();
    const {apiClient} = useApiClient();
    const [isProfileLoading, setIsProfileLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [editing, setEditing] = useState(false);
    const [showPasswordChange, setShowPasswordChange] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const {t, i18n} = useTranslation();
    const [showLanguageSettings, setShowLanguageSettings] = useState(false);
    const [showThemeSettings, setShowThemeSettings] = useState(false);
    const [pictureUrl, setPictureUrl] = useState<string | null>(null);
    const [focusedInput, setFocusedInput] = useState<string | null>(null);


    const changeLanguage = async (lng: 'en' | 'bg') => {
        try {
            await i18n.changeLanguage(lng);
            await SecureStore.setItemAsync('user-language', lng);
            console.log(`Language successfully saved: ${lng}`);
        } catch (error) {
            console.error("Failed to change or save language:", error);
        }
    };


    const handleApiError = useApiErrorHandler({
        validationTitles: {
            profile: t('profileChangeAlerts.validationError'),
            password: t('passwordChangeAlerts.validationError')
        }
    });

    const fetchProfileDetails = useCallback(async () => {
        try {
            const response = await apiClient('/users/profile-details', {
                method: 'GET'
            });
            const user = await response.json();

            console.log('Profile details fetched successfully:', {fullName: user.full_name, email: user.email});
            setFullName(user.full_name || '');
            setEmail(user.email);
            setPictureUrl(user.picture);
            return user;
        } catch (error) {
            if (error instanceof ServerDownError) {
                console.log('Cannot fetch profile, server is down.');
            } else if (error instanceof SessionExpiredError) {
                console.log('[Profile page] Cannot fetch profile, session expired.');
            } else {
                Alert.alert('Error', 'Failed to load your profile. Please pull down to refresh.');
            }
        }
    }, [apiClient]);

    const handlePickAndUploadImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
            showAlert({
                title: t('profileChangeAlerts.profilePictureUploadPermissionsTitle'),
                message: t('profileChangeAlerts.profilePictureUploadPermissionsMessage'),
                buttons: [{text: 'OK'}]
            });
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: 'images',
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
            base64: true,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            const imageAsset = result.assets[0];
            const base64Data = `data:${imageAsset.mimeType};base64,${imageAsset.base64}`;

            setIsSaving(true);
            try {
                const response = await apiClient('/users/upload-picture', {
                    method: 'POST',
                    body: JSON.stringify({
                        picture: base64Data,
                    }),
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                const updatedUser = await response.json();

                setPictureUrl(updatedUser.picture);
                showAlert({
                    title: t('profileChangeAlerts.profileChangeTitle'),
                    message: t('profileChangeAlerts.profileChangeMessage'),
                    buttons: [{text: 'OK'}]
                });
            } catch (error) {
                handleApiError(error, 'profile-picture');
            } finally {
                setIsSaving(false);
            }
        }
    };

    const handleProfileChanges = async () => {
        if (!fullName.trim()) {
            showAlert({
                title: t('profileChangeFullName.profileChangeTitle'),
                message: t('profileChangeFullName.profileChangeMessage'),
                buttons: [{text: 'OK'}]
            });
            return;
        }

        setIsSaving(true);
        try {
            const response = await apiClient('/users/profile-update', {
                method: 'PATCH',
                body: JSON.stringify({full_name: fullName.trim()}),
                retryOn401: false,
            });

            const updatedUser = await response.json();
            setFullName(updatedUser.full_name || '');
            setEmail(updatedUser.email);
            showAlert({
                title: t('profileChangeAlerts.profileChangeTitle'),
                message: t('profileChangeAlerts.profileChangeMessage'),
                buttons: [{text: 'OK'}]
            });
            setEditing(false);
        } catch (error) {
            handleApiError(error, 'profile');
        } finally {
            setIsSaving(false);
        }
    };

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            showAlert({
                title: t('passwordChangeAlerts.missingFieldsTitle'),
                message: t('passwordChangeAlerts.missingFieldsMessage'),
                buttons: [{text: 'OK'}]
            });
            return;
        }
        if (newPassword !== confirmPassword) {
            showAlert({
                title: t('passwordChangeAlerts.mismatchTitle'),
                message: t('passwordChangeAlerts.mismatchMessage'),
                buttons: [{text: 'OK'}]
            });
            return;
        }
        if (newPassword.length < 8) {
            showAlert({
                title: t('passwordChangeAlerts.tooShortTitle'),
                message: t('passwordChangeAlerts.tooShortMessage'),
                buttons: [{text: 'OK'}]
            });
            return;
        }

        setIsSaving(true);
        try {
            const response = await apiClient('/users/change-password', {
                method: 'POST',
                body: JSON.stringify({
                    current_password: currentPassword,
                    new_password: newPassword,
                }),
                retryOn401: false,
            });

            await response.json();
            showAlert({
                title: t('changePasswordConfirmationTitle'),
                message: t('changePasswordConfirmationMessage'),
                buttons: [{text: 'OK'}]
            });

            setShowPasswordChange(false);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            handleApiError(error, 'profile');
        } finally {
            setIsSaving(false);
        }
    };

    useEffect(() => {
        if (isAuthLoading) {
            return;
        }

        (async () => {
            try {
                setIsProfileLoading(true);
                await fetchProfileDetails();
            } catch (error) {
                console.error("Failed to load initial profile:", error);
            } finally {
                setIsProfileLoading(false);
            }
        })();

    }, [isAuthLoading, fetchProfileDetails]);


    useFocusEffect(
        useCallback(() => {
            registerRefreshHandler(fetchProfileDetails);
            return () => unregisterRefreshHandler();
        }, [registerRefreshHandler, unregisterRefreshHandler, fetchProfileDetails])
    );


    if (isProfileLoading) {
        return <PageLoadingSpinner/>;
    }

    const sectionClass = 'bg-card rounded-xl p-5 mb-5';


    return (
        <ScrollView
            className="bg-bgnd"
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
            <View className="flex-row justify-between items-center mb-5 px-4">
                <Text className="text-xl text-primary" weight="bold">{t('profile')}</Text>
                <TouchableOpacity
                    onPress={() =>
                        showAlert({
                            title: t('logoutConfirmationTitle'),
                            message: t('logoutConfirmationMessage'),
                            buttons: [
                                {text: t('cancel'), style: 'cancel'},
                                {
                                    text: t('logout'),
                                    style: 'destructive',
                                    onPress: logout,
                                },
                            ],
                        })
                    }
                >
                    <Ionicons name="log-out-outline" size={24} color="#EF4444"/>
                </TouchableOpacity>
            </View>

            <View className={`${sectionClass} items-center`}>
                <View className="relative mb-4">
                    <View className="w-20 h-20 rounded-full items-center justify-center overflow-hidden">
                        {pictureUrl ? (
                            <Image source={{uri: pictureUrl}} className="w-full h-full"/>
                        ) : (
                            <Ionicons name="person" size={40} color="#6B7280"/>
                        )}
                    </View>
                    <TouchableOpacity
                        className="absolute bottom-0 right-0 bg-white rounded-xl w-6 h-6 items-center justify-center"
                        onPress={handlePickAndUploadImage}
                        disabled={isSaving}
                    >
                        <Ionicons name="camera" size={16} color="#3B82F6"/>
                    </TouchableOpacity>
                </View>

                <View className="items-center">
                    <Text className="text-xl text-primary mb-1" weight="bold">{fullName}</Text>
                    <Text className="text-base text-secondary">{email}</Text>
                </View>
            </View>

            <View className={sectionClass}>
                <View className="flex-row justify-between items-center mb-5">
                    <Text className="text-lg text-primary" weight="bold">{t('personalInformation')}</Text>
                    <TouchableOpacity onPress={() => setEditing(!editing)}>
                        <MaterialCommunityIcons
                            name={editing ? "account-cancel" : "account-edit"}
                            size={24}
                            color="#3B82F6"
                        />
                    </TouchableOpacity>
                </View>

                <View className="mb-4">
                    <Text className="text-sm text-primary mb-1.5" weight="semibold">{t('fullName')}</Text>
                    <TextInput
                        className={`input-default border-default ${editing ? 'border-blue-500 text-primary' : 'text-secondary'}`}
                        value={fullName}
                        onChangeText={setFullName}
                        editable={editing}
                        placeholder={t('fullNamePlaceholder')}
                        placeholderTextColor="#9CA3AF"
                    />
                </View>

                <View className="mb-4">
                    <Text className="text-sm text-primary mb-1.5" weight="semibold">{t('email')}</Text>
                    <TextInput
                        className="input-default text-secondary border-default"
                        value={email}
                        editable={false}
                        placeholder={t('emailPlaceholder')}
                        placeholderTextColor="#9CA3AF"
                    />
                </View>

                {editing && (
                    <TouchableOpacity
                        className="btn-primary"
                        onPress={handleProfileChanges}
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <ButtonSpinner/>
                        ) : (
                            <>
                                <Ionicons name="save-outline" size={18} color="#ffffff"/>
                                <Text className="btn-primary-text" weight="bold">{t('saveProfileChanges')}</Text>
                            </>
                        )}
                    </TouchableOpacity>
                )}
            </View>

            <View className={sectionClass}>
                <View className="flex-row justify-between items-center mb-5">
                    <Text className="text-lg text-primary" weight="bold">{t('security')}</Text>
                    <Ionicons name="shield-checkmark-outline" size={22} color="#3B82F6"/>
                </View>

                <TouchableOpacity
                    className="expandable-btn"
                    onPress={() => setShowPasswordChange(!showPasswordChange)}
                >
                    <View className="flex-row items-center">
                        <Ionicons name="lock-closed-outline" size={20} color="#6B7280"/>
                        <Text className="ml-3 text-base text-primary" weight="semibold">{t('changePassword')}</Text>
                    </View>
                    <Ionicons name={showPasswordChange ? "chevron-up" : "chevron-down"} size={20} color="#6B7280"/>
                </TouchableOpacity>

                {showPasswordChange && (
                    <View className="border-t border-default  mt-4 pt-4">
                        <View className="mb-4 relative">
                            <Text className="text-sm text-primary mb-1.5"
                                  weight="semibold">{t('currentPassword')}</Text>
                            <TextInput
                                className={`input-default text-primary ${focusedInput === 'current' ? 'border-focused' : 'border-default'}`}
                                onFocus={() => setFocusedInput('current')}
                                onBlur={() => setFocusedInput(null)}
                                value={currentPassword}
                                onChangeText={setCurrentPassword}
                                secureTextEntry={!showCurrentPassword}
                                placeholder={t('currentPasswordPlaceholder')}
                                placeholderTextColor="#9CA3AF"
                            />
                            <TouchableOpacity
                                className="absolute right-3 top-10"
                                onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                            >
                                <Ionicons name={showCurrentPassword ? "eye-off" : "eye"} size={20} color="#6B7280"/>
                            </TouchableOpacity>
                        </View>

                        <View className="mb-4 relative">
                            <Text className="text-sm text-primary mb-1.5" weight="semibold">{t('newPassword')}</Text>
                            <TextInput
                                className={`input-default text-primary ${focusedInput === 'new' ? 'border-focused' : 'border-default'}`}
                                onFocus={() => setFocusedInput('new')}
                                onBlur={() => setFocusedInput(null)}
                                value={newPassword}
                                onChangeText={setNewPassword}
                                secureTextEntry={!showNewPassword}
                                placeholder={t('newPasswordPlaceholder')}
                                placeholderTextColor="#9CA3AF"
                            />
                            <TouchableOpacity
                                className="absolute right-3 top-10"
                                onPress={() => setShowNewPassword(!showNewPassword)}
                            >
                                <Ionicons name={showNewPassword ? "eye-off" : "eye"} size={20} color="#6B7280"/>
                            </TouchableOpacity>
                        </View>

                        <View className="mb-4 relative">
                            <Text className="text-sm text-primary mb-1.5"
                                  weight="semibold">{t('confirmNewPassword')}</Text>
                            <TextInput
                                className={`input-default text-primary ${focusedInput === 'confirm' ? 'border-focused' : 'border-default'}`}
                                onFocus={() => setFocusedInput('confirm')}
                                onBlur={() => setFocusedInput(null)}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry={!showConfirmPassword}
                                placeholder={t('confirmNewPasswordPlaceholder')}
                                placeholderTextColor="#9CA3AF"
                            />
                            <TouchableOpacity
                                className="absolute right-3 top-10"
                                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                <Ionicons name={showConfirmPassword ? "eye-off" : "eye"} size={20} color="#6B7280"/>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            className="btn-primary"
                            onPress={handleChangePassword}
                            disabled={isSaving}
                        >
                            {isSaving ? (
                                <ButtonSpinner/>

                            ) : (
                                <>
                                    <Ionicons name="save-outline" size={20} color="#ffffff"/>
                                    <Text className="text-white text-base ml-2" weight="bold">
                                        {t('confirmPasswordChange')}
                                    </Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                )}
            </View>
            <View className={`${sectionClass} gap-4`}>
                <View className="flex-row justify-between items-center mb-5">
                    <Text className="text-lg text-primary" weight="bold">{t('settings')}</Text>
                    <Ionicons name="settings-outline" size={22} color="#3B82F6"/>
                </View>

                <TouchableOpacity
                    className="expandable-btn"
                    onPress={() => setShowLanguageSettings(!showLanguageSettings)}
                >
                    <View className="flex-row items-center">
                        <Ionicons name="language" size={20} color="#6B7280"/>
                        <Text className="ml-3 text-base text-primary" weight="semibold">{t('changeLanguage')}</Text>
                    </View>
                    <Ionicons name={showLanguageSettings ? "chevron-up" : "chevron-down"} size={20} color="#6B7280"/>
                </TouchableOpacity>

                {showLanguageSettings && (
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
                )}
                <TouchableOpacity
                    className="expandable-btn"
                    onPress={() => setShowThemeSettings(!showThemeSettings)}
                >
                    <View className="flex-row items-center">
                        <MaterialCommunityIcons name="theme-light-dark" size={24} color="#6B7280"/>
                        <Text className="ml-3 text-base text-primary" weight="semibold">{t('theme')}</Text>
                    </View>
                    <Ionicons name={showThemeSettings ? "chevron-up" : "chevron-down"} size={20} color="#6B7280"/>
                </TouchableOpacity>

                {showThemeSettings && (
                    <ThemeSwitcher/>
                )}
            </View>
        </ScrollView>
    );
}