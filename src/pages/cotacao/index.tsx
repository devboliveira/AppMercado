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

export default function Cotacao({ route }: any) {
    const [itensCotacao, setItensCotacao] = React.useState<CotacaoItem[]>([]);
    const option = route.params?.option ?? null;
    const [filterItensCotacao, setFilterItensCotacao] = React.useState<CotacaoItem[]>([]);
    const [pesquisa, setPesquisa] = React.useState<string>("");
    const [userId, setUserId] = React.useState<number | null>(null);
    const [userLevel, setUserLevel] = React.useState<number | null>(null);
    const [loading, setLoading] = React.useState<boolean>(false);
    const [cotacaoID, setCotacaoID] = React.useState<number | null>(null);
    const [modalVisible, setModalVisible] = React.useState<boolean>(false);
    const [produtoSelecionado, setProdutoSelecionado] = React.useState<Produto | null>(null);
    const [descricaoAvulso, setDescricaoAvulso] = React.useState<string>("");
    const [quantidade, setQuantidade] = React.useState<number>(1);
    let timeoutAtualizacao: NodeJS.Timeout | null = null;
    const navigation = useNavigation();
    const flatListRef = React.useRef<FlatList>(null);
    const [highlightedId, setHighlightedId] = React.useState<number | null>(null);
    const [filtroOptions, setFiltroOptions] = React.useState<string>('all');

    React.useEffect(() => {
        getAsyncStorage();
    }, []);

    React.useEffect(() => {
        if (userId && cotacaoID) {
            buscarCotacao();
        }
    }, [userId, cotacaoID]);

    async function getAsyncStorage() {
        const user = await getRegister('@user');
        console.log('Usuário carregado do AsyncStorage:', user);
        setUserId(user?.id ?? null);
        setUserLevel(user?.nivel ?? null);

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
                produto:tbProdutos(DESCRICAO, ESTOQ, PRVENDA, CUSTO),
                fornecedor:tbFornecedores(fornecedor)
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
            console.log("Itens da cotação buscados:", data);
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

    async function excluirItemCotacao(index: number, itemID: number) {
        Alert.alert(
            "Remover item",
            "Deseja realmente remover esta etiqueta?",
            [
                {
                    text: "Cancelar",
                    style: "cancel",
                    onPress: () => {
                        console.log("Remoção de etiqueta cancelada");
                    },
                },
                {
                    text: "Remover",
                    style: "destructive",
                    onPress: async () => {
                        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                        // Remove visualmente o item
                        setItensCotacao(prev => prev.filter((_, i) => i !== index));
                        setFilterItensCotacao(prev => prev.filter((_, i) => i !== index));

                        // Exclui no banco
                        try {
                            const { error } = await supabase
                                .from("tbCotacoes")
                                .delete()
                                .eq("id", itemID);

                            if (error) {
                                console.error("Erro ao excluir o item:", error.message);
                                Alert.alert("Erro", "Falha ao excluir o item.");
                            } else {
                                console.log(`Item ${itemID} excluído com sucesso.`);
                            }
                        } catch (err) {
                            console.error("Erro inesperado ao excluir item:", err);
                        }
                    },
                },
            ]
        );
    }

    function filtrarItens(op: string) {

        if (op === 'all') {
            const filteredData = itensCotacao.filter(item =>
                item.id > 0);
            setFilterItensCotacao(filteredData);
        }

        if (op === 'buy') {
            const filteredData = itensCotacao.filter(item =>
                item.fornecedor_id > 0);
            setFilterItensCotacao(filteredData);
        }

        if (op === '?') {
            const filteredData = itensCotacao.filter(item =>
                item.fornecedor_id === null);
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

    async function adicionarItemCotacaoAvulso(descricao: string) {
        if (!descricao || !userId) return;

        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("tbCotacoes")
                .insert([
                    {
                        descricao: descricao,
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
                setModalVisible(false);
                setDescricaoAvulso("");
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

    function selectItem(id: number) {
        if (option === 'Buy') {
            navigation.navigate('DetailCompra', { compraId: id })
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
                    <TouchableOpacity style={styles.buttonScanner} onPress={() => abrirSelecaoProduto()} onLongPress={() => setModalVisible(true)}>
                        <AntDesign
                            name='plus'
                            size={25}
                            color={themes.colors.secondary}
                        />
                    </TouchableOpacity>
                </View>
            </View>

            {option === 'Buy' ? (
                <View style={{ width: '100%', paddingTop: 10, justifyContent: 'flex-start', alignItems: 'flex-start', gap: 5 }}>
                <Text style={{ fontSize: 16, fontWeight: 'semibold', paddingHorizontal: 20 }}>Itens na Cotação: {filterItensCotacao.length}</Text>
                <View style={{ width: '100%', height: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', paddingHorizontal: 20, gap: 10 }}>

                    <TouchableOpacity style={{
                        backgroundColor: filtroOptions === 'all' ? 'green' : 'transparent',
                        borderWidth: 2,
                        borderColor: 'green',
                        height: 40,
                        width: 90,
                        borderRadius: 10,
                        alignItems: 'center',
                        justifyContent: 'center'
                    }} onPress={() =>{setFiltroOptions('all'); filtrarItens('all')}}>
                        <Text style={{ fontSize: 16, fontWeight: 'bold' }}>TODOS</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={{
                        backgroundColor: filtroOptions === 'Buy' ? 'green' : 'transparent',
                        borderWidth: 2,
                        borderColor: 'green',
                        height: 40,
                        width: 90,
                        borderRadius: 10,
                        alignItems: 'center',
                        justifyContent: 'center'
                    }} onPress={() =>{setFiltroOptions('Buy'); filtrarItens('buy')}}>
                        <Text style={{ fontSize: 16, fontWeight: 'bold' }}>COMPROS</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={{
                        backgroundColor: filtroOptions === '?' ? themes.colors.lightGray : 'transparent',
                        borderWidth: 2,
                        borderColor: themes.colors.lightGray,
                        height: 40,
                        width: 90,
                        borderRadius: 10,
                        alignItems: 'center',
                        justifyContent: 'center'
                    }} onPress={() =>{setFiltroOptions('?'); filtrarItens('?')}}>
                        <Text style={{ fontSize: 16, fontWeight: 'bold' }}>COMPRAR</Text>
                    </TouchableOpacity>

                </View>
            </View>                
            ) : null}
            
            <FlatList
                ref={flatListRef}
                style={{ width: '100%', paddingLeft: 10, paddingRight: 10 }}
                data={filterItensCotacao}
                keyExtractor={(itensCotacao) => itensCotacao.id.toString()}
                renderItem={({ item, index }) => (
                    <TouchableOpacity style={{
                        borderBottomWidth: 1,
                        borderBottomColor: themes.colors.lightGray,
                        paddingHorizontal: 10,
                        borderRadius: 5,
                        width: '100%',
                        flexDirection: 'row',
                        backgroundColor:
                            highlightedId === item.id ? 'lightskyblue' : 'transparent', // destaque amarelo claro
                    }}
                        onPress={() => selectItem(item.id)}>
                        <View
                            style={{
                                paddingVertical: 10,
                                width: '85%',
                            }}>

                            <Text style={{ fontWeight: 'bold' }}>
                                {item.descricao}
                            </Text>
                            <Text style={{ color: '#666' }}>{item.codbar ?? 'ITEM AVULSO (NOVO)'}</Text>
                            <Text style={{ color: '#666', fontSize: 12 }}>{(item.fornecedor as any)?.fornecedor ?? 'NÃO COMPRADO'}</Text>
                        </View>

                        {(option === 'Buy' || userId === item.created_for) && (
                            <View style={{
                                flexDirection: 'row',
                                gap: 15,
                                width: '15%',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>

                                <TouchableOpacity onPress={() => excluirItemCotacao(index, item.id)}>
                                    <MaterialIcons
                                        name='delete'
                                        size={25}
                                        color={themes.colors.primary}
                                    />
                                </TouchableOpacity>
                                <MaterialIcons
                                    name='circle'
                                    size={25}
                                    color={item?.fornecedor_id === null ? themes.colors.lightGray : 'green'}
                                />
                            </View>
                        )}

                    </TouchableOpacity>
                )}
            />

            <Modal
                transparent={true}
                animationType="slide"
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}>
                <View style={styles.modalOverlayCenter}>
                    <View style={styles.modalContentCenter}>
                        <Text style={[styles.modalTitle, { color: themes.colors.primary, marginBottom: 20 }]}>
                            Adicionar Item Avulso:
                        </Text>

                        <View style={[styles.boxInput, { width: '100%' }]}>
                            <TextInput style={[styles.input, { width: '100%' }]}
                                placeholder="Descricão do Produto"
                                placeholderTextColor={themes.colors.darkGray}
                                value={descricaoAvulso}
                                onChangeText={(text) => setDescricaoAvulso(text)}
                                keyboardType='default' />
                        </View>

                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 20, gap: 10, justifyContent: 'center' }}>
                            <TouchableOpacity
                                style={[styles.optionButton, { backgroundColor: 'transparent' }]}
                                onPress={() => setModalVisible(false)}>
                                <Text style={[styles.opitionText, { color: 'red' }]}>Cancelar</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.optionButton]}
                                onPress={() => adicionarItemCotacaoAvulso(descricaoAvulso)}>
                                <Text style={[styles.opitionText, { color: themes.colors.secondary }]}>Confirmar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

        </View>
    );
}