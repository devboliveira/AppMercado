import React from "react";
import { Text, View, FlatList, TextInput, TouchableOpacity, ActivityIndicator, Alert, LayoutAnimation, Button, Modal, Pressable, ScrollView } from "react-native";
import { styles } from "../../global/styles";
import { themes } from "../../global/themes";
import { MaterialIcons, AntDesign, Feather } from '@expo/vector-icons';
import { User } from "../../global/types";
import { supabase } from "../../services/supabase";
import { KeyboardAvoidingView, Platform } from 'react-native';

export default function Users() {
    const [pesquisa, setPesquisa] = React.useState<string>("");
    const [loading, setLoading] = React.useState<boolean>(false);
    const [users, setUsers] = React.useState<User[]>([]);
    const [filterUsers, setFilterUsers] = React.useState<User[]>([]);
    const [modalVisible, setModalVisible] = React.useState<boolean>(false);
    const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
    const [editUser, setEditdUser] = React.useState<User | null>(null);
    const [editFormMode, setEditFormMode] = React.useState<boolean>(false);
    const [erroSenha, setErroSenha] = React.useState<boolean>(false);
    const [formData, setFormData] = React.useState({
        nome: "",
        usuario: "",
        nivel: "",
        status: "",
        senha: "",
        confirmarSenha: "",
    });

    type InputFieldProps = {
        label: string;
        value: string;
        editable: boolean;
        onChangeText?: (text: string) => void;
        secureTextEntry?: boolean;
    };

    function InputField({
        label,
        value,
        editable,
        onChangeText,
        secureTextEntry = false,
    }: InputFieldProps) {
        return (
            <View style={{ width: '100%' }}>
                <Text style={{ color: 'gray' }}>{label}</Text>
                <View style={[styles.boxInput, { width: '100%' }]}>
                    <TextInput
                        style={[styles.input, { width: '100%' }]}
                        editable={editable}
                        secureTextEntry={secureTextEntry}
                        placeholder=""
                        placeholderTextColor={themes.colors.darkGray}
                        keyboardType="default"
                        value={value}
                        onChangeText={onChangeText}
                    />
                </View>
            </View>
        );
    }

    async function getUsers() {
        const { data, error } = await supabase
            .from('tbUsuarios')
            .select('*')
            .order('nome', { ascending: true });

        if (error) {
            Alert.alert("Erro", "Não foi possível buscar os usuários.");
            return;
        }

        setUsers(data);
        setFilterUsers(data);
    }

    async function handleSalvarUsuario() {
        if (!formData.nome || !formData.usuario || !formData.nivel || !formData.status) {
            Alert.alert("Campos obrigatórios", "Preencha todos os campos");
            return;
        }

        try {
            if (selectedUser?.id) {
                const { error } = await supabase
                    .from("tbUsuarios")
                    .update({
                        nome: formData.nome,
                        usuario: formData.usuario,
                        nivel: formData.nivel,
                        status: formData.status,
                    })
                    .eq("id", selectedUser.id);

                if (error) throw error;
                Alert.alert("Sucesso", "Usuário atualizado com sucesso!");
            } else {

                if (!formData.senha || !formData.confirmarSenha) {
                    Alert.alert("Campos obrigatórios", "Preencha todos os campos");
                    return;
                }

                if (formData.senha != formData.confirmarSenha) {
                    Alert.alert("Campos obrigatórios", "As senhas não coincidem.");
                    return;
                }

                if (users.some(user => user.usuario === formData.usuario)) {
                    Alert.alert("Erro", "Já existe um usuário com esse username.");
                    return;
                }

                const { error } = await supabase
                    .from("tbUsuarios")
                    .insert([
                        {
                            nome: formData.nome,
                            usuario: formData.usuario,
                            senha: formData.senha,
                            nivel: formData.nivel,
                            status: formData.status,
                        },
                    ]);

                if (error) throw error;
                Alert.alert("Sucesso", "Usuário adicionado com sucesso!");
            }

            await getUsers();
            setEditFormMode(false);
            setSelectedUser(null);
            setModalVisible(false);

        } catch (err) {
            console.error(err);
            Alert.alert("Erro", "Não foi possível salvar o usuário.");
        }
    }

    function handlerSearch() {
        setPesquisa(pesquisa);
        if (pesquisa === "") {
            setFilterUsers(users);
        }
        else {
            const filteredData = users.filter(item =>
                item.nome.toLowerCase().includes(pesquisa.toLowerCase())
            );
            setFilterUsers(filteredData);
        }
    }

    function verificarSenha() {
        if (formData.senha != formData.confirmarSenha) {
            Alert.alert("As senhas não coincidem.")
            setErroSenha(true);
        }
    }

    function resetVariaveis() {
        setErroSenha(false);
        setEditFormMode(false);
        setFormData({
            nome: "",
            usuario: "",
            nivel: "",
            status: "",
            senha: "",
            confirmarSenha: "",
        });
        setModalVisible(false);
        setSelectedUser(null);

    }

    React.useEffect(() => {
        getUsers();
    }, []);

    return (
        <View style={styles.container}>
            <View style={[styles.searchBarBox, { gap: 10 }]}>
                <View style={styles.boxInput}>
                    <TextInput
                        style={styles.input}
                        returnKeyType='done'
                        placeholder="Pesquisar usuário..."
                        placeholderTextColor={themes.colors.darkGray}
                        keyboardType='default'
                        value={pesquisa}
                        onChangeText={(e) => setPesquisa(e)}
                        onSubmitEditing={() => handlerSearch()} // busca ao apertar enter
                    />
                    <TouchableOpacity onPress={() => handlerSearch()}>
                        {loading ? (
                            <ActivityIndicator size="small" color={themes.colors.primary} />
                        ) : (
                            <MaterialIcons name="search" size={20} color="gray" />
                        )}
                    </TouchableOpacity>
                </View>

                <View style={{ width: "15%", flexDirection: "row-reverse" }}>
                    <TouchableOpacity style={styles.buttonSearchBox}
                        onPress={() => {
                            setEditFormMode(true);
                            setFormData({
                                nome: "",
                                usuario: "",
                                nivel: "",
                                status: "ATIVO",
                                senha: "",
                                confirmarSenha: "",
                            });
                            setModalVisible(true);
                        }}>
                        <Feather
                            name='user-plus'
                            size={25}
                            color={themes.colors.secondary}
                        />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={[styles.separator, { marginVertical: 0, marginTop: 10 }]} />

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
                                setFormData({
                                    nome: item.nome,
                                    usuario: item.usuario,
                                    nivel: item.nivel.toString(),
                                    status: item.status,
                                    senha: "",
                                    confirmarSenha: "",
                                });
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

            <Modal
                transparent={true}
                animationType="slide"
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}>

                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "padding"}
                    keyboardVerticalOffset={Platform.OS === "ios" ? -30 : 0}
                    style={{ flex: 1 }}>

                    <View style={[styles.modalOverlayBottom]}>
                        <View style={styles.modalContentBottom}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>CADASTRO DE USUÁRIOS</Text>

                                {/* Botões de ações no cabeçalho */}
                                <View style={{ position: 'absolute', flexDirection: 'row-reverse', right: 10, gap: 10 }}>
                                    {/* Fechar */}
                                    <TouchableOpacity onPress={() => resetVariaveis()}>
                                        <AntDesign name="close" size={24} color="white" />
                                    </TouchableOpacity>

                                    {/* Editar */}
                                    {!editFormMode ?
                                        <TouchableOpacity onPress={() => setEditFormMode(true)}>
                                            <AntDesign name="edit" size={24} color="white" />
                                        </TouchableOpacity> : null
                                    }
                                </View>
                            </View>


                            {/* Formulário */}
                            <ScrollView style={{ width: '100%', padding: 20 }}>

                                <View style={{ width: '100%' }}>
                                    <Text style={{ color: 'gray' }}>NOME</Text>
                                    <View style={[styles.boxInput, { width: '100%' }]}>
                                        <TextInput style={[styles.input, { width: '100%' }]}
                                            editable={editFormMode}
                                            placeholder=""
                                            autoCapitalize='words'
                                            autoCorrect={false}
                                            placeholderTextColor={themes.colors.darkGray}
                                            keyboardType='default'
                                            value={formData.nome}
                                            onChangeText={(e) => setFormData({ ...formData, nome: e })} />
                                    </View>
                                </View>

                                <View style={{ width: '100%', paddingTop: 10 }}>
                                    <Text style={{ color: 'gray' }}>USERNAME</Text>
                                    <View style={[styles.boxInput, { width: '100%' }]}>
                                        <TextInput style={[styles.input, { width: '100%' }]}
                                            editable={editFormMode}
                                            placeholder=""
                                            autoCapitalize="none"
                                            autoCorrect={false}
                                            placeholderTextColor={themes.colors.darkGray}
                                            keyboardType='default'
                                            value={formData.usuario}
                                            onChangeText={(e) => setFormData({ ...formData, usuario: e })} />
                                    </View>
                                </View>

                                <View style={{ width: '100%', paddingTop: 10 }}>
                                    <Text style={{ color: 'gray' }}>NIVEL</Text>
                                    <View style={[styles.boxInput, { width: '100%' }]}>
                                        <TextInput style={[styles.input, { width: '100%' }]}
                                            editable={editFormMode}
                                            placeholder=""
                                            placeholderTextColor={themes.colors.darkGray}
                                            keyboardType='numeric'
                                            value={formData.nivel}
                                            onChangeText={(e) => setFormData({ ...formData, nivel: e })} />
                                    </View>
                                </View>

                                <View style={{ width: '100%', paddingTop: 10 }}>
                                    <Text style={{ color: 'gray' }}>STATUS</Text>
                                    <View style={[styles.boxInput, { width: '100%' }]}>
                                        <TextInput style={[styles.input, { width: '100%' }]}
                                            editable={editFormMode}
                                            placeholder="ATIVO / INATIVO"
                                            placeholderTextColor={themes.colors.darkGray}
                                            keyboardType='default'
                                            autoCapitalize='characters'
                                            value={formData.status}
                                            onChangeText={(e) => setFormData({ ...formData, status: e })} />
                                    </View>
                                </View>

                                {/* Campos de senha apenas no modo edição */}
                                {editFormMode && !selectedUser ?
                                    <View style={{ width: '100%', paddingTop: 10 }}>
                                        <Text style={{ color: 'gray' }}>SENHA</Text>
                                        <View style={[styles.boxInput, { width: '100%' }]}>
                                            <TextInput style={[styles.input, { width: '100%' }]}
                                                editable={editFormMode}
                                                placeholder=""
                                                placeholderTextColor={themes.colors.darkGray}
                                                keyboardType='default'
                                                secureTextEntry
                                                value={formData.senha}
                                                onChangeText={(e) => setFormData({ ...formData, senha: e })} />
                                        </View>
                                    </View>
                                    : null
                                }

                                {/* Campos de senha apenas no modo edição */}
                                {editFormMode && !selectedUser ?
                                    <View style={{ width: '100%', paddingTop: 10 }}>
                                        <Text style={{ color: 'gray' }}>CONFIRMAR SENHA</Text>
                                        <View style={[styles.boxInput, { width: '100%' }]}>
                                            <TextInput style={[styles.input, { width: '100%' }]}
                                                editable={editFormMode}
                                                placeholder=""
                                                placeholderTextColor={themes.colors.darkGray}
                                                keyboardType='default'
                                                secureTextEntry
                                                onChangeText={(e) =>
                                                    setFormData({ ...formData, confirmarSenha: e })
                                                }
                                                onSubmitEditing={() => verificarSenha()} />
                                        </View>
                                    </View> : null
                                }

                                {/* Botões */}
                                {editFormMode && (
                                    <View style={styles.modalBotoes}>
                                        <Pressable style={styles.opitionCancelButton} onPress={() => { resetVariaveis() }} >
                                            <Text style={styles.opitionCancelText}>Cancelar</Text>
                                        </Pressable>
                                        <Pressable style={[styles.opitionCancelButton, { backgroundColor: themes.colors.primary }]} onPress={handleSalvarUsuario} >
                                            <Text style={[styles.opitionText, { color: themes.colors.secondary, fontWeight: 'bold' }]}> Confirmar </Text>
                                        </Pressable>
                                    </View>)}

                            </ScrollView>

                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

        </View>
    );
}
