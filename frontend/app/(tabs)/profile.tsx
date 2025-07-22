import React, {useCallback, useEffect, useState} from 'react';
import {
    Alert,
    RefreshControl,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import {useFocusEffect} from "expo-router";
import {useSession} from "@/context/AuthContext";
import {useRefresh} from '@/context/RefreshContext';
import {Ionicons, MaterialCommunityIcons} from "@expo/vector-icons";
import {useApiClient, ServerDownError, SessionExpiredError} from '@/hooks/useApiClient';
import {PageLoadingSpinner} from "@/components/PageLoadingSpinner";
import {ButtonSpinner} from "@/components/ButtonSpinner";
import {useAlert} from "@/context/AlertContext";

export default function ProfileScreen() {
    const {registerRefreshHandler, unregisterRefreshHandler, triggerRefresh, isRefreshing} = useRefresh();
    const {logout, isLoading: isSessionLoading} = useSession();
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


    const fetchProfileDetails = useCallback(async () => {
        try {
            const response = await apiClient('/users/profile-details', {method: 'GET'});
            const user = await response.json();

            console.log('Profile details fetched successfully:', {fullName: user.full_name, email: user.email});
            setFullName(user.full_name || '');
            setEmail(user.email);
            return user;
        } catch (error) {
            // console.error('fetchProfileDetails error:', error);
            if (error instanceof ServerDownError) {
                console.log('Cannot fetch profile, server is down.');
            } else if (error instanceof SessionExpiredError) {
                console.log('Cannot fetch profile, session expired.');
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
            });

            const updatedUser = await response.json();
            setFullName(updatedUser.full_name || '');
            setEmail(updatedUser.email);
            showAlert({
                title: 'Success',
                message: 'Your profile has been updated successfully.',
                buttons: [{text: 'Great!'}]
            });
            setEditing(false);
        } catch (error) {
            console.error('handleProfileChanges error:', error);
            if (error instanceof ServerDownError || error instanceof SessionExpiredError) {
            } else {
                showAlert({
                    title: 'Update Failed',
                    message: 'We were unable to save your profile changes. Please try again.',
                    buttons: [{text: 'Dismiss'}]
                });
            }
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
            // console.error('handleChangePassword error:', error);
            // if (error instanceof ServerDownError || error instanceof SessionExpiredError) {
            //     // Handled globally
            // }

            if (error instanceof Error) {
                try {
                    const jsonString = error.message.split('Body: ')[1];

                    if (jsonString) {
                        const errorBody = JSON.parse(jsonString);
                        Alert.alert('Error', errorBody.detail || 'An invalid server response was received.');
                    } else {
                        Alert.alert('Error', error.message);
                    }
                } catch (parseError) {
                    console.error("Could not parse error body from message:", error.message);
                    Alert.alert('Error', 'Failed to change password. The server response was unreadable.');
                }
            } else {
                Alert.alert('Error', 'An unexpected and unknown error occurred.');
            }
        } finally {
            setIsSaving(false);
        }
    };

    useEffect(() => {
        if (isSessionLoading) {
            return;
        }

        const loadInitialProfile = async () => {
            setIsProfileLoading(true);
            await fetchProfileDetails();
            setIsProfileLoading(false);
        };

        loadInitialProfile();

    }, [isSessionLoading, fetchProfileDetails]);


    useFocusEffect(
        useCallback(() => {
            registerRefreshHandler(fetchProfileDetails);
            return () => unregisterRefreshHandler(); // Clean up on blur
        }, [registerRefreshHandler, unregisterRefreshHandler, fetchProfileDetails])
    );


    if (isProfileLoading) {
        return <PageLoadingSpinner/>;
    }

    const sectionClass = 'bg-white rounded-xl p-5 mx-4 mb-5 shadow-md';

    return (
        <ScrollView
            className="flex-1"
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
                <Text className="text-2xl font-bold text-primary">Profile</Text>
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
                    <Text className="text-xl font-semibold text-gray-800 mb-1">{fullName}</Text>
                    <Text className="text-base text-gray-500">{email}</Text>
                </View>
            </View>

            <View className={sectionClass}>
                <View className="flex-row justify-between items-center mb-5">
                    <Text className="text-lg font-semibold text-gray-800">Personal Information</Text>
                    <TouchableOpacity onPress={() => setEditing(!editing)}>
                        <MaterialCommunityIcons
                            name={editing ? "account-cancel" : "account-edit"}
                            size={24}
                            color="#3B82F6"
                        />
                    </TouchableOpacity>
                </View>

                <View className="mb-4">
                    <Text className="text-sm font-semibold text-primary mb-1.5">Full Name</Text>
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
                    <Text className="text-sm font-semibold text-primary mb-1.5">Email</Text>
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
                        className="bg-btn_color rounded-lg py-3 flex-row items-center justify-center mt-2 h-[48px]" // Added fixed height
                        onPress={handleProfileChanges}
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <ButtonSpinner/>
                        ) : (
                            <>
                                <Ionicons name="save" size={18} color="#ffffff"/>
                                <Text className="text-white text-base font-semibold ml-2">Save Changes</Text>
                            </>
                        )}
                    </TouchableOpacity>
                )}
            </View>

            <View className={sectionClass}>
                <View className="flex-row justify-between items-center mb-5">
                    <Text className="text-lg font-semibold text-gray-800">Security</Text>
                    <Ionicons name="shield-checkmark-outline" size={22} color="#3B82F6"/>
                </View>

                <TouchableOpacity
                    className="flex-row items-center justify-between py-3 px-4 bg-gray-100 rounded-lg"
                    onPress={() => setShowPasswordChange(!showPasswordChange)}
                >
                    <View className="flex-row items-center">
                        <Ionicons name="lock-closed-outline" size={20} color="#6B7280"/>
                        <Text className="ml-3 text-base text-primary font-medium">Change Password</Text>
                    </View>
                    <Ionicons name={showPasswordChange ? "chevron-up" : "chevron-down"} size={20} color="#6B7280"/>
                </TouchableOpacity>

                {showPasswordChange && (
                    <View className="border-t border-gray-200 mt-4 pt-4">
                        <View className="mb-4 relative">
                            <Text className="text-sm font-semibold text-primary mb-1.5">Current Password</Text>
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
                            <Text className="text-sm font-semibold text-primary mb-1.5">New Password</Text>
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
                            <Text className="text-sm font-semibold text-primary mb-1.5">Confirm New Password</Text>
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
                                    <Text className="text-white text-base font-semibold ml-2">Confirm Password
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