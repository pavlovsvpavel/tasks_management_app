import {Redirect, Tabs} from 'expo-router';
import {Ionicons} from '@expo/vector-icons';
import {TabIconProps} from "@/interfaces/interfaces";
import {useAuth} from "@/contexts/AuthContext";
import {PageLoadingSpinner} from "@/components/PageLoadingSpinner";
import {Text} from '@/components/Themed';
import React from "react";
import {useTranslation} from "react-i18next";
import {useDoubleBackExit} from '@/hooks/useDoubleBackExit';
import ScreenContainer from '@/components/ScreenContainer';


function TabIcon({focused, color, size, name}: TabIconProps) {
    return (
        <Ionicons
            name={name}
            size={focused ? size + 4 : size}
            color={color}
        />
    );
}

function TabsLayout() {
    const {isAuthenticated, isLoading: isAuthLoading} = useAuth();
    const {t} = useTranslation();
    useDoubleBackExit();

    if (isAuthLoading) {
        console.log('TabsLayout: Session loading, showing spinner at', new Date().toISOString());
        return <PageLoadingSpinner/>;
    }

    if (!isAuthenticated) {
        console.log('TabsLayout: Not authenticated, redirecting to /login at', new Date().toISOString());
        return <Redirect href="/login"/>;
    }

    console.log('TabsLayout: Rendering tabs at', new Date().toISOString());

    return (
        <ScreenContainer>
            <Tabs
                screenOptions={{
                    tabBarShowLabel: true,
                    headerShown: false,
                    tabBarActiveTintColor: 'black',
                    tabBarInactiveTintColor: 'white',
                    tabBarStyle: {
                        elevation: 0,
                        borderRadius: 50,
                        backgroundColor: '#3B82F6',
                        height: 60,
                        paddingBottom: 10,
                        paddingTop: 10,
                        marginTop: 15,
                        borderTopWidth: 0,
                    },
                    tabBarItemStyle: {
                        flex: 1,
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center',
                        paddingHorizontal: 4,
                    },
                    tabBarLabel: ({focused, color, children}) => (
                        <Text
                            weight={focused ? 'bold' : 'normal'}
                            style={{color: color, fontSize: 10, marginTop: 2}}
                        >
                            {children}
                        </Text>
                    ),
                }}>
                <Tabs.Screen
                    name="userTasks"
                    options={{
                        title: t('yourTasks'),
                        headerShown: false,
                        tabBarIcon: ({focused, color, size}) => (
                            <TabIcon
                                focused={focused}
                                color={color}
                                size={size}
                                name={focused ? 'checkbox' : 'checkbox-outline'}
                            />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="createTask"
                    options={{
                        title: t('createTask'),
                        headerShown: false,
                        tabBarIcon: ({focused, color, size}) => (
                            <TabIcon
                                focused={focused}
                                color={color}
                                size={size}
                                name={focused ? 'add-circle' : 'add-circle-outline'}
                            />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="profile"
                    options={{
                        title: t('profile'),
                        headerShown: false,
                        tabBarIcon: ({focused, color, size}) => (
                            <TabIcon
                                focused={focused}
                                color={color}
                                size={size}
                                name={focused ? 'person' : 'person-outline'}
                            />
                        ),
                    }}
                />
            </Tabs>
        </ScreenContainer>
    );
}

export default React.memo(TabsLayout);