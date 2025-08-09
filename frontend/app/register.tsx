import {useState} from 'react';
import {ScrollView} from 'react-native';
import {View, Text, TouchableOpacity, TextInput} from '@/components/Themed';
import {router} from 'expo-router';
import {Link} from '@/components/Themed';
import {MaterialIcons, Ionicons} from '@expo/vector-icons';
import {ButtonSpinner} from "@/components/ButtonSpinner";
import {useAlert} from "@/contexts/AlertContext";
import {useApiClient} from "@/hooks/useApiClient";
import {ValidationError} from "@/utils/errors";
import {useTranslation} from "react-i18next";
import CustomScreenContainer from '@/components/CustomScreenContainer';

export default function Register() {
    const [isRegistering, setIsRegistering] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const {showAlert} = useAlert();
    const {apiClient} = useApiClient();
    const {t} = useTranslation();

    const handleSubmit = async () => {
        const {full_name, email, password, confirmPassword} = formData;
        if (!full_name.trim() || !email.trim() || !password || !confirmPassword) {
            showAlert({
                title: 'Missing Information',
                message: 'Please fill out all fields.',
                buttons: [{text: 'OK'}],
            });
            return;
        }

        if (password.length < 8) {
            showAlert({
                title: 'Password length',
                message: 'Password must be at least 8 characters',
                buttons: [{text: 'OK'}],
            });
            return
        }

        if (password !== confirmPassword) {
            showAlert({
                title: 'Password Mismatch',
                message: 'The passwords you entered do not match.',
                buttons: [{text: 'OK'}],
            });
            return;
        }

        setIsRegistering(true);

        try {
            const requestBody = {
                full_name: full_name.trim(),
                email: email.trim(),
                password: password,
            };

            await apiClient('/users/register', {
                method: 'POST',
                body: JSON.stringify(requestBody),
            });

            showAlert({
                title: 'Registration Successful!',
                message: 'Your account has been created. Please log in to continue.',
                buttons: [{text: 'Go to Login', onPress: () => router.replace('/login')}]
            });

        } catch (error: any) {
            let alertMessage = 'An unexpected error occurred. Please try again.';

            if (error instanceof ValidationError) {
                alertMessage = error.body?.detail || 'Registration failed. Please check your details.';
            } else if (error instanceof Error) {
                alertMessage = error.message;
            }

            showAlert({
                title: 'Registration Failed',
                message: alertMessage,
                buttons: [{text: 'Retry'}]
            });
        } finally {
            setIsRegistering(false);
        }
    };

    const inputClass = "input-default border-default text-primary h-[50px] pl-10 w-full focus:border-blue-500 focus:ring-blue-500";
    const iconsClass = "absolute left-3 top-4.5 z-10";

    return (
        <CustomScreenContainer>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{paddingVertical: 30, flexGrow: 0}}
            >
                <View className="justify-center gap-4">
                    <View className="justify-center items-center gap-2 mb-8">
                        <Text className="text-xl text-primary" weight="bold">{t('registerPage.pageHeader')}</Text>
                        <Text className="text-sm text-primary">
                            {t('registerPage.pageSubHeader')}
                        </Text>
                    </View>
                    <View className="flex-1 justify-center gap-6">
                        <View className="justify-center gap-2">
                            <Text className="text-sm text-primary" weight="semibold">{t('fullName')}</Text>
                            <View className=" flex flex-row items-center gap-6">
                                <Ionicons
                                    name="person"
                                    size={20}
                                    color="#9CA3AF"
                                    className={iconsClass}
                                />
                                <TextInput
                                    id="full_name"
                                    keyboardType="email-address"
                                    value={formData.full_name}
                                    onChangeText={(text) => setFormData(prev => ({...prev, full_name: text}))}
                                    placeholder={t('fullNamePlaceholder')}
                                    className={inputClass}
                                    placeholderTextColor="#9CA3AF"
                                />
                            </View>
                        </View>
                        <View className="justify-center gap-2">
                            <Text className="text-sm text-primary" weight="semibold">{t('email')}</Text>
                            <View className=" flex flex-row items-center gap-6">
                                <MaterialIcons
                                    name="email"
                                    size={20}
                                    color="#9CA3AF"
                                    className={iconsClass}
                                />
                                <TextInput
                                    id="email"
                                    keyboardType="email-address"
                                    value={formData.email}
                                    onChangeText={(text) => setFormData(prev => ({...prev, email: text}))}
                                    placeholder={t('emailPlaceholder')}
                                    className={inputClass}
                                    placeholderTextColor="#9CA3AF"
                                />
                            </View>
                        </View>
                        <View className="justify-center gap-2">
                            <Text className="text-sm text-primary" weight="semibold">{t('password')}</Text>
                            <View className=" flex flex-row items-center gap-6">
                                <Ionicons
                                    name="lock-closed"
                                    size={20}
                                    color="#9CA3AF"
                                    className={iconsClass}
                                />
                                <TextInput
                                    id="password"
                                    secureTextEntry={!showPassword}
                                    value={formData.password}
                                    onChangeText={(text) => setFormData(prev => ({...prev, password: text}))}
                                    placeholder={t('passwordPlaceholder')}
                                    className={inputClass}
                                    placeholderTextColor="#9CA3AF"
                                />
                                <TouchableOpacity
                                    className="absolute right-3 top-4.5 z-10"
                                    onPress={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <Ionicons name="eye-off" size={20} color={'#ccc'}/>
                                    ) : (
                                        <Ionicons name="eye" size={20} color={'#ccc'}/>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View className="justify-center gap-2">
                            <Text className="text-sm text-primary" weight="semibold">{t('confirmPassword')}</Text>
                            <View className=" flex flex-row items-center gap-6">
                                <Ionicons
                                    name="lock-closed"
                                    size={20}
                                    color="#9CA3AF"
                                    className={iconsClass}
                                />
                                <TextInput
                                    id="confirm_password"
                                    secureTextEntry={!showConfirmPassword}
                                    value={formData.confirmPassword}
                                    onChangeText={(text) => setFormData(prev => ({...prev, confirmPassword: text}))}
                                    placeholder={t('confirmPasswordPlaceholder')}
                                    className={inputClass}
                                    placeholderTextColor="#9CA3AF"
                                />
                                <TouchableOpacity
                                    className="absolute right-3 top-4.5"
                                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? (
                                        <Ionicons name="eye-off" size={20} color={'#ccc'}/>
                                    ) : (
                                        <Ionicons name="eye" size={20} color={'#ccc'}/>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                    <View className="flex-1 justify-center items-center gap-4">
                        <TouchableOpacity
                            className="w-full btn-primary mt-8"
                            onPress={handleSubmit}
                            disabled={isRegistering}
                        >
                            {isRegistering ? (
                                <ButtonSpinner/>
                            ) : (
                                <Text className="text-lg text-white" weight="semibold">{t('registerPage.signUpButton')}</Text>
                            )}
                        </TouchableOpacity>
                        <Text className="text-lg text-primary">
                            {t('registerPage.haveAccount')}{' '}
                            <Link href="/login"
                                  className="text-blue-500" weight="semibold">
                                {t('registerPage.signInLink')}
                            </Link>
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </CustomScreenContainer>
    );
}