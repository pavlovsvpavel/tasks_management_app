import {useState, useMemo, useEffect, useRef} from 'react';
import {FlatList} from 'react-native';
import {View, Text, TouchableOpacity} from '@/components/Themed';
import {useTranslation} from 'react-i18next';
import {DateScrollerProps} from "@/interfaces/interfaces";


const formatDateToISO = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const generateMonths = (): Date[] => {
    const months: Date[] = [];
    const today = new Date();
    for (let i = -6; i <= 6; i++) {
        months.push(new Date(today.getFullYear(), today.getMonth() + i, 1));
    }
    return months;
};
const monthList = generateMonths();


export function DateScroller({selectedDate, onSelectDate}: DateScrollerProps) {
    const {t} = useTranslation();
    const monthListRef = useRef<FlatList>(null);
    const dayListRef = useRef<FlatList>(null);

    const today = useMemo(() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
    }, []);

    const [activeMonth, setActiveMonth] = useState(new Date(today));

     useEffect(() => {
        if (selectedDate) {
            const parts = selectedDate.split('-').map(Number);
            const year = parts[0];
            const month = parts[1] - 1;

            const newActiveMonth = new Date(year, month, 1);
            setActiveMonth(newActiveMonth);

        } else {
            setActiveMonth(new Date(today));
        }
    }, [selectedDate, today]);

    const daysInActiveMonth = useMemo(() => {
        const year = activeMonth.getFullYear();
        const month = activeMonth.getMonth();
        const date = new Date(year, month, 1);
        const days: Date[] = [];
        while (date.getMonth() === month) {
            days.push(new Date(date));
            date.setDate(date.getDate() + 1);
        }
        return days;
    }, [activeMonth]);

    useEffect(() => {
        const activeMonthIndex = monthList.findIndex(
            m => m.getMonth() === activeMonth.getMonth() && m.getFullYear() === activeMonth.getFullYear()
        );
        if (monthListRef.current && activeMonthIndex > -1) {
            setTimeout(() => {
                monthListRef.current?.scrollToIndex({
                    index: activeMonthIndex,
                    animated: true,
                    viewPosition: 0.5,
                });
            }, 100);
        }
    }, [activeMonth]);

    const AllButton = () => {
        const isActive = selectedDate === null;
        return (
            <TouchableOpacity
                onPress={() => onSelectDate(null)}
                className={`py-2 px-4 rounded-full border mb-2 self-end ${isActive ? 'border-blue-500' : 'bg-card border-transparent'}`}
            >
                <Text weight="bold"
                      className={`text-base ${isActive ? 'text-primary' : 'text-secondary'}`}>{t('userTasks.userTasksFilterAllTasksButton')}</Text>
            </TouchableOpacity>
        );
    };

    return (
        <View className="space-y-5">
            <AllButton/>

            {/* --- Month Scroller --- */}
            <View>
                <Text className="text-primary text-sm mb-2" weight="semibold">{t('userTasks.userTasksFilterSelectMonth')}</Text>
                <FlatList
                    ref={monthListRef}
                    data={monthList}
                    keyExtractor={(item) => item.toISOString()}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{paddingHorizontal: 16}}
                    renderItem={({item}) => {
                        const monthString = `${item.getFullYear()}-${(item.getMonth() + 1).toString().padStart(2, '0')}`;
                        const isSelectedMonth = selectedDate === monthString;
                        const isActiveForDisplay = item.getMonth() === activeMonth.getMonth() && item.getFullYear() === activeMonth.getFullYear();
                        const isCurrentMonth = item.getMonth() === today.getMonth() && item.getFullYear() === today.getFullYear();

                        return (
                            <TouchableOpacity
                                onPress={() => {
                                    setActiveMonth(item);
                                    onSelectDate(monthString);
                                }}
                                className={`p-2 rounded-full mr-3 border ${
                                    isSelectedMonth || isActiveForDisplay ? 'border-blue-500' : 'bg-card border-transparent'
                                }`}
                            >
                                <Text weight={isCurrentMonth || isSelectedMonth || isActiveForDisplay ? "bold" : "semibold"}
                                      className={`text-sm ${isSelectedMonth || isActiveForDisplay ? 'text-primary' : 'text-secondary'}`}>
                                    {item.toLocaleString('default', {month: 'short'})} '{item.getFullYear().toString().slice(-2)}
                                </Text>
                            </TouchableOpacity>
                        );
                    }}
                />
            </View>

            <View className="border-t border-default mt-2 mb-2"/>

            {/* --- Day Scroller --- */}
            <View>
                <Text className="text-primary text-sm mb-2"
                      weight="semibold">{t('userTasks.userTasksFilterSelectDay')}</Text>
                <FlatList
                    ref={dayListRef}
                    data={daysInActiveMonth}
                    keyExtractor={(item) => item.toISOString()}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{paddingHorizontal: 16}}
                    renderItem={({item}) => {
                        const itemDateString = formatDateToISO(item);
                        const isSelectedDay = selectedDate === itemDateString;
                        const isCurrentDay = item.getTime() === today.getTime();

                        return (
                            <TouchableOpacity
                                onPress={() => onSelectDate(itemDateString)}
                                className={`p-2 rounded-full mr-3 border ${
                                    isSelectedDay ? 'border-blue-500' : 'bg-card border-transparent'
                                }`}
                            >
                                <View className="justify-center items-center">
                                    <Text weight="semibold" className={`text-sm ${
                                        isSelectedDay ? 'text-primary' : 'text-secondary'
                                    }`}>
                                        {item.toLocaleDateString('en-US', {weekday: 'short'})}
                                    </Text>
                                    <Text weight="bold" className={`text-xl ${
                                        isSelectedDay ? 'text-primary' : 'text-secondary'
                                    }`}>
                                        {item.getDate()}
                                    </Text>

                                    {/* The "Today" marker dot - purely visual */}
                                    {isCurrentDay && (
                                        <View className={`w-2 h-2 rounded-full ${
                                            isSelectedDay ? 'bg-blue-500' : 'bg-blue-500'
                                        }`}/>
                                    )}
                                </View>
                            </TouchableOpacity>
                        );
                    }}
                />
            </View>
        </View>
    );
}