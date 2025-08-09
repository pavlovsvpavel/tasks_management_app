import {Pressable, Image} from "react-native";
import {View, Text} from '@/components/Themed';
import {useTranslation} from "react-i18next";

export default function SignInWithGoogleButton({
                                                   onPress,
                                                   disabled,
                                               }: {
    onPress: () => void;
    disabled?: boolean;
}) {

    const {t} = useTranslation();
    return (
        <Pressable onPress={onPress} disabled={disabled}>
            <View
                style={{
                    width: "100%",
                    height: 44,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 8,
                    backgroundColor: "#fff",
                    borderWidth: 1,
                    borderColor: "#ccc",
                }}
            >
                <Image
                    source={require("../assets/images/google-icon.png")}
                    style={{
                        width: 18,
                        height: 18,
                        marginRight: 6,
                    }}
                />
                <Text className="text-lg text-black">
                    {t('indexPage.googleButton')}
                </Text>
            </View>
        </Pressable>
    );
}