import { TFunction } from 'i18next';
import {ReminderOption} from "@/interfaces/interfaces";



export const getReminderOptions = (t: TFunction): ReminderOption[] => {
  return [
    { label: t('reminderOptions.minutesBefore', { count: 2 }), value: 2 }, // For testing
    { label: t('reminderOptions.minutesBefore', { count: 15 }), value: 15 },
    { label: t('reminderOptions.minutesBefore', { count: 30 }), value: 30 },
    { label: t('reminderOptions.hourBefore'), value: 60 },
    { label: t('reminderOptions.hoursBefore', { count: 2 }), value: 120 },
    { label: t('reminderOptions.noReminder'), value: null },
  ];
};
