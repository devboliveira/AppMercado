import React from "react";
import { Text, View, FlatList, TextInput, TouchableOpacity, ActivityIndicator, Alert, LayoutAnimation, Button, Modal, Pressable } from "react-native";
import { styles } from "./styles";
import { MaterialIcons, AntDesign } from "@expo/vector-icons";
import { themes } from "../../global/themes";
import { supabase } from "../../services/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BarcodeScannerModal from "../scanCode";
import { EtiquetaItem } from "./types";
import { getRegister, clearRegister } from "../../services/asyncStorageService";
import { useNavigation } from "@react-navigation/native";
import { Produto } from "../../global/types";

export default function Etiqueta() {
  const [etiquetas, setEtiquetas] = React.useState<EtiquetaItem[]>([]);
  const [filterEtiquetas, setFilterEtiquetas] = React.useState<EtiquetaItem[]>([]);
  const [pesquisa, setPesquisa] = React.useState<string>("");
  const [userId, setUserId] = React.useState<number | null>(null);
  const [loading, setLoading] = React.useState<boolean>(false);
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
    if (userId) {
      buscarEtiquetas();
    }
  }, [userId]);

  async function getAsyncStorage() {
    const user = await getRegister('@user');
    console.log('Usuário carregado do AsyncStorage:', user);
    setUserId(user?.id ?? null);
  }

  async function buscarEtiquetas() {
    if (!userId) return;

    const { data, error } = await supabase
      .from('tbEtiqueta')
      .select(`
                id,
                codbarra,
                quantidade,
                usuario,
                produto:tbProdutos!inner(DESCRICAO)
              `)
      .eq('usuario', userId)
      .order('id', { ascending: false });



    if (error) {
      console.error("Erro ao buscar etiquetas:", error.message);
      Alert.alert("Erro", "Não foi possível buscar as etiquetas.");
      return;
    }
    if (data) {
      const flattened = data.map(item => ({
        ...item,
        produto: item.produto?.[0] ?? null,
      }));
      setEtiquetas(data);
      setFilterEtiquetas(data);
      console.log("Etiquetas buscadas:", filterEtiquetas);
    }
  }

  function handlerSearch() {
    setPesquisa(pesquisa);
    if (pesquisa === "") {
      setFilterEtiquetas(etiquetas);
    }
    else {
      const filteredData = etiquetas.filter(item =>
        (item.produto as any)?.DESCRICAO.toLowerCase().includes(pesquisa.toLowerCase()) ||
        item.codbarra?.toString().includes(pesquisa.toLowerCase())
      );
      setFilterEtiquetas(filteredData);
    }
  }

  async function alterarQuantidade(index: number, novaQtd: number) {
    if (novaQtd < 0) novaQtd = 0;

    const novasEtiquetas = [...etiquetas];
    const novasFiltradas = [...filterEtiquetas];
    const idEtiqueta = novasEtiquetas[index].id;

    // Atualiza o estado local imediatamente
    novasEtiquetas[index].quantidade = novaQtd;
    if (novasFiltradas[index]) novasFiltradas[index].quantidade = novaQtd;

    // Se quantidade zerar → pedir confirmação
    if (novaQtd === 0) {
      Alert.alert(
        "Remover item",
        "Deseja realmente remover esta etiqueta?",
        [
          {
            text: "Cancelar",
            style: "cancel",
            onPress: () => {
              // Reverte para 1 e atualiza estado
              novasEtiquetas[index].quantidade = 1;
              if (novasFiltradas[index]) novasFiltradas[index].quantidade = 1;
              setEtiquetas([...novasEtiquetas]);
              setFilterEtiquetas([...novasFiltradas]);
              atualizarQuantidadeBanco(idEtiqueta, 1);
            },
          },
          {
            text: "Remover",
            style: "destructive",
            onPress: async () => {
              LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
              // Remove visualmente o item
              setEtiquetas(prev => prev.filter((_, i) => i !== index));
              setFilterEtiquetas(prev => prev.filter((_, i) => i !== index));

              // Exclui no banco
              try {
                const { error } = await supabase
                  .from("tbEtiqueta")
                  .delete()
                  .eq("id", idEtiqueta);

                if (error) {
                  console.error("Erro ao excluir etiqueta:", error.message);
                  Alert.alert("Erro", "Falha ao excluir a etiqueta.");
                } else {
                  console.log(`Etiqueta ${idEtiqueta} excluída com sucesso.`);
                }
              } catch (err) {
                console.error("Erro inesperado ao excluir etiqueta:", err);
              }
            },
          },
        ]
      );
      return;
    }

    // Se não for zero → apenas atualiza normalmente
    setEtiquetas(novasEtiquetas);
    setFilterEtiquetas(novasFiltradas);

    // Debounce para não floodar updates
    if (timeoutAtualizacao) clearTimeout(timeoutAtualizacao);

    timeoutAtualizacao = setTimeout(() => {
      atualizarQuantidadeBanco(idEtiqueta, novaQtd);
    }, 300);
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
        const existe = etiquetas.some((e) => e.codbarra === produto.CODBAR);
        if (existe) {
          focarItemExistente(produto.CODBAR);
        } else {
          setProdutoSelecionado(produto);
          setModalVisible(true);
        }
      },
    });
  }

  async function adicionarEtiqueta() {
    // Lógica para adicionar etiqueta com a quantidade especificada
    if (quantidade <= 0) {
      Alert.alert("Quantidade inválida", "A quantidade deve ser maior que zero.");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("tbEtiqueta")
        .insert([
          {
            codbarra: produtoSelecionado?.CODBAR ?? "",
            quantidade: quantidade,
            usuario: userId,
          },
        ])
        .select(`
        id,
        codbarra,
        quantidade,
        usuario,
        produto:tbProdutos(DESCRICAO)
      `);

      if (error) {
        console.error("Erro ao atualizar quantidade:", error.message);
        Alert.alert("Erro", "Falha ao atualizar a quantidade.");
        return;
      }

      if (data && data.length > 0) {
        const novaEtiqueta = data[0];

        // Atualiza a lista imediatamente no UX
        setEtiquetas((prev) => [novaEtiqueta, ...prev]);
        setFilterEtiquetas((prev) => [novaEtiqueta, ...prev]);
        console.log(`Etiqueta adicionada com sucesso.`);
      }

    } catch (err) {
      console.error("Erro inesperado ao atualizar quantidade:", err);
    }
    setModalVisible(false);
    setQuantidade(0);
  }

  // Função para rolar até o item existente
  function focarItemExistente(codbarra: number) {
    const index = etiquetas.findIndex((item) => item.codbarra === codbarra);
    if (index !== -1) {
      // Rola até o item
      flatListRef.current?.scrollToIndex({ index, animated: true });

      // Marca o item como destacado
      setHighlightedId(etiquetas[index].id);

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
            placeholder="Pesquisar etiqueta"
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
        data={filterEtiquetas}
        keyExtractor={(etiquetas) => etiquetas.id.toString()}
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
              }}
            >
              <Text style={{ fontWeight: 'bold' }}>
                {(item.produto as any)?.DESCRICAO ?? 'SEM DESCRICAO'}
              </Text>
              <Text>{item.codbarra}</Text>
            </View>

            {/* Input de quantidade */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
              <TouchableOpacity
                style={{
                  backgroundColor: themes.colors.primary,
                  padding: 5,
                  borderRadius: 5,
                  marginRight: 5,
                }}
                onPress={() => alterarQuantidade(index, (item.quantidade ?? 0) - 1)}
              >
                <AntDesign name="minus" size={16} color={themes.colors.secondary} />
              </TouchableOpacity>

              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: themes.colors.lightGray,
                  borderRadius: 5,
                  textAlign: 'center',
                  width: 50,
                  height: 30,
                }}
                keyboardType="numeric"
                value={String(item.quantidade ?? 0)}
                onChangeText={(valor) =>
                  alterarQuantidade(index, parseInt(valor) || 0)
                }
              />

              <TouchableOpacity
                style={{
                  backgroundColor: themes.colors.primary,
                  padding: 5,
                  borderRadius: 5,
                  marginLeft: 5,
                }}
                onPress={() => alterarQuantidade(index, (item.quantidade ?? 0) + 1)}
              >
                <AntDesign name="plus" size={16} color={themes.colors.secondary} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Modal de quantidade */}
      <Modal
        visible={modalVisible}
        transparent
        animationType='slide'
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay2}>
          <View style={styles.modalContent2}>
            <Text style={styles.modalTitulo}>
              QUANTIDADE ETIQUETAS PARA
              {produtoSelecionado?.DESCRICAO}
            </Text>
            {/* Input de quantidade */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 5 }}>
              <TouchableOpacity
                style={{
                  backgroundColor: themes.colors.primary,
                  padding: 5,
                  borderRadius: 5,
                  marginRight: 5,
                }}
                onPress={() => setQuantidade(quantidade - 1)}
              >
                <AntDesign name="minus" size={16} color={themes.colors.secondary} />
              </TouchableOpacity>

              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: themes.colors.lightGray,
                  borderRadius: 5,
                  textAlign: 'center',
                  width: 50,
                  height: 30,
                }}
                keyboardType='numeric'
                value={quantidade.toString()}
                onChangeText={(valor) => setQuantidade(parseInt(valor) || 0)}
              />

              <TouchableOpacity
                style={{
                  backgroundColor: themes.colors.primary,
                  padding: 5,
                  borderRadius: 5,
                  marginLeft: 5,
                }}
                onPress={() => setQuantidade(quantidade + 1)}
              >
                <AntDesign name="plus" size={16} color={themes.colors.secondary} />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBotoes}>
              <Pressable style={styles.opitionCancelButton} onPress={() => { setModalVisible(false); setQuantidade(0) }}>
                <Text style={styles.opitionCancelText}>Cancelar</Text>
              </Pressable>
              <Pressable style={[styles.opitionCancelButton, { backgroundColor: themes.colors.primary }]} onPress={() => adicionarEtiqueta()}>
                <Text style={[styles.opitionText, { color: themes.colors.secondary, fontWeight: 'semibold' }]}>Confirmar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}