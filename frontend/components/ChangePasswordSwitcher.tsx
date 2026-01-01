import {Text, TouchableOpacity, View} from "@/components/Themed";
import {Ionicons} from "@expo/vector-icons";
import {TextInput} from "react-native";
import {ButtonSpinner} from "@/components/ButtonSpinner";
import {useState} from "react";
import {useTranslation} from "react-i18next";
import {useAlert} from "@/contexts/AlertContext";
import {useApiClient} from "@/hooks/useApiClient";
import {useApiErrorHandler} from "@/hooks/useApiErrorHandler";

const ChangePasswordSwitcher = () => {
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showPasswordChange, setShowPasswordChange] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [focusedInput, setFocusedInput] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const {t} = useTranslation();
    const {showAlert} = useAlert();
    const {apiClient} = useApiClient();
    const handleApiError = useApiErrorHandler({
        validationTitles: {
            password: t('passwordChangeAlerts.validationError')
        }
    });

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

    const sectionClass = 'bg-card rounded-xl p-5 mb-5';
    return (
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
                    <Text className="ml-3 text-base text-primary"
                          weight="semibold">{t('changePassword')}</Text>
                </View>
                <Ionicons name={showPasswordChange ? "chevron-up" : "chevron-down"} size={20}
                          color="#6B7280"/>
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
                            <Ionicons name={showCurrentPassword ? "eye-off" : "eye"} size={20}
                                      color="#6B7280"/>
                        </TouchableOpacity>
                    </View>

                    <View className="mb-4 relative">
                        <Text className="text-sm text-primary mb-1.5"
                              weight="semibold">{t('newPassword')}</Text>
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
                            <Ionicons name={showConfirmPassword ? "eye-off" : "eye"} size={20}
                                      color="#6B7280"/>
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
    )
}

export default ChangePasswordSwitcher;