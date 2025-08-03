import {router} from 'expo-router';
import {Switch} from 'react-native';
import {View, Text, TouchableOpacity} from '@/components/Themed';
import {format} from 'date-fns';
import {TaskItemProps} from '@/interfaces/interfaces';


export const TaskItem = ({task, onPrompt, isUpdating}: TaskItemProps) => {
    const priorityColors = {
        low: 'text-green-600',
        medium: 'text-amber-600',
        high: 'text-red-600',
    };

    return (
        <TouchableOpacity
            className="bg-card p-4 rounded-xl mb-4"
            onPress={() => router.push(`/tasks/details/${task.id}`)}
        >
            <View className="flex-row justify-between items-center">
                <View className="flex-1 gap-1 pr-4">
                    {task.title && (
                        <Text
                            className="text-lg text-primary"
                            weight="bold"
                            numberOfLines={1}
                            ellipsizeMode="tail"
                        >
                            {task.title}
                        </Text>
                    )}
                    {task.description && (
                        <Text
                            className="text-sm text-secondary"
                            weight="italic"
                            numberOfLines={1}
                            ellipsizeMode="tail"
                        >
                            {task.description}
                        </Text>
                    )}
                    <Text className="text-sm text-secondary">
                        Due: {format(new Date(task.due_date), 'd MMM yyyy, HH:mm')}
                    </Text>
                    <Text className={`text-sm capitalize ${priorityColors[task.priority]}`} weight="semibold">
                        {task.priority} Priority
                    </Text>
                </View>

                <View className="items-center">
                    <Switch
                        trackColor={{false: '#EF4444', true: '#6ced00'}}
                        thumbColor={task.completed ? '#479f00' : '#ba1515'}
                        onValueChange={onPrompt}
                        value={task.completed}
                        disabled={isUpdating}
                    />
                    <Text className="text-xs text-primary">{task.completed ? 'Done' : 'Pending'}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};