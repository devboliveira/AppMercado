import React from "react";
import { Text, View, FlatList, TextInput, TouchableOpacity, ActivityIndicator, Alert, LayoutAnimation, Button, Modal, Pressable } from "react-native";
import { styles } from "../../global/styles";
import { MaterialIcons, AntDesign } from "@expo/vector-icons";
import { themes } from "../../global/themes";
import { supabase } from "../../services/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BarcodeScannerModal from "../scanCode";
import { getRegister, clearRegister } from "../../services/asyncStorageService";
import { useNavigation } from "@react-navigation/native";
import { Produto, CotacaoItem } from "../../global/types";

export default function Cotacao() {
    const [itensCotacao, setItensCotacao] = React.useState<CotacaoItem[]>([]);
    const [filterItensCotacao, setFilterItensCotacao] = React.useState<CotacaoItem[]>([]);
    const [pesquisa, setPesquisa] = React.useState<string>("");
    const [userId, setUserId] = React.useState<number | null>(null);
    const [loading, setLoading] = React.useState<boolean>(false);
    const [cotacaoID, setCotacaoID] = React.useState<number | null>(null);
    const [modalVisible, setModalVisible] = React.useState<boolean>(false);
    const [produtoSelecionado, setProdutoSelecionado] = React.useState<Produto | null>(null);
    const [quantidade, setQuantidade] = React.useState<number>(1);
    let timeoutAtualizacao: NodeJS.Timeout | null = null;
    const navigation = useNavigation();
    const flatListRef = React.useRef<FlatList>(null);
    const [highlightedId, setHighlightedId] = React.useState<number | null>(null);

    React.useEffect(() => {
        getAsyncStorage();
    }, []);

    React.useEffect(() => {
        if (userId && cotacaoID) {
            buscarCotacao();
        }
    }, [userId , cotacaoID]);

    async function getAsyncStorage() {
        const user = await getRegister('@user');
        console.log('Usuário carregado do AsyncStorage:', user);
        setUserId(user?.id ?? null);

        const cotacao = await getRegister('@selectedCotacao');
        console.log('Cotação carregada do AsyncStorage:', cotacao);
        setCotacaoID(cotacao ?? null);
        console.log('Cotação ID definida como:', cotacaoID);
    }

    async function buscarCotacao() {
        if (!userId) return;

        const { data, error } = await supabase
            .from('tbCotacoes')
            .select(`
                id,
                codbar,
                descricao,
                created_for,
                cotacao_id,
                fornecedor_id,
                produto:tbProdutos!inner(DESCRICAO)
              `)
            .eq('cotacao_id', cotacaoID)
            .order('id', { ascending: false });

        if (error) {
            console.error("Erro ao buscar itens da cotação:", error.message);
            Alert.alert("Erro", "Não foi possível buscar os itens.");
            return;
        }
        if (data) {
            const flattened = data.map(item => ({
                ...item,
                produto: item.produto?.[0] ?? null,
            }));
            setItensCotacao(data);
            setFilterItensCotacao(data);
            console.log("Itens da cotação buscados:", filterItensCotacao);
        }
    }

    function handlerSearch() {
        setPesquisa(pesquisa);
        if (pesquisa === "") {
            setFilterItensCotacao(itensCotacao);
        }
        else {
            const filteredData = itensCotacao.filter(item =>
                (item.produto as any)?.DESCRICAO.toLowerCase().includes(pesquisa.toLowerCase()) ||
                item.codbar?.toString().includes(pesquisa.toLowerCase())
            );
            setFilterItensCotacao(filteredData);
        }
    }

    // 🔧 Função auxiliar para atualizar no Supabase
    async function atualizarQuantidadeBanco(id: number, novaQtd: number) {
        try {
            const { error } = await supabase
                .from("tbEtiqueta")
                .update({ quantidade: novaQtd })
                .eq("id", id);

            if (error) {
                console.error("Erro ao atualizar quantidade:", error.message);
                Alert.alert("Erro", "Falha ao atualizar a quantidade.");
            } else {
                console.log(`Etiqueta ${id} atualizada para ${novaQtd}`);
            }
        } catch (err) {
            console.error("Erro inesperado ao atualizar quantidade:", err);
        }
    }

    function abrirSelecaoProduto() {
        navigation.navigate("SelecaoProduto", {
            onSelect: (produto: Produto) => {
                const existe = itensCotacao.some((e) => e.codbar === produto.CODBAR);
                if (existe) {
                    focarItemExistente(produto.CODBAR);
                } else {
                    setProdutoSelecionado(produto);
                    adicionarItemCotacao(produto);
                }
            },
        });
    }

    async function adicionarItemCotacao(item?: Produto) {
        if (!item || !userId) return;

        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("tbCotacoes")
                .insert([
                    {
                        codbar: item.CODBAR,
                        descricao: item.DESCRICAO,
                        created_for: userId,
                        cotacao_id: cotacaoID,
                    },
                ])
                .select();
            if (error) {
                console.error("Erro ao adicionar item à cotação:", error.message);
                Alert.alert("Erro", "Não foi possível adicionar o item.");
                return;
            }
            if (data && data.length > 0) {
                console.log("Item adicionado à cotação:", data[0]);
                const novoItem = data[0];
                setFilterItensCotacao((prev) => [novoItem, ...prev]);
            }
        } catch (err) {
            console.error("Erro ao adicionar item à cotação: ", err);
        } finally {
            setLoading(false);
        }
    }

    // Função para rolar até o item existente
    function focarItemExistente(codbarra: number) {
        const index = itensCotacao.findIndex((item) => item.codbar === codbarra);
        if (index !== -1) {
            // Rola até o item
            flatListRef.current?.scrollToIndex({ index, animated: true });

            // Marca o item como destacado
            setHighlightedId(itensCotacao[index].id);

            // Remove o destaque após 1 segundo
            setTimeout(() => setHighlightedId(null), 1000);
        }
    }

    return (
        <View style={styles.container}>
            <View style={[styles.searchBarBox, { gap: 10 }]}>
                <View style={styles.boxInput}>
                    <TextInput
                        style={styles.input}
                        returnKeyType='done'
                        placeholder="Pesquisar item..."
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
                    <TouchableOpacity style={styles.buttonScanner} onPress={() => abrirSelecaoProduto()}>
                        <AntDesign
                            name='plus'
                            size={25}
                            color={themes.colors.secondary}
                        />
                    </TouchableOpacity>
                </View>
            </View>
            <FlatList
                ref={flatListRef}
                style={{ width: '100%', paddingLeft: 10, paddingRight: 10 }}
                data={filterItensCotacao}
                keyExtractor={(itensCotacao) => itensCotacao.id.toString()}
                renderItem={({ item, index }) => (
                    <View style={{
                        borderBottomWidth: 1,
                        borderBottomColor: themes.colors.lightGray,
                        paddingHorizontal: 10,
                        borderRadius: 5,
                        width: '100%',
                        flexDirection: 'row',
                        backgroundColor:
                            highlightedId === item.id ? 'lightskyblue' : 'transparent', // destaque amarelo claro
                    }}>
                        <View
                            style={{
                                paddingVertical: 10,
                                width: '70%',
                            }}>

                            <Text style={{ fontWeight: 'bold' }}>
                                {item.descricao}
                            </Text>
                            <Text style={{ color: '#666' }}>{item.codbar}</Text>
                            <Text style={{ color: '#666' , fontSize: 12}}>{(item.fornecedor as any)?.fornecedor ?? 'NÃO COMPRADO'}</Text>
                        </View>
                    </View>
                )}
            />

        </View>
    );
}