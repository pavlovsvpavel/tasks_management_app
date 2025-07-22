import {View, Text, StyleSheet, TouchableOpacity} from "react-native";
import {router} from "expo-router";
import {useState} from "react";

export default function SessionStatusOverlay() {
    const [isVisible, setIsVisible] = useState(true);

    if (!isVisible) return null;

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Session Expired</Text>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => {
                        setIsVisible(false);
                        router.replace('/login');
                    }}
                >
                    <Text style={styles.buttonText}>Login</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
    },
    content: {
        width: '80%',
        backgroundColor: '#1e1e1e',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
    },
    title: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    message: {
        color: 'white',
        textAlign: 'center',
        marginBottom: 20,
    },
    button: {
        backgroundColor: '#0066cc',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
    },
});