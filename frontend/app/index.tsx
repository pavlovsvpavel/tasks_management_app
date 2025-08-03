import {ScrollView, Image} from "react-native";
import {View, Text} from '@/components/Themed';
import {Link} from "@/components/Themed";
import {images} from "@/constants/images";


export default function Index() {

    return (
        <View className="flex-1 bg-bgnd">
            <ScrollView
                className="flex-1 p-5"
                showsVerticalScrollIndicator={false}
            >
                <Image
                    source={images.logo} className="w-28 h-28 mt-20 mx-auto"
                />
                <View className="flex-1 gap-8">
                    <View className="flex-1 justify-center items-center">
                        <Text className="text-3xl text-primary mt-6" weight="bold">My Tasks</Text>
                        <Text className="text-m text-center text-primary mt-4">
                            Smart task management with powerful features
                        </Text>
                    </View>

                    <View className="flex-1 gap-6">
                        <Link href="/login"
                              className="bg-blue-500 text-center text-white px-8 py-4 rounded-lg" weight="bold">
                            Get Started
                        </Link>
                        <Link href="/register"
                              className="bg-white text-center text-black px-8 py-4 rounded-lg" weight="bold">
                            Create Account
                        </Link>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}
