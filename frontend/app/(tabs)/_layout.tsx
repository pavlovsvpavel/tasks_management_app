import {Tabs} from "expo-router";
import {ImageBackground, Image, Text, View} from "react-native";

import {icons} from "@/constants/icons";
import {images} from "@/constants/images";

function TabIcon({focused, icon, title}: any) {
    if (focused) {
        return (
            //     <ImageBackground
            //         source={images.highlight}
            //         className="flex flex-row w-full flex-1 min-w-[112px] min-h-16 mt-6 justify-center items-center rounded-full overflow-hidden"
            //     >
            //         <Image source={icon} tintColor="#151312" className="size-5"/>
            //         <Text className="text-secondary text-base font-semibold ml-2">
            //             {title}
            //         </Text>
            //     </ImageBackground>
            // );
            <View
                className="flex flex-row w-full flex-1 min-w-[112px] min-h-16 mt-6 justify-center items-center rounded-full overflow-hidden"
            >
                <Image source={icon} tintColor="#151312" className="size-5"/>
                <Text className="text-secondary text-base font-semibold ml-2">
                    {title}
                </Text>
            </View>
        );
    }

    return (
        <View className="size-full justify-center items-center mt-4 rounded-full">
            <Image source={icon} tintColor="white" className="size-5"/>
        </View>
    );
}

export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={{
                tabBarShowLabel: false,
                tabBarItemStyle: {
                    width: "100%",
                    height: "100%",
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: 20,
                },
                tabBarStyle: {
                    backgroundColor: "#3B82F6",
                    borderRadius: 100,
                    marginHorizontal: 15,
                    marginBottom: 50,
                    height: 50,
                    position: "absolute",
                    overflow: "hidden",

                },
            }}
        >
            <Tabs.Screen
                name="user_tasks"
                options={{
                    title: "My Tasks",
                    headerShown: false,
                    tabBarIcon: ({focused}) => (
                        <TabIcon focused={focused} icon={icons.checklist} title="My Tasks"/>
                    ),
                }}
            />

            <Tabs.Screen
                name="profile"
                options={{
                    title: "Profile",
                    headerShown: false,
                    tabBarIcon: ({focused}) => (
                        <TabIcon focused={focused} icon={icons.person} title="Profile"/>
                    ),
                }}
            />
        </Tabs>
    );
}