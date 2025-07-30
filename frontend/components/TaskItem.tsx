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
            className="bg-white p-4 rounded-xl mb-4 shadow-sm"
            onPress={() => router.push(`/tasks/details/${task.id}`)}
        >
            <View className="flex-row justify-between items-center">
                <View className="flex-1 gap-1 pr-4">
                    {task.title && (
                        <Text
                            className="text-sm text-gray-600"
                            weight="bold"
                            numberOfLines={1}
                            ellipsizeMode="tail"
                        >
                            {task.title}
                        </Text>
                    )}
                    {task.description && (
                        <Text
                            className="text-sm text-gray-600"
                            weight="italic"
                            numberOfLines={1}
                            ellipsizeMode="tail"
                        >
                            {task.description}
                        </Text>
                    )}
                    <Text className="text-sm text-gray-500">
                        Due: {format(new Date(task.due_date), 'd MMM yyyy, HH:mm')}
                    </Text>
                    <Text className={`text-sm capitalize ${priorityColors[task.priority]}`} weight="semibold">
                        {task.priority} Priority
                    </Text>
                </View>

                <View className="items-center">
                    <Switch
                        trackColor={{false: '#767577', true: '#81b0ff'}}
                        thumbColor={task.completed ? '#3B82F6' : '#f4f3f4'}
                        onValueChange={onPrompt}
                        value={task.completed}
                        disabled={isUpdating}
                    />
                    <Text className="text-xs text-gray-500">{task.completed ? 'Done' : 'Pending'}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};