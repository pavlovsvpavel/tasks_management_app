import {ActivityIndicator, TouchableOpacity} from 'react-native'
import {Ionicons} from "@expo/vector-icons";
import {useRefresh} from "@/contexts/RefreshContext";


function RefreshButton() {
    const {triggerRefresh, isRefreshing} = useRefresh();

    return (
        <TouchableOpacity onPress={triggerRefresh}>
            {isRefreshing ? (
                <ActivityIndicator/>
            ) : (
                <Ionicons name="refresh" size={24}/>
            )}
        </TouchableOpacity>
    );
}