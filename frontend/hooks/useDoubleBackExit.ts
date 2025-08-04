import { useEffect, useRef } from 'react';
import { BackHandler, ToastAndroid } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {useTranslation} from "react-i18next";

export const useDoubleBackExit = () => {
  const backPressedOnce = useRef(false);
  const navigation = useNavigation();
  const { t } = useTranslation();

  useEffect(() => {
    const handleBackPress = () => {
      if (!navigation.canGoBack()) {
        if (backPressedOnce.current) {
          BackHandler.exitApp();
        } else {
          backPressedOnce.current = true;
          ToastAndroid.show(t('common.exitMessage'), ToastAndroid.SHORT);
          setTimeout(() => {
            backPressedOnce.current = false;
          }, 2000);
        }
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    return () => backHandler.remove();
  }, [navigation]);
};
