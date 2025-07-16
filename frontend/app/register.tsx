import React, {useState} from 'react';
import {View, Text, TextInput, TouchableOpacity, ActivityIndicator, ScrollView, Alert} from 'react-native';
import {Link, router} from 'expo-router';
import {FontAwesome5, AntDesign, Feather, MaterialIcons} from '@expo/vector-icons';
import {useSession} from '@/context/ctx';
import {loginAfterRegister, registerUser} from "@/utils/api";


export default function Register() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });


    const { signIn } = useSession();

    const handleSubmit = async () => {
        setIsLoading(true);

        try {
            await registerUser(
                formData.full_name,
                formData.email,
                formData.password,
                formData.confirmPassword
            );

            // Auto-login after successful registration
            const loginData = await loginAfterRegister(formData.email, formData.password);
            signIn(loginData.tokens.access_token);

        } catch (error: unknown) {
            Alert.alert(
                'Error',
                error instanceof Error ? error.message : 'Registration failed'
            );
        } finally {
            setIsLoading(false);
        }

    };

    const handleGoogleSignUp = async () => {
        try {
            // TODO: Implement Google OAuth
            console.log("Google login attempt");

            alert("Google OAuth integration coming soon!");
        } catch (error) {
            alert("Google login failed. Please try again later.");
        }
    };

    return (
        <ScrollView
            className="flex-1 py-10 px-5"
            showsVerticalScrollIndicator={false}
            // contentContainerStyle={{minHeight: "100%", paddingBottom: 10}}
        >
            <TouchableOpacity
                onPress={() => router.back()}
                className="p-2 -ml-2"
            >
                <AntDesign name="leftcircle" size={24} style={{color: '#3B82F6'}}/>
            </TouchableOpacity>
            <View className="flex-1 justify-center gap-4">
                <View className=" flex-1 justify-center items-center gap-2 mb-8">
                    <Text className="text-xl font-semibold text-dark-200">Create your account</Text>
                    <Text className="text-sm text-dark-100">
                        Join and start organizing your tasks
                    </Text>
                </View>
                <View className="flex-1 justify-center items-center gap-6">
                    <TouchableOpacity
                        className="w-full border border-gray-300 rounded-lg px-8 py-3 flex-row items-center justify-center"
                        onPress={handleGoogleSignUp}
                    >
                        <FontAwesome5 name="google" size={24} color="#4285F4"/>
                        <Text className="font-bold ml-4">Sign up with Google</Text>
                    </TouchableOpacity>

                    <Text className="text-center text-gray-500 text-xs uppercase">Or continue with</Text>
                </View>
                <View className="flex-1 justify-center gap-2">
                    <View className="flex-1 justify-center gap-2">
                        <Text className="text-sm font-medium">Full Name</Text>
                        <View className=" flex flex-row items-center gap-6">
                            <AntDesign
                                name="user"
                                size={20}
                                color="#9CA3AF"
                                className="absolute left-3 top-3.5 z-10"
                            />
                            <TextInput
                                id="full_name"
                                keyboardType="email-address"
                                value={formData.full_name}
                                onChangeText={(text) => setFormData(prev => ({...prev, full_name: text}))}
                                placeholder="Enter your full name"
                                className="pl-10 w-full border border-gray-300 rounded-lg p-3"
                            />
                        </View>
                    </View>
                    <View className="flex-1 justify-center gap-2">
                        <Text className="text-sm font-medium">Email</Text>
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
                                className="pl-10 w-full border border-gray-300 rounded-lg p-3"
                            />
                        </View>
                    </View>
                    <View className="flex-1 justify-center gap-2">
                        <Text className="text-sm font-medium">Password</Text>
                        <View className=" flex flex-row items-center gap-6">
                            <Feather
                                name="lock"
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
                                className="pl-10 pr-10 w-full border border-gray-300 rounded-lg p-3"
                            />
                            <TouchableOpacity
                                className="absolute right-3 top-3.5"
                                onPress={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <Feather name="eye-off" size={20}/>
                                ) : (
                                    <Feather name="eye" size={20}/>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View className="flex-1 justify-center gap-2">
                        <Text className="text-sm font-medium">Confirm Password</Text>
                        <View className=" flex flex-row items-center gap-6">
                            <Feather
                                name="lock"
                                size={20}
                                color="#9CA3AF"
                                className="absolute left-3 top-3.5 z-10"
                            />
                            <TextInput
                                id="confirm_password"
                                secureTextEntry={!showConfirmPassword}
                                value={formData.confirmPassword}
                                onChangeText={(text) => setFormData(prev => ({...prev, confirmPassword: text}))}
                                placeholder="Confirm your password"
                                className="pl-10 pr-10 w-full border border-gray-300 rounded-lg p-3"
                            />
                            <TouchableOpacity
                                className="absolute right-3 top-3.5"
                                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? (
                                    <Feather name="eye-off" size={20}/>
                                ) : (
                                    <Feather name="eye" size={20}/>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
                <View className="flex-1 justify-center items-center gap-4">
                    <TouchableOpacity
                        className="w-full bg-btn_color rounded-lg p-3 items-center justify-center"
                        onPress={handleSubmit}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="white"/>
                        ) : (
                            <Text className="text-white font-medium">Create Account</Text>
                        )}
                    </TouchableOpacity>
                    <Text className="text-sm text-gray-500">
                        Already have an account?{' '}
                        <Link href="/login" className="text-blue-500 font-medium">
                            Sign in
                        </Link>
                    </Text>
                </View>
            </View>
        </ScrollView>
    );
}