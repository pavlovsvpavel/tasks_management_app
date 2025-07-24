import {useState} from 'react';
import {TextInput, ScrollView} from 'react-native';
import { View, Text, TouchableOpacity } from '@/components/Themed';
import {router} from 'expo-router';
import { Link } from '@/components/Themed';
import {FontAwesome5, MaterialIcons, Ionicons} from '@expo/vector-icons';
import {useAuth} from '@/context/AuthContext';
import {loginUser} from "@/services/LoginService";
import {ButtonSpinner} from "@/components/ButtonSpinner";
import {useAlert} from "@/context/AlertContext";


export default function Login() {
    const {setTokens} = useAuth();
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });
    const {showAlert} = useAlert();


    const handleSubmit = async () => {
        setIsLoggingIn(true);
        try {
            const {accessToken, refreshToken} = await loginUser(
                formData.email,
                formData.password
            );
            await setTokens({accessToken, refreshToken, isRefreshed: false});
            router.replace('/userTasks');
        } catch (error: unknown) {
            showAlert({
                title: 'Error',
                message: error instanceof Error ? error.message : 'Login failed',
                buttons: [{text: 'Retry', onPress: () => router.replace('/login')}]
            });
        } finally {
            setIsLoggingIn(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            // TODO: Implement Google OAuth
            console.log("Google login attempt");

            alert("Google OAuth integration coming soon!");
        } catch (error) {
            alert("Google login failed. Please try again later.");
        }
    };

    const inputClass = "pl-10 w-full border border-gray-300 rounded-lg";

    return (
        <ScrollView
            className="flex-1 py-10 px-5"
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
                        <Text className="ml-4" weight="bold">Continue with Google</Text>
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
                                value={formData.email}
                                onChangeText={(text) => setFormData(prev => ({...prev, email: text}))}
                                placeholder="Enter your email"
                                className={inputClass}
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
                                value={formData.password}
                                onChangeText={(text) => setFormData(prev => ({...prev, password: text}))}
                                placeholder="Enter your password"
                                className={inputClass}
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
    );
}