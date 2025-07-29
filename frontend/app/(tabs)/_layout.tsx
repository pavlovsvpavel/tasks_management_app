import {Redirect, Tabs} from 'expo-router';
import {Ionicons} from '@expo/vector-icons';
import {TabIconProps} from "@/interfaces/interfaces";
import {SafeAreaView} from 'react-native-safe-area-context';
import {useAuth} from "@/context/AuthContext";
import {PageLoadingSpinner} from "@/components/PageLoadingSpinner";


function TabIcon({focused, color, size, name}: TabIconProps) {
    return (
        <Ionicons
            name={name}
            size={focused ? size + 4 : size}
            color={color}
        />
    );
}

export default function TabsLayout() {
    const {isAuthenticated, isLoading: isAuthLoading} = useAuth();

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
        <SafeAreaView
            edges={['top', 'left', 'right', 'bottom']}
            className="flex-1 px-5">
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

                    },
                    tabBarItemStyle: {
                        flex: 1,
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center',
                        paddingHorizontal: 4,
                    },
                }}>
                <Tabs.Screen
                    name="userTasks"
                    options={{
                        title: 'Tasks',
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
                        title: 'Create Task',
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
                        title: 'Profile',
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
        </SafeAreaView>
    );

}