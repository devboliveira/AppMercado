import React, { useEffect, useState } from "react";
import { Text, View, TextInput, TouchableOpacity, Alert, ActivityIndicator, Image, FlatList, StyleSheet, Modal, Pressable } from "react-native";
import { styles } from "../../global/styles";
import { supabase } from "../../services/supabase";
import { MaterialIcons } from "@expo/vector-icons";
import { themes } from "../../global/themes";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, NavigationProp } from "@react-navigation/native";

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
    const [userLevel, setUserLevel] = useState<number | null>(null);
    const navigation = useNavigation<NavigationProp<any>>();

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
                .order("id", { ascending: true });

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
            //Salvar selectedID no AsyncStorage
            await AsyncStorage.setItem("@selectedCotacao", JSON.stringify(selectedCotacao?.id));
            navigation.navigate('Cotacao', { cotacaoID: selectedCotacao?.id });
        }
        closeModal();
    }

    return (
        <View style={styles.container}>
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
                            onPress={() => handleOption("Balanco")}
                        >
                            <Text style={[styles.opitionText, { color: themes.colors.secondary }]}>➕ Inserir Itens</Text>
                        </Pressable>

                        {userLevel !== null && userLevel >= 6 && (
                            <Pressable
                                style={styles.optionButton}
                            //onPress={() => handleOption("Excluir")}
                            >
                                <Text style={[styles.opitionText, { color: themes.colors.secondary }]}>Realizar Cotação</Text>
                            </Pressable>)}

                        {userLevel !== null && userLevel >= 6 && (
                            <Pressable
                                style={styles.optionButton}
                            //onPress={() => handleOption("Detalhes")}
                            >
                                <Text style={[styles.opitionText, { color: themes.colors.secondary }]}>ℹ️ Detalhes</Text>
                            </Pressable>)
                        }

                        <Pressable
                            style={[styles.optionButton, { backgroundColor: "#ddd" }]}
                            onPress={() => closeModal()}
                        >
                            <Text style={[styles.opitionText, { color: "red", fontWeight: 'bold' }]}>❌ Fechar</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </View>
    );
}