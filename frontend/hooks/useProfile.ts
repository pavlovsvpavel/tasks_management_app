import {useState, useCallback, useEffect} from 'react';
import {Alert} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Application from 'expo-application';
import {useFocusEffect} from 'expo-router';
import {useTranslation} from 'react-i18next';
import {useApiClient} from '@/hooks/useApiClient';
import {useAuth} from '@/contexts/AuthContext';
import {useAlert} from '@/contexts/AlertContext';
import {useRefresh} from '@/contexts/RefreshContext';
import {useApiErrorHandler} from '@/hooks/useApiErrorHandler';
import {ServerDownError, SessionExpiredError} from '@/utils/errors';

export const useProfile = () => {
    const {t} = useTranslation();
    const {apiClient} = useApiClient();
    const {logout, isLoading: isAuthLoading} = useAuth();
    const {showAlert} = useAlert();
    const {registerRefreshHandler, unregisterRefreshHandler, triggerRefresh, isRefreshing} = useRefresh();

    // Consolidated State
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // User Data State
    const [user, setUser] = useState({
        fullName: '',
        email: '',
        pictureUrl: null as string | null,
        provider: '',
    });

    const handleApiError = useApiErrorHandler({
        validationTitles: {profile: t('profileChangeAlerts.validationError')}
    });

    const fetchProfileDetails = useCallback(async () => {
        try {
            const response = await apiClient('/users/profile-details', {method: 'GET'});
            const data = await response.json();

            setUser({
                fullName: data.full_name || '',
                email: data.email,
                pictureUrl: data.picture,
                provider: data.auth_provider || 'local',
            });
        } catch (error) {
            if (error instanceof ServerDownError) {
                console.log('Server down');
            } else if (error instanceof SessionExpiredError) {
                console.log('Session expired');
            } else {
                Alert.alert('Error', 'Failed to load profile.');
            }
        }
    }, [apiClient]);

    // Initial Load
    useEffect(() => {
        if (!isAuthLoading) {
            (async () => {
                setIsLoading(true);
                await fetchProfileDetails();
                setIsLoading(false);
            })();
        }
    }, [isAuthLoading, fetchProfileDetails]);

    // Refresh Handler
    useFocusEffect(
        useCallback(() => {
            registerRefreshHandler(fetchProfileDetails);
            return () => unregisterRefreshHandler();
        }, [registerRefreshHandler, unregisterRefreshHandler, fetchProfileDetails])
    );

    const updateProfile = async (newName: string) => {
        if (!newName.trim()) {
            showAlert({
                title: t('profileChangeFullName.profileChangeTitle'),
                message: t('profileChangeFullName.profileChangeMessage'),
                buttons: [{text: 'OK'}]
            });
            return false;
        }

        setIsSaving(true);
        try {
            const response = await apiClient('/users/profile-update', {
                method: 'PATCH',
                body: JSON.stringify({full_name: newName.trim()}),
                retryOn401: false,
            });
            const updatedUser = await response.json();
            setUser(prev => ({...prev, fullName: updatedUser.full_name, email: updatedUser.email}));

            showAlert({
                title: t('profileChangeAlerts.profileChangeTitle'),
                message: t('profileChangeAlerts.profileChangeMessage'),
                buttons: [{text: 'OK'}]
            });
            return true;
        } catch (error) {
            handleApiError(error, 'profile');
            return false;
        } finally {
            setIsSaving(false);
        }
    };

    const uploadImage = async () => {
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

        if (!result.canceled && result.assets?.[0]) {
            const imageAsset = result.assets[0];
            const base64Data = `data:${imageAsset.mimeType};base64,${imageAsset.base64}`;

            setIsSaving(true);
            try {
                const response = await apiClient('/users/upload-picture', {
                    method: 'POST',
                    body: JSON.stringify({picture: base64Data}),
                    headers: {'Content-Type': 'application/json'},
                });
                const updatedUser = await response.json();
                setUser(prev => ({...prev, pictureUrl: updatedUser.picture}));

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

    return {
        user,
        isLoading,
        isSaving,
        isRefreshing,
        triggerRefresh,
        logout,
        showAlert,
        updateProfile,
        uploadImage,
        version: Application.nativeApplicationVersion
    };
};