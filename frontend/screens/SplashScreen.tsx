import {useEffect} from "react";
import { SplashScreen, router } from 'expo-router';
import { useSession } from '@/context/ctx';


export function SplashScreenController() {
  const { session, isLoading } = useSession();

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
      if (session) {
        router.replace('/(tabs)/user_tasks');
      } else {
        router.replace('/');
      }
    }
  }, [isLoading, session]);

  return null;
}
