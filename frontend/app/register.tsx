import {useState} from 'react';
import {ScrollView} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {View, Text, TouchableOpacity, TextInput} from '@/components/Themed';
import {router} from 'expo-router';
import {Link} from '@/components/Themed';
import {FontAwesome5, MaterialIcons, Ionicons} from '@expo/vector-icons';
import {ButtonSpinner} from "@/components/ButtonSpinner";
import {useAlert} from "@/context/AlertContext";
import {useApiClient} from "@/hooks/useApiClient";
import {ValidationError} from "@/utils/errors";

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

    const handleGoogleSignUp = async () => {
        showAlert({
            title: "Coming Soon",
            message: "Google Sign-Up will be available in a future update!",
            buttons: [{text: "Got it!"}],
        });
    };

    const inputClass = "pl-10 w-full border border-gray-300 rounded-lg text-base text-gray-800";

    return (
        <SafeAreaView
            edges={['top', 'left', 'right', 'bottom']}
            className="flex-1">
            <ScrollView
                className="flex-1 py-10 px-5"
                showsVerticalScrollIndicator={false}
                // contentContainerStyle={{minHeight: "100%", paddingBottom: 10}}
            >
                <View className="flex-1 justify-center gap-4">
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
        </SafeAreaView>
    );
}