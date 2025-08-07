import {useState} from 'react';
import {ScrollView} from 'react-native';
import {View, Text, TouchableOpacity, TextInput} from '@/components/Themed';
import {Link} from '@/components/Themed';
import {MaterialIcons, Ionicons} from '@expo/vector-icons';
import {useAuth} from '@/contexts/AuthContext';
import {ValidationError} from '@/utils/errors';
import {ButtonSpinner} from "@/components/ButtonSpinner";
import {useAlert} from "@/contexts/AlertContext";
import {useApiClient} from "@/hooks/useApiClient";
import {useTranslation} from "react-i18next";
import CustomScreenContainer from '@/components/CustomScreenContainer';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const {setTokens} = useAuth();
    const {apiClient} = useApiClient();
    const {showAlert} = useAlert();
    const {t} = useTranslation();

    const handleSubmit = async () => {
        if (!email.trim() || !password) {
            showAlert({
                title: 'Missing Information',
                message: 'Email and password are required.',
                buttons: [{text: 'OK'}],
            });
            return;
        }
        setIsLoggingIn(true);
        const formData = new FormData();
        formData.append('username', email);
        formData.append('password', password);
        try {
            const response = await apiClient('/users/login', {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();
            const tokenPair = {
                accessToken: data.tokens.access_token,
                refreshToken: data.tokens.refresh_token,
                isRefreshed: false,
            };

            await setTokens(tokenPair);
        } catch (error: any) {
            let alertMessage = 'An unexpected error occurred. Please try again.';

            if (error instanceof ValidationError) {
                alertMessage = error.body?.detail || 'Invalid credentials. Please try again.';
            } else if (error instanceof Error) {
                alertMessage = error.message;
            }

            showAlert({
                title: 'Login Failed',
                message: alertMessage,
                buttons: [{text: 'OK'}],
            });
        } finally {
            setIsLoggingIn(false);
        }
    };

    const inputClass = "input-default border-default text-primary pl-10 w-full focus:border-blue-500 focus:ring-blue-500";

    return (
        <CustomScreenContainer>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{paddingVertical: 30, flexGrow: 1}}
            >
                <View className="flex-1 justify-center gap-4">
                    <View className="justify-center items-center gap-2 mb-8">
                        <Text className="text-xl text-primary" weight="bold">{t('loginPage.pageHeader')}</Text>
                        <Text className="text-sm text-primary">
                            {t('loginPage.pageSubHeader')}
                        </Text>
                    </View>
                    <View className="justify-center gap-6">
                        <View className="justify-center gap-2">
                            <Text className="text-sm text-primary" weight="semibold">{t('email')}</Text>
                            <View className=" flex flex-row items-center gap-6">
                                <MaterialIcons
                                    name="email"
                                    size={20}
                                    color="#9CA3AF"
                                    className="absolute left-3 top-3.5 z-10"
                                />
                                <TextInput
                                    id="email"
                                    keyboardType="email-address"
                                    value={email}
                                    onChangeText={setEmail}
                                    placeholder={t('emailPlaceholder')}
                                    className={inputClass}
                                    placeholderTextColor="#9CA3AF"
                                />
                            </View>
                        </View>
                        <View className="justify-center gap-2">
                            <Text className="text-sm text-primary" weight="semibold">{t('password')}</Text>
                            <View className="flex flex-row items-center gap-6">
                                <Ionicons
                                    name="lock-closed"
                                    size={20}
                                    color="#9CA3AF"
                                    className="absolute left-3 top-3.5 z-10"
                                />
                                <TextInput
                                    id="password"
                                    secureTextEntry={!showPassword}
                                    value={password}
                                    onChangeText={setPassword}
                                    placeholder={t('passwordPlaceholder')}
                                    className={inputClass}
                                    placeholderTextColor="#9CA3AF"
                                />
                                <TouchableOpacity
                                    className="absolute right-3 top-3.5"
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
                        {/*<View className="self-end mt-2">*/}
                        {/*    <Link href="/password/forgotPassword"*/}
                        {/*          className="text-blue-500 text-sm" weight="semibold">*/}
                        {/*        Forgot password?*/}
                        {/*    </Link>*/}
                        {/*</View>*/}
                    </View>
                    <View className="justify-center items-center gap-4">
                        <TouchableOpacity
                            className="w-full btn-primary mt-8"
                            onPress={handleSubmit}
                            disabled={isLoggingIn}
                        >
                            {isLoggingIn ? (
                                <ButtonSpinner/>
                            ) : (
                                <Text className="text-white" weight="semibold">{t('loginPage.signInButton')}</Text>
                            )}
                        </TouchableOpacity>
                        <Text className="text-sm text-primary">
                            {t('loginPage.dontHaveAccount')}{' '}
                            <Link href="/register" className="text-blue-500" weight="semibold">
                                {t('loginPage.signUpLink')}
                            </Link>
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </CustomScreenContainer>
    );
}