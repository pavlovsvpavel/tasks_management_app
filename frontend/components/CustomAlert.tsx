import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, ActivityIndicator} from "react-native";
import {Ionicons} from '@expo/vector-icons';
import {CustomAlertProps} from "@/interfaces/interfaces";


export interface AlertButton {
    text: string;
    onPress?: () => void;
    style?: 'default' | 'cancel' | 'destructive';
}


export default function CustomAlert({isVisible, title, message, buttons}: CustomAlertProps) {
    if (!isVisible) return null;

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Ionicons name="information-circle-outline" size={48} color="#007AFF" style={{marginBottom: 12}}/>
                <Text style={styles.title}>{title}</Text>
                {message && <Text style={styles.message}>{message}</Text>}

                <View style={styles.buttonContainer}>
                    {buttons.map((button, index) => {
                        let buttonStyle = styles.button;
                        let textStyle = styles.buttonText;

                        if (button.style === 'destructive') {
                            buttonStyle = {...buttonStyle, ...styles.destructiveButton};
                            textStyle = {...textStyle, ...styles.destructiveButtonText};
                        } else if (button.style === 'cancel') {
                            buttonStyle = {...buttonStyle, ...styles.cancelButton};
                            textStyle = {...textStyle, ...styles.cancelButtonText};
                        }

                        return (
                            <TouchableOpacity
                                key={index}
                                style={[buttonStyle, {flex: 1}]}
                                onPress={button.onPress}
                            >
                                <Text style={textStyle}>{button.text}</Text>
                            </TouchableOpacity>
                        )
                    })}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10000,
    },
    content: {
        width: '85%',
        maxWidth: 340,
        backgroundColor: '#FFFFFF',
        padding: 24,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    title: {
        color: '#111827',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    message: {
        color: '#4B5563',
        textAlign: 'center',
        marginBottom: 24,
        fontSize: 16,
        lineHeight: 22,
    },
    buttonContainer: {
        flexDirection: 'row',
        width: '100%',
        gap: 10, // Adds space between buttons
    },
    button: {
        backgroundColor: '#007AFF',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    destructiveButton: {
        backgroundColor: '#FF3B30',
    },
    destructiveButtonText: {
        color: 'white',
    },
    cancelButton: {
        backgroundColor: '#E5E7EB',
    },
    cancelButtonText: {
        color: '#1F2937',
    }
});