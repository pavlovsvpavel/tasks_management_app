import {FlatList, RefreshControl} from 'react-native';
import {View} from '@/components/Themed';
import {PageLoadingSpinner} from '@/components/PageLoadingSpinner';
import {TaskItem} from '@/components/TaskItem';
import {SortControls} from '@/components/SortControls';
import {TaskEmptyState} from "@/components/TaskEmptyState";
import {useUserTasks} from '@/hooks/useUserTasks';
import {TaskListHeader} from '@/components/TaskListHeader';
import {FilterPanel} from '@/components/FilterPanel';

export default function UserTasksScreen() {
    const {
        tasks,
        isLoading,
        isRefreshing,
        triggerRefresh,
        updatingTaskId,
        sortedTasks,
        isFilterVisible,
        isSortingVisible,
        dateRange,
        calendarKey,
        sortBy,
        sortDirection,
        flatListRef,
        isFilterActive,
        promptForStatusChange,
        handleSortChange,
        handleDateRangeChange,
        togglePanel,
        handleTodayPress,
        clearDateFilter,
    } = useUserTasks();

    if (isLoading) {
        return <PageLoadingSpinner/>;
    }

    return (
        <View className="flex-1 bg-bgnd">
            <TaskListHeader
                isSortingVisible={isSortingVisible}
                isFilterVisible={isFilterVisible}
                onSortPress={() => togglePanel('sort')}
                onFilterPress={() => togglePanel('filter')}
            />

            <FlatList
                showsVerticalScrollIndicator={false}
                ref={flatListRef}
                refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={triggerRefresh}/>}
                data={sortedTasks}
                keyExtractor={item => item.id.toString()}
                renderItem={({item}) => (
                    <TaskItem
                        task={item}
                        onPrompt={() => promptForStatusChange(item)}
                        isUpdating={updatingTaskId === item.id}
                    />
                )}
                contentContainerStyle={{paddingHorizontal: 0, paddingBottom: 0}}
                ListHeaderComponent={
                    <View>
                        {isFilterVisible && (
                            <FilterPanel
                                dateRange={dateRange}
                                calendarKey={calendarKey}
                                onDateChange={handleDateRangeChange}
                                onTodayPress={handleTodayPress}
                                onClearPress={clearDateFilter}
                            />
                        )}

                        {isSortingVisible && sortedTasks.length > 0 && (
                            <View>
                                <SortControls
                                    sortBy={sortBy}
                                    sortDirection={sortDirection}
                                    onSortChange={handleSortChange}
                                />
                            </View>
                        )}
                    </View>
                }
                ListEmptyComponent={
                    <TaskEmptyState
                        totalTaskCount={tasks.length}
                        isFilterActive={isFilterActive}
                    />
                }
            />
        </View>
    );
}