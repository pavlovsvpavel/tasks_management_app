import {useState} from 'react';
import {ScrollView} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {View, Text, TouchableOpacity, TextInput} from '@/components/Themed';
import {Link} from '@/components/Themed';
import {FontAwesome5, MaterialIcons, Ionicons} from '@expo/vector-icons';
import {useAuth} from '@/context/AuthContext';
import {ValidationError} from '@/utils/errors';
import {ButtonSpinner} from "@/components/ButtonSpinner";
import {useAlert} from "@/context/AlertContext";
import {useApiClient} from "@/hooks/useApiClient";


export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const {setTokens} = useAuth();
    const {apiClient} = useApiClient();
    const {showAlert} = useAlert();

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

    const handleGoogleLogin = async () => {
        console.log("Google login attempt");

        showAlert({
            title: "Coming Soon",
            message: "Google Sign-In will be available in a future update!",
            buttons: [{text: "Got it!"}],
        });
    };

    const inputClass = "pl-10 w-full border border-gray-300 rounded-lg text-base text-gray-800";

    return (
        <SafeAreaView
            edges={['top', 'left', 'right', 'bottom']}
            className="flex-1"
        >
            <ScrollView
                className="flex-1 py-12 px-5"
                showsVerticalScrollIndicator={false}
                // contentContainerStyle={{minHeight: "100%", paddingBottom: 10}}
            >
                <View className="flex-1 justify-center gap-4">
                    <View className=" flex-1 justify-center items-center gap-2 mb-8">
                        <Text className="text-xl text-dark-200" weight="bold">Welcome back</Text>
                        <Text className="text-sm text-dark-100">
                            Sign in to your account to continue
                        </Text>
                    </View>
                    <View className="flex-1 justify-center items-center gap-6">
                        <TouchableOpacity
                            className="w-full border border-gray-300 rounded-lg px-8 py-3 flex-row items-center justify-center"
                            onPress={handleGoogleLogin}
                        >
                            <FontAwesome5 name="google" size={24} color="#4285F4"/>
                            <Text className="ml-4" weight="bold">Sign in with Google</Text>
                        </TouchableOpacity>

                        <Text className="text-center text-gray-500 text-xs uppercase">Or continue with</Text>
                    </View>
                    <View className="flex-1 justify-center gap-2">
                        <View className="flex-1 justify-center gap-2">
                            <Text className="text-sm" weight="semibold">Email</Text>
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
                                    placeholder="Enter your email"
                                    className={inputClass}
                                    placeholderTextColor="#9CA3AF"
                                />
                            </View>
                        </View>
                        <View className="flex-1 justify-center gap-2">
                            <Text className="text-sm" weight="semibold">Password</Text>
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
                                    placeholder="Enter your password"
                                    className={inputClass}
                                    placeholderTextColor="#9CA3AF"
                                />
                                <TouchableOpacity
                                    className="absolute right-3 top-3.5"
                                    onPress={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <Ionicons name="eye-off" size={20}/>
                                    ) : (
                                        <Ionicons name="eye" size={20}/>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View className="self-end mt-2">
                            <Link href="/password/forgotPassword"
                                  className="text-blue-500 text-sm" weight="semibold">
                                Forgot password?
                            </Link>
                        </View>
                    </View>
                    <View className="flex-1 justify-center items-center gap-4">
                        <TouchableOpacity
                            className="w-full bg-btn_color rounded-lg p-3 items-center justify-center"
                            onPress={handleSubmit}
                            disabled={isLoggingIn}
                        >
                            {isLoggingIn ? (
                                <ButtonSpinner/>
                            ) : (
                                <Text className="text-white" weight="semibold">Sign In</Text>
                            )}
                        </TouchableOpacity>
                        <Text className="text-sm text-gray-500">
                            Don't have an account?{' '}
                            <Link href="/register" className="text-blue-500" weight="semibold">
                                Sign up
                            </Link>
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}