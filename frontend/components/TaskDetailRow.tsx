import {View, Text} from '@/components/Themed';
import {DetailRowProps} from "@/interfaces/interfaces";


export const TaskDetailRow = (
    {
        label,
        value,
        valueColor = 'text-primary',
    }: DetailRowProps) => (

    <View className="py-4 border-b border-default">
        <Text className="text-sm text-secondary" weight="semibold">{label}</Text>
        <Text className={`text-base mt-1 ${valueColor}`}>{value}</Text>
    </View>
);