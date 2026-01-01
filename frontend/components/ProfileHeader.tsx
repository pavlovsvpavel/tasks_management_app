import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from "@expo/vector-icons";

type Props = {
    pictureUrl: string | null;
    fullName: string;
    email: string;
    onUpload: () => void;
    disabled: boolean;
};

export const ProfileHeader = ({ pictureUrl, fullName, email, onUpload, disabled }: Props) => (
    <View className="bg-card rounded-xl p-5 mb-5 items-center">
        <View className="relative mb-4">
            <View className="w-20 h-20 rounded-full border-2 border-default items-center justify-center overflow-hidden">
                {pictureUrl ? (
                    <Image source={{ uri: pictureUrl }} className="w-full h-full" />
                ) : (
                    <Ionicons name="person" size={40} color="#6B7280" />
                )}
            </View>
            <TouchableOpacity
                className="absolute bottom-0 right-0 bg-white rounded-xl w-6 h-6 items-center justify-center"
                onPress={onUpload}
                disabled={disabled}
            >
                <Ionicons name="camera" size={16} color="#3B82F6" />
            </TouchableOpacity>
        </View>
        <View className="items-center">
            <Text className="text-xl text-primary mb-1 font-bold">{fullName}</Text>
            <Text className="text-base text-secondary">{email}</Text>
        </View>
    </View>
);