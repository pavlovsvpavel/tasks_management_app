import {useState, useEffect} from 'react';
import {Platform} from 'react-native';
// @ts-ignore: Types might be missing for legacy, but the code exists.
import * as FileSystem from 'expo-file-system/legacy';
import * as IntentLauncher from 'expo-intent-launcher';
import * as Application from 'expo-application';
import {useAlert} from "@/contexts/AlertContext";
import {useTranslation} from "react-i18next";

const GITHUB_OWNER = "pavlovsvpavel";
const GITHUB_REPO = "tasks_management_app";
const PACKAGE_NAME = "com.ppsoft.tasksapp";

interface GitHubRelease {
    tag_name: string;
    assets: { browser_download_url: string }[];
}

const useGitHubUpdate = () => {
    const [isDownloading, setIsDownloading] = useState<boolean>(false);
    const {showAlert} = useAlert();
    const {t} = useTranslation();

    useEffect(() => {
        void checkForUpdates();
    }, []);

    const checkForUpdates = async () => {
        if (Platform.OS !== 'android') return;

        try {
            const currentVersion = Application.nativeApplicationVersion ?? '0.0.0';

            const response = await fetch(
                `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases/latest`
            );

            if (!response.ok) return;

            const data: GitHubRelease = await response.json();
            let latestVersion = data.tag_name.replace(/^v/, '');

            if (latestVersion > currentVersion) {
                const downloadUrl = data.assets[0]?.browser_download_url;
                if (downloadUrl) {

                    showAlert({
                        title: t('update.availableTitle'),
                        message: t('update.availableMessage', {version: latestVersion}),
                        buttons: [
                            {
                                text: t('common.cancel'),
                                style: "cancel",
                                onPress: () => console.log("Update cancelled")
                            },
                            {
                                text: t('update.updateNow'),
                                style: "default",
                                onPress: () => void startUpdateFlow(downloadUrl)
                            }
                        ]
                    });
                }
            }
        } catch (error) {
            console.log("Check skipped", error);
        }
    };

    const startUpdateFlow = async (url: string) => {
        setIsDownloading(true);
        try {
            const manualCacheDir = `file:///data/user/0/${PACKAGE_NAME}/cache/`;
            const downloadDir = FileSystem.cacheDirectory ?? manualCacheDir;
            const fileUri = downloadDir + 'update.apk';

            try {
                await FileSystem.makeDirectoryAsync(downloadDir, {intermediates: true});
            } catch (e) { /* Ignore */
            }

            const downloadResult = await FileSystem.downloadAsync(url, fileUri);

            if (downloadResult.status !== 200) {
                throw new Error("Download failed");
            }

            const contentUri = await FileSystem.getContentUriAsync(downloadResult.uri);

            await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
                data: contentUri,
                flags: 1,
                type: 'application/vnd.android.package-archive',
            });

        } catch (e: any) {
            console.error("Update failed:", e);

            showAlert({
                title: t('update.failedTitle'),
                message: t('update.failedMessage'),
                buttons: [{text: t('common.ok'), style: "cancel"}]
            });

        } finally {
            setIsDownloading(false);
        }
    };

    return {isDownloading};
};

export default useGitHubUpdate;