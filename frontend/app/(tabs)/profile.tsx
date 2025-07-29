import {useCallback, useEffect, useState} from 'react';
import {
    Alert,
    RefreshControl,
    ScrollView,
    TextInput,
} from 'react-native';
import { View, Text, TouchableOpacity } from '@/components/Themed';
import {useFocusEffect} from "expo-router";
import {useAuth} from "@/context/AuthContext";
import {useRefresh} from '@/context/RefreshContext';
import {Ionicons, MaterialCommunityIcons} from "@expo/vector-icons";
import {useApiClient} from '@/hooks/useApiClient';
import {
    ServerDownError,
    SessionExpiredError,
    SessionRefreshedError,
    ValidationError
} from '@/utils/errors';
import {PageLoadingSpinner} from "@/components/PageLoadingSpinner";
import {ButtonSpinner} from "@/components/ButtonSpinner";
import {useAlert} from "@/context/AlertContext";

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

    const handleApiError = useCallback((error: unknown, context: 'profile' | 'password') => {
        console.error(`An API error occurred while updating ${context}:`, error);

        if (error instanceof SessionRefreshedError) {
            showAlert({
                title: 'Session Updated',
                message: 'Your session was refreshed for security. Please try your action again.',
                buttons: [{text: 'OK'}]
            });
            return;
        }

        if (error instanceof SessionExpiredError || error instanceof ServerDownError) {
            return;
        }

        if (error instanceof ValidationError) {
            showAlert({
                title: context === 'password' ? 'Password Change Failed' : 'Update Failed',
                message: error.body.detail || 'The server returned a validation error.',
                buttons: [{text: 'OK'}]
            });
            return;
        }

        showAlert({
            title: 'An Unexpected Error Occurred',
            message: 'We were unable to complete your request. Please try again.',
            buttons: [{text: 'Dismiss'}]
        });
    }, [showAlert]);


    const fetchProfileDetails = useCallback(async () => {
        try {
            const response = await apiClient('/users/profile-details', {method: 'GET'});
            const user = await response.json();

            console.log('Profile details fetched successfully:', {fullName: user.full_name, email: user.email});
            setFullName(user.full_name || '');
            setEmail(user.email);
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

    const handleProfileChanges = async () => {
        if (!fullName.trim()) {
            showAlert({
                title: 'Invalid Input',
                message: 'Full name cannot be empty.',
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
                title: 'Success',
                message: 'Your profile has been updated successfully.',
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
                title: 'Missing Fields',
                message: 'All password fields are required.',
                buttons: [{text: 'OK'}]
            });
            return;
        }
        if (newPassword !== confirmPassword) {
            showAlert({
                title: 'Password Mismatch',
                message: 'Your new password and confirmation do not match.',
                buttons: [{text: 'OK'}]
            });
            return;
        }
        if (newPassword.length < 8) {
            showAlert({
                title: 'Password Too Short',
                message: 'Your new password must be at least 8 characters long.',
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
                title: 'Password Changed',
                message: 'Your password has been successfully updated.',
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

    const sectionClass = 'bg-white rounded-xl p-5 mb-5';

    return (
        <ScrollView
            className="flex-1 py-5"
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
                <Text className="text-2xl text-primary" weight="bold">Profile</Text>
                <TouchableOpacity
                    onPress={() =>
                        showAlert({
                            title: 'Confirm Logout',
                            message: 'Are you sure you want to log out?',
                            buttons: [
                                {text: 'Cancel', style: 'cancel'},
                                {
                                    text: 'Logout',
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
                    <View className="w-20 h-20 rounded-full bg-gray-100 items-center justify-center overflow-hidden">
                        <Ionicons name="person" size={40} color="#6B7280"/>
                    </View>
                    <TouchableOpacity
                        className="absolute bottom-0 right-0 bg-btn_color rounded-xl w-6 h-6 items-center justify-center">
                        <Ionicons name="camera" size={16} color="#FFFFFF"/>
                    </TouchableOpacity>
                </View>

                <View className="items-center">
                    <Text className="text-xl text-gray-800 mb-1" weight="bold">{fullName}</Text>
                    <Text className="text-base text-gray-500">{email}</Text>
                </View>
            </View>

            <View className={sectionClass}>
                <View className="flex-row justify-between items-center mb-5">
                    <Text className="text-lg text-gray-800" weight="bold">Personal Information</Text>
                    <TouchableOpacity onPress={() => setEditing(!editing)}>
                        <MaterialCommunityIcons
                            name={editing ? "account-cancel" : "account-edit"}
                            size={24}
                            color="#3B82F6"
                        />
                    </TouchableOpacity>
                </View>

                <View className="mb-4">
                    <Text className="text-sm text-primary mb-1.5" weight="semibold">Full Name</Text>
                    <TextInput
                        className={`bg-gray-50 border border-gray-300 rounded-lg px-3 py-2.5 text-base text-gray-800 ${!editing && 'bg-gray-100 text-gray-500'}`}
                        value={fullName}
                        onChangeText={setFullName}
                        editable={editing}
                        placeholder="Enter full name"
                        placeholderTextColor="#9CA3AF"
                    />
                </View>

                <View className="mb-4">
                    <Text className="text-sm text-primary mb-1.5" weight="semibold">Email</Text>
                    <TextInput
                        className="bg-gray-100 border border-gray-300 rounded-lg px-3 py-2.5 text-base text-gray-500"
                        value={email}
                        editable={false}
                        placeholder="Email address"
                        placeholderTextColor="#9CA3AF"
                    />
                </View>

                {editing && (
                    <TouchableOpacity
                        className="bg-btn_color rounded-lg py-3 flex-row items-center justify-center mt-2 h-[48px]"
                        onPress={handleProfileChanges}
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <ButtonSpinner/>
                        ) : (
                            <>
                                <Ionicons name="save" size={18} color="#ffffff"/>
                                <Text className="text-white text-base ml-2" weight="bold">Save Changes</Text>
                            </>
                        )}
                    </TouchableOpacity>
                )}
            </View>

            <View className={sectionClass}>
                <View className="flex-row justify-between items-center mb-5">
                    <Text className="text-lg text-gray-800" weight="bold">Security</Text>
                    <Ionicons name="shield-checkmark-outline" size={22} color="#3B82F6"/>
                </View>

                <TouchableOpacity
                    className="flex-row items-center justify-between py-3 px-4 bg-gray-100 rounded-lg"
                    onPress={() => setShowPasswordChange(!showPasswordChange)}
                >
                    <View className="flex-row items-center">
                        <Ionicons name="lock-closed-outline" size={20} color="#6B7280"/>
                        <Text className="ml-3 text-base text-primary" weight="semibold">Change Password</Text>
                    </View>
                    <Ionicons name={showPasswordChange ? "chevron-up" : "chevron-down"} size={20} color="#6B7280"/>
                </TouchableOpacity>

                {showPasswordChange && (
                    <View className="border-t border-gray-200 mt-4 pt-4">
                        <View className="mb-4 relative">
                            <Text className="text-sm text-primary mb-1.5" weight="semibold">Current Password</Text>
                            <TextInput
                                className="bg-gray-50 border border-gray-300 rounded-lg px-3 py-2.5 text-base text-gray-800"
                                value={currentPassword}
                                onChangeText={setCurrentPassword}
                                secureTextEntry={!showCurrentPassword}
                                placeholder="Enter current password"
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
                            <Text className="text-sm text-primary mb-1.5" weight="semibold">New Password</Text>
                            <TextInput
                                className="bg-gray-50 border border-gray-300 rounded-lg px-3 py-2.5 text-base text-gray-800"
                                value={newPassword}
                                onChangeText={setNewPassword}
                                secureTextEntry={!showNewPassword}
                                placeholder="Enter new password"
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
                            <Text className="text-sm text-primary mb-1.5" weight="semibold">Confirm New Password</Text>
                            <TextInput
                                className="bg-gray-50 border border-gray-300 rounded-lg px-3 py-2.5 text-base text-gray-800"
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry={!showConfirmPassword}
                                placeholder="Confirm new password"
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
                            className="bg-btn_color rounded-lg py-3 flex-row items-center justify-center mt-2 h-[48px]"
                            onPress={handleChangePassword}
                            disabled={isSaving}
                        >
                            {isSaving ? (
                                <ButtonSpinner/>

                            ) : (
                                <>
                                    <Ionicons name="lock-closed-outline" size={20} color="#ffffff"/>
                                    <Text className="text-white text-base ml-2" weight="bold">Confirm Password
                                        Change</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </ScrollView>
    );
}