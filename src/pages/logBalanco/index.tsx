import React from "react";
import { Text, View, FlatList, TextInput, TouchableOpacity, ActivityIndicator, Alert, LayoutAnimation, Button, Modal, Pressable, ScrollView } from "react-native";
import { styles } from "../../global/styles";
import { themes } from "../../global/themes";
import { MaterialIcons, AntDesign, Feather } from '@expo/vector-icons';
import { User } from "../../global/types";
import { supabase } from "../../services/supabase";
import { KeyboardAvoidingView, Platform } from 'react-native';
import { ItemBalanco } from "../balanco/types";

export default function LogBalanco() {
    const [pesquisa, setPesquisa] = React.useState<string>("");
    const [loading, setLoading] = React.useState<boolean>(false);
    const [logs, setLogs] = React.useState<ItemBalanco[]>([]);
    const [filterUsers, setFilterUsers] = React.useState<User[]>([]);
    const [modalVisible, setModalVisible] = React.useState<boolean>(false);
    const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
    const [editUser, setEditdUser] = React.useState<User | null>(null);
    const [editFormMode, setEditFormMode] = React.useState<boolean>(false);
    const [erroSenha, setErroSenha] = React.useState<boolean>(false);

    async function getUsers() {
        const { data, error } = await supabase
            .from('tbBalanco')
            .select('*')
            .order('nome', { ascending: true });

        if (error) {
            Alert.alert("Erro", "Não foi possível buscar os logs.");
            return;
        }

        setLogs(data);
        setFilterUsers(data);
    }


    React.useEffect(() => {
        getUsers();
    }, []);

    return (
        <View style={styles.container}>
            
            <FlatList
                style={{ width: '100%', paddingLeft: 10, paddingRight: 10 }}
                data={filterUsers}
                keyExtractor={(user) => user.id.toString()}
                renderItem={({ item, index }) => (
                    <View style={{
                        borderBottomWidth: 1,
                        borderBottomColor: themes.colors.lightGray,
                        paddingHorizontal: 10,
                        width: '100%',
                        flexDirection: 'row',
                    }}>
                        <View
                            style={{
                                paddingVertical: 10,
                                width: '90%',
                            }}>

                            <TouchableOpacity onPress={() => {
                                setSelectedUser(item);
                                setEditFormMode(false);
                                setModalVisible(true);
                            }}
                            >
                                <Text style={{ fontWeight: 'bold' }}>{item.nome}</Text>
                                <Text>{item.usuario}</Text>
                                <Text>STATUS: {item.status}</Text>
                            </TouchableOpacity>

                        </View>
                    </View>
                )}
            />
        </View>
    );
}
