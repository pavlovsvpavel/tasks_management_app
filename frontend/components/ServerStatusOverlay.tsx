import React, {useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from "react-native";
import {useServerStatus} from "@/context/ServerStatusContext";
import {useRetry} from "@/context/RetryContext";
import {ButtonSpinner} from "@/components/ButtonSpinner";

export default function ServerStatusOverlay() {
    const {isServerDown, checkHealth} = useServerStatus();
    const {triggerRetry} = useRetry();
    const [isRetrying, setIsRetrying] = useState(false);

    if (!isServerDown) return null;

    const handleRetry = async () => {
        setIsRetrying(true);
        const isServerNowUp = await checkHealth();
        if (isServerNowUp) {
            triggerRetry();
        }
        setIsRetrying(false);
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Service Unavailable</Text>
                <Text style={styles.message}>
                    Our services are temporarily down. Please try again later.
                </Text>
                <TouchableOpacity
                    style={styles.button}
                    onPress={handleRetry}
                    disabled={isRetrying}
                >
                    {isRetrying ? (
                        <ButtonSpinner/>
                    ) : (
                        <Text style={styles.buttonText}>Retry Connection</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
    },
    content: {
        width: '80%',
        backgroundColor: '#2c2c2c',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#444'
    },
    title: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    message: {
        color: '#DDDDDD',
        textAlign: 'center',
        marginBottom: 20,
    },
    button: {
        backgroundColor: '#007AFF',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        minWidth: 150,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
    },
});