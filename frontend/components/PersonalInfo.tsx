import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { ButtonSpinner } from "@/components/ButtonSpinner";
import { useTranslation } from "react-i18next";

type Props = {
    initialName: string;
    email: string;
    onSave: (name: string) => Promise<boolean>;
    isSaving: boolean;
};

export const PersonalInfo = ({ initialName, email, onSave, isSaving }: Props) => {
    const { t } = useTranslation();
    const [editing, setEditing] = useState(false);
    const [name, setName] = useState(initialName);

    const handleSave = async () => {
        const success = await onSave(name);
        if (success) setEditing(false);
    };

    return (
        <View className="bg-card rounded-xl p-5 mb-5">
            <View className="flex-row justify-between items-center mb-5">
                <Text className="text-lg text-primary font-bold">{t('personalInformation')}</Text>
                <TouchableOpacity onPress={() => setEditing(!editing)}>
                    <MaterialCommunityIcons name={editing ? "account-cancel" : "account-edit"} size={24} color="#3B82F6" />
                </TouchableOpacity>
            </View>

            <View className="mb-4">
                <Text className="text-sm text-primary mb-1.5 font-semibold">{t('fullName')}</Text>
                <TextInput
                    className={`input-default border-default ${editing ? 'border-blue-500 text-primary' : 'text-secondary'}`}
                    value={name}
                    onChangeText={setName}
                    editable={editing}
                    placeholder={t('fullNamePlaceholder')}
                />
            </View>

            <View className="mb-4">
                <Text className="text-sm text-primary mb-1.5 font-semibold">{t('email')}</Text>
                <TextInput
                    className="input-default text-secondary border-default"
                    value={email}
                    editable={false}
                />
            </View>

            {editing && (
                <TouchableOpacity className="btn-primary" onPress={handleSave} disabled={isSaving}>
                    {isSaving ? <ButtonSpinner /> : (
                        <>
                            <Ionicons name="save-outline" size={18} color="#ffffff" />
                            <Text className="btn-primary-text font-bold">{t('saveProfileChanges')}</Text>
                        </>
                    )}
                </TouchableOpacity>
            )}
        </View>
    );
};