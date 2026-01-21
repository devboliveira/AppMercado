import React, { useEffect, useState, useCallback } from "react";
import { Text, View, TextInput, TouchableOpacity, Alert, ActivityIndicator, Image, FlatList, StyleSheet, Modal, Pressable, KeyboardAvoidingView, ScrollView, Platform } from "react-native";
import { styles } from "../../global/styles";
import { supabase } from "../../services/supabase";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { themes } from "../../global/themes";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, NavigationProp, useFocusEffect } from "@react-navigation/native";

type Cotacao = {
    id: number;
    created_at: any;
    descricao: string;
    tipo: string;
    status: string;
    data_finalizacao: any;
    online: boolean;
    observacoes: string;
};

export default function ListCotacao() {

    const [cotacoes, setCotacoes] = useState<Cotacao[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedCotacao, setSelectedCotacao] = useState<Cotacao | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [editFormMode, setEditFormMode] = useState(false);
    const [modalFormVisible, setModalFormVisible] = useState(false);
    const [userLevel, setUserLevel] = useState<number | null>(null);
    const navigation = useNavigation<NavigationProp<any>>();
    const [pesquisa, setPesquisa] = useState("");

    const formatarData = (data: string | Date) => {
        if (!data) return '';
        return new Date(data).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };


    async function loadUser() {
        const stored = await AsyncStorage.getItem("@user");
        if (stored) {
            const parsed = JSON.parse(stored);
            setUserLevel(parsed.nivel);
        }
    }

    async function loadCotacoes() {
        try {
            setLoading(true);

            const { data, error } = await supabase
                .from("tbListCotacao")
                .select("*")
                .order("id", { ascending: false });

            if (error) {
                console.log(error);
                return Alert.alert("Erro", "Não foi possível carregar os produtos");
            }

            setCotacoes(data || []);

        }
        catch (e) {
            console.log(e);
            Alert.alert("Erro", "Falha ao carregar dados");
        }
        finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadCotacoes();
        loadUser();
    }, []);

    function handleSelect(cotacao: Cotacao) {
        if (userLevel !== null && (userLevel < 6 && cotacao.status !== 'ATIVO')) return;
        setSelectedCotacao(cotacao);
        setModalVisible(true);
        console.log("Selecionado:", cotacao.id);
    }

    function closeModal() {
        setSelectedCotacao(null);
        setModalVisible(false);
    }

    async function handleOption(option: string) {

        if (option === "Balanco") {
            if (selectedCotacao?.status === 'FINALIZADO') {
                Alert.alert("Atenção", "Esta cotação está finalizada e não pode ser editada.");
                return;
            }
            //Salvar selectedID no AsyncStorage
            await AsyncStorage.setItem("@selectedCotacao", JSON.stringify(selectedCotacao?.id));
            navigation.navigate('Cotacao', { cotacaoID: selectedCotacao?.id, option: 'Balanco' });
        }
        else if (option === "Buy") {
            //Salvar selectedID no AsyncStorage
            await AsyncStorage.setItem("@selectedCotacao", JSON.stringify(selectedCotacao?.id));
            navigation.navigate('Cotacao', { cotacaoID: selectedCotacao?.id, option: 'Buy' });
        }
        else if (option === 'Finalizar') {
            if (selectedCotacao?.status === 'FINALIZADO') {
                Alert.alert("Atenção", "Esta cotação está cotação já está finalizada.");
                return;
            }

            const { data, error } = await supabase
                .from("tbListCotacao")
                .update([
                    {
                        status: "FINALIZADO",
                        data_finalizacao: new Date()
                    }
                ])
                .eq('id', selectedCotacao?.id);

                Alert.alert("Sucesso", "Cotação finalizada com sucesso.");

            if (error) {
                console.log(error);
                Alert.alert("Erro", "Não foi possível finalizar a cotação");
            }
        }
        closeModal();
    }

    async function novaCotacao() {
        if (cotacoes.filter(c => c.status === 'ATIVO').length >= 1) {
            Alert.alert("Atenção", "Já existe uma cotação ativa. Finalize-a antes de criar uma nova.");
            return;
        }

        const { data, error } = await supabase
            .from("tbListCotacao")
            .insert([
                {
                    descricao: "COTAÇÃO SEMANAL",
                    tipo: "COTAÇÃO GERAL",
                    status: "ATIVO",
                    online: false
                }
            ]);

        if (error) {
            console.log(error);
            Alert.alert("Erro", "Não foi possível criar a cotação");
        }

        loadCotacoes();
    }

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
                        onChangeText={(e) => setPesquisa(e)} // busca ao apertar enter
                    />
                    <TouchableOpacity>
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
                            novaCotacao();
                        }}>
                        <Feather
                            name='plus'
                            size={25}
                            color={themes.colors.secondary}
                        />
                    </TouchableOpacity>
                </View>
            </View>
            {loading ? (
                <ActivityIndicator size="large" />
            ) : (
                <FlatList
                    style={{ width: '100%', padding: 10 }}
                    data={cotacoes}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => {
                        const isSelected = selectedCotacao === item;
                        return (
                            <TouchableOpacity
                                onPress={() => handleSelect(item)}
                                style={[styles.listItem, { backgroundColor: isSelected ? '#9febf5ff' : '#ecececff' }]}
                            >
                                <View style={styles.rowItem}>
                                    <Text style={{ fontSize: 16, fontWeight: "500", width: "70%" }}>{item.descricao}</Text>
                                    <View style={{ width: '30%', flexDirection: 'row-reverse' }}>
                                        <View style={{ backgroundColor: item.status === 'ATIVO' ? '#4caf50' : '#f44336', padding: 5, borderRadius: 10 }}>
                                            <Text style={{ fontSize: 16, fontWeight: "500" }}>{item.status}</Text>
                                        </View>
                                    </View>
                                </View>
                                <Text style={{ fontSize: 16, fontWeight: "500", width: "70%" }}>{item.tipo}</Text>
                                <Text style={{ color: "#666" }}>Criado em: {formatarData(item.created_at)} {item.status === 'ATIVO' ? "" : "Finalizado em: " + formatarData(item.data_finalizacao)}</Text>
                            </TouchableOpacity>
                        );
                    }}
                />
            )}

            <Modal
                transparent={true}
                animationType="slide"
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}>
                <View style={styles.modalOverlayCenter}>
                    <View style={styles.modalContentCenter}>
                        <Text style={[styles.modalTitle, { color: themes.colors.primary }]}>
                            Escolha uma Opção:
                        </Text>

                        <Pressable
                            style={styles.optionButton}
                            onPress={() => handleOption("Balanco")}>
                            <Text style={[styles.opitionText, { color: themes.colors.secondary }]}>➕ Inserir Itens</Text>
                        </Pressable>

                        {userLevel !== null && userLevel >= 6 && (
                            <Pressable
                                style={styles.optionButton}
                                onPress={() => handleOption("Buy")}>
                                <Text style={[styles.opitionText, { color: themes.colors.secondary }]}>Realizar Cotação</Text>
                            </Pressable>)}

                        {userLevel !== null && userLevel >= 6 && (
                            <Pressable
                                style={styles.optionButton}
                                onPress={() => handleOption("Finalizar")}
                            >
                                <Text style={[styles.opitionText, { color: themes.colors.secondary }]}>Finalizar</Text>
                            </Pressable>)
                        }

                        <Pressable
                            style={[styles.optionButton, { backgroundColor: "#ddd" }]}
                            onPress={() => closeModal()}>
                            <Text style={[styles.opitionText, { color: "red", fontWeight: 'bold' }]}>❌ Fechar</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>

            <Modal
                transparent={true}
                animationType="slide"
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}>
                <View style={styles.modalOverlayCenter}>
                    <View style={styles.modalContentCenter}>
                        <Text style={[styles.modalTitle, { color: themes.colors.primary }]}>
                            Escolha uma Opção:
                        </Text>

                        <Pressable
                            style={styles.optionButton}
                            onPress={() => handleOption("Balanco")}>
                            <Text style={[styles.opitionText, { color: themes.colors.secondary }]}>➕ Inserir Itens</Text>
                        </Pressable>

                        {userLevel !== null && userLevel >= 6 && (
                            <Pressable
                                style={styles.optionButton}
                                onPress={() => handleOption("Buy")}>
                                <Text style={[styles.opitionText, { color: themes.colors.secondary }]}>Realizar Cotação</Text>
                            </Pressable>)}

                        {userLevel !== null && userLevel >= 6 && (
                            <Pressable
                                style={styles.optionButton}
                            //onPress={() => handleOption("Detalhes")}
                            >
                                <Text style={[styles.opitionText, { color: themes.colors.secondary }]}>ℹ️ FINALIZAR</Text>
                            </Pressable>)
                        }

                        <Pressable
                            style={[styles.optionButton, { backgroundColor: "#ddd" }]}
                            onPress={() => closeModal()}>
                            <Text style={[styles.opitionText, { color: "red", fontWeight: 'bold' }]}>❌ Fechar</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </View>
    );
}