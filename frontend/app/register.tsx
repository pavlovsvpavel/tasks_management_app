import React, {useState} from 'react';
import {TextInput, ScrollView} from 'react-native';
import { View, Text, TouchableOpacity } from '@/components/Themed';
import {router} from 'expo-router';
import { Link } from '@/components/Themed';
import {FontAwesome5, MaterialIcons, Ionicons} from '@expo/vector-icons';
import {registerUser} from "@/services/RegisterService";
import {ButtonSpinner} from "@/components/ButtonSpinner";
import {useAlert} from "@/context/AlertContext";

export default function Register() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);
    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const {showAlert} = useAlert();


    const handleSubmit = async () => {
        setIsRegistering(true);

        try {
            await registerUser(
                formData.full_name,
                formData.email,
                formData.password,
                formData.confirmPassword
            );
            showAlert({
                title: 'Registration successful!',
                message: 'Please log in.',
                buttons: [{text: 'Log In', onPress: () => router.replace('/login')}]
            });


        } catch (error: unknown) {
            showAlert({
                title: 'Error',
                message: error instanceof Error ? error.message : 'Registration failed',
                buttons: [{text: 'Retry', onPress: () => router.replace('/register')}]
            });
        } finally {
            setIsRegistering(false);
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

    const inputClass = "pl-10 w-full border border-gray-300 rounded-lg text-base text-gray-800";

    return (
        <ScrollView
            className="flex-1 py-10 px-5"
            showsVerticalScrollIndicator={false}
            // contentContainerStyle={{minHeight: "100%", paddingBottom: 10}}
        >
            <View className="flex-1 justify-center gap-4 pt-8">
                <View className=" flex-1 justify-center items-center gap-2 mb-8">
                    <Text className="text-xl text-dark-200" weight="bold">Create your account</Text>
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
                        <Text className="ml-4" weight="bold">Sign up with Google</Text>
                    </TouchableOpacity>

                    <Text className="text-center text-gray-500 text-xs uppercase">Or continue with</Text>
                </View>
                <View className="flex-1 justify-center gap-2">
                    <View className="flex-1 justify-center gap-2">
                        <Text className="text-sm" weight="semibold">Full Name</Text>
                        <View className=" flex flex-row items-center gap-6">
                            <Ionicons
                                name="person"
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
                                className={inputClass}
                                placeholderTextColor="#9CA3AF"
                            />
                        </View>
                    </View>
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
                                placeholderTextColor="#9CA3AF"
                            />
                        </View>
                    </View>
                    <View className="flex-1 justify-center gap-2">
                        <Text className="text-sm" weight="semibold">Password</Text>
                        <View className=" flex flex-row items-center gap-6">
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
                    <View className="flex-1 justify-center gap-2">
                        <Text className="text-sm" weight="semibold">Confirm Password</Text>
                        <View className=" flex flex-row items-center gap-6">
                            <Ionicons
                                name="lock-closed"
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
                                className={inputClass}
                                placeholderTextColor="#9CA3AF"
                            />
                            <TouchableOpacity
                                className="absolute right-3 top-3.5"
                                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? (
                                    <Ionicons name="eye-off" size={20}/>
                                ) : (
                                    <Ionicons name="eye" size={20}/>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
                <View className="flex-1 justify-center items-center gap-4">
                    <TouchableOpacity
                        className="w-full bg-btn_color rounded-lg p-3 items-center justify-center"
                        onPress={handleSubmit}
                        disabled={isRegistering}
                    >
                        {isRegistering ? (
                            <ButtonSpinner/>
                        ) : (
                            <Text className="text-white" weight="semibold">Create Account</Text>
                        )}
                    </TouchableOpacity>
                    <Text className="text-sm text-gray-500">
                        Already have an account?{' '}
                        <Link href="/login"
                              className="text-blue-500" weight="semibold">
                            Sign in
                        </Link>
                    </Text>
                </View>
            </View>
        </ScrollView>
    );
}