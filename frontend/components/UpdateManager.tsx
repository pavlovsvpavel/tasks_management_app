import React from 'react';
import {Modal, ActivityIndicator} from 'react-native';
import {View, Text} from '@/components/Themed';
import useGitHubUpdate from '@/hooks/useGitHubUpdate';
import {useTranslation} from "react-i18next";

export default function UpdateManager() {
    const { isDownloading } = useGitHubUpdate();
    const {t} = useTranslation();

    if (!isDownloading) return null;

    return (
        <Modal
            transparent={true}
            animationType="fade"
            visible={isDownloading}
            statusBarTranslucent
        >
            <View className="absolute inset-0 bg-black/60 justify-center items-center z-[10000]">
                <View className="w-[85%] max-w-[340px] bg-card p-6 rounded-2xl items-center shadow-lg shadow-black/80">
                    <Text className="text-primary text-xl mb-6 text-center" weight="bold">
                        {t('update.updatingTitle')}
                    </Text>
                    <View className="items-center mb-6">
                        <ActivityIndicator size="large" color="#3B82F6"/>
                        <Text className="mt-4 text-base text-secondary text-center leading-[22px]">
                            {t('update.downloadingMessage')}
                        </Text>
                    </View>
                    <View
                        className="w-full bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/50 rounded-lg p-3">
                        <Text
                            className="text-xs text-amber-800 dark:text-amber-200 text-center font-medium leading-[18px]">
                            {t('update.warningMessage')}
                        </Text>
                    </View>
                </View>
            </View>
        </Modal>
    );
}