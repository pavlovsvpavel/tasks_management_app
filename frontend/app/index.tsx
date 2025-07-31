import {ScrollView, Image} from "react-native";
import { View, Text } from '@/components/Themed';
import {Link} from "@/components/Themed";
import {images} from "@/constants/images";

export default function Index() {

    return (
        <View className="flex-1 ">
            <ScrollView
                className="flex-1 p-5"
                showsVerticalScrollIndicator={false}
                // contentContainerStyle={{minHeight: "100%", paddingBottom: 10}}
            >
                <Image
                    source={images.logo} className="w-40 h-40 mt-20 mx-auto"
                />
                <View className="flex-1 gap-8">
                    <View className="flex-1 justify-center items-center">
                        <Text className="text-3xl text-dark-200 mt-6" weight="bold">My Tasks</Text>
                        <Text className="text-m text-center text-dark-100 mt-4">
                            Smart task management with powerful features
                        </Text>
                    </View>

                    <View className="flex-1 gap-6">
                        <Link href="/login"
                              className="bg-btn_color text-center text-white px-8 py-4 rounded-lg" weight="bold">
                            Get Started
                        </Link>
                        <Link href="/register"
                              className="bg-gray-200 text-center text-primary px-8 py-4 rounded-lg border border-gray-300" weight="bold">
                            Create Account
                        </Link>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}
