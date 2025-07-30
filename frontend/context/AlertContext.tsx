import React, {createContext, useContext, useState, ReactNode, useCallback} from 'react';
import CustomAlert, {AlertButton} from '@/components/CustomAlert';

interface AlertContextType {
    showAlert: (options: ShowAlertOptions) => void;
}

interface ShowAlertOptions {
    title: string;
    message?: string;
    buttons: AlertButton[];
}

const AlertContext = createContext<AlertContextType | null>(null);

export const AlertProvider = ({children}: { children: ReactNode }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [alertOptions, setAlertOptions] = useState<ShowAlertOptions>({title: '', buttons: []});

    const showAlert = useCallback((options: ShowAlertOptions) => {
        const wrappedButtons = options.buttons.map(button => ({
            ...button,
            onPress: () => {
                setIsVisible(false); // Hide alert first
                if (button.onPress) {
                    button.onPress(); // Then run original action
                }
            }
        }));

        setAlertOptions({...options, buttons: wrappedButtons});
        setIsVisible(true);
    }, []);

    return (
        <AlertContext.Provider value={{showAlert}}>
            {children}
            <CustomAlert
                isVisible={isVisible}
                title={alertOptions.title}
                message={alertOptions.message}
                buttons={alertOptions.buttons}
            />
        </AlertContext.Provider>
    );
};

export const useAlert = () => {
    const context = useContext(AlertContext);
    if (!context) {
        throw new Error('useAlert must be used within an AlertProvider');
    }
    return context;
};