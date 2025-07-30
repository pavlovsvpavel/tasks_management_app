import {useCallback} from 'react';
import {useAlert} from '@/context/AlertContext';
import {ServerDownError, SessionExpiredError, SessionRefreshedError, ValidationError} from '@/utils/errors';
import {ErrorHandlerOptions} from "@/interfaces/interfaces";


/**
 * A custom hook to provide a universal API error handler.
 * @param options - Configuration for custom error messages.
 * @returns A memoized handleApiError function.
 *
 * @example
 * const handleApiError = useApiErrorHandler({
 *   validationTitles: {
 *     task: 'Creation Failed',
 *     password: 'Password Change Failed'
 *   }
 * });
 *
 * // In an async function:
 * catch (error) {
 *   handleApiError(error, 'task');
 * }
 */
export const useApiErrorHandler = (options: ErrorHandlerOptions = {}) => {
    const { showAlert } = useAlert();
    const { validationTitles = {} } = options;

    return useCallback((error: unknown, context: string) => {
        console.error(`An API error occurred in context "${context}":`, error);

        if (error instanceof SessionRefreshedError) {
            showAlert({
                title: 'Session Updated',
                message: 'Your session was refreshed for security. Please try your action again.',
                buttons: [{text: 'OK'}]
            });
            return;
        }

        if (error instanceof SessionExpiredError || error instanceof ServerDownError) {
            return;
        }

        if (error instanceof ValidationError) {
            const title = validationTitles[context] || 'Validation Error';

            showAlert({
                title: title,
                message: error.body.detail || 'The server returned a validation error.',
                buttons: [{text: 'OK'}]
            });
            return;
        }

        showAlert({
            title: 'An Unexpected Error Occurred',
            message: 'We were unable to complete your request. Please try again.',
            buttons: [{text: 'Dismiss'}]
        });
    }, [showAlert, validationTitles]);
};