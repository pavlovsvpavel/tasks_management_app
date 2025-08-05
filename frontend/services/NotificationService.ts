import * as Notifications from 'expo-notifications';
import {Task} from '@/interfaces/interfaces'
import {SchedulableTriggerInputTypes} from "expo-notifications";


export const scheduleTaskNotification = async (
    task: Task,
    reminderOffsetInMinutes: number | null
) => {
    if (reminderOffsetInMinutes === null) {
        console.log(`No notification scheduled for task ${task.id} as per user choice.`);
        return null;
    }

    const dueDate = new Date(task.dueDate);
    const triggerTime = new Date(dueDate.getTime() - reminderOffsetInMinutes * 60 * 1000);

    // Check if the trigger time is in the future
    if (triggerTime.getTime() > Date.now()) {
        try {
            const delayInSeconds = Math.ceil((triggerTime.getTime() - Date.now()) / 1000);

            if (delayInSeconds <= 0) {
                console.log(`Task "${task.title}" is due too soon to schedule a notification.`);
                return null;
            }

            const notificationId = await Notifications.scheduleNotificationAsync({
                content: {
                    title: "Reminder: Task Due Soon!",
                    body: `Your task "${task.title}" is due in "${reminderOffsetInMinutes}" minutes`,
                    data: {
                        taskId: task.id,
                        url: `/tasks/details/${task.id}`
                    },
                },
                trigger: {
                    type: SchedulableTriggerInputTypes.TIME_INTERVAL,
                    seconds: delayInSeconds,
                    repeats: false,
                },
            });
            console.log(`Notification scheduled for task ${task.id} in ${delayInSeconds} seconds with ID: ${notificationId}`);
            return notificationId;
        } catch (error) {
            console.error("Error scheduling notification:", error);
        }
    } else {
        console.log(`Task "${task.title}" due date is in the past. No notification scheduled.`);
    }
    return null;
};

export const cancelNotification = async (notificationId: string) => {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
    console.log(`Notification ${notificationId} cancelled.`);
};

// To cancel ALL scheduled notifications (useful for logout)
export const cancelAllNotifications = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('All scheduled notifications cancelled.');
};