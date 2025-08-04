import {ScrollView, Image} from "react-native";
import {View, Text} from '@/components/Themed';
import {Link} from "@/components/Themed";
import {images} from "@/constants/images";
import {useTranslation} from "react-i18next";


export default function Index() {
    const {t} = useTranslation();

    return (
        <View className="flex-1 bg-bgnd">
            <ScrollView
                className="p-5"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingVertical: 30, flexGrow: 1 }}
            >
                <Image
                    source={images.logo} className="w-28 h-28 mt-20 mx-auto"
                />
                <View className="gap-8">
                    <View className="justify-center items-center">
                        <Text className="text-3xl text-primary mt-6" weight="bold">{t('indexPage.appName')}</Text>
                        <Text className="text-m text-center text-primary mt-4">
                            {t('indexPage.appHeader')}
                        </Text>
                    </View>

                    <View className="gap-8">
                        <Link href="/login"
                              className="bg-blue-500 text-center text-white px-8 py-4 rounded-lg" weight="bold">
                            {t('indexPage.signInButton')}
                        </Link>
                        <Link href="/register"
                              className="bg-white text-center text-black px-8 py-4 rounded-lg" weight="bold">
                            {t('indexPage.signUpButton')}
                        </Link>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}
