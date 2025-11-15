import React from "react";
import { Text, View, TextInput, TouchableOpacity, Alert, ActivityIndicator, Image, Modal, Pressable, Button } from "react-native";
import { styles } from "./styles";
import { MaterialIcons, AntDesign } from "@expo/vector-icons";
import { themes } from "../../global/themes";
import { supabase } from "../../services/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BarcodeScannerModal from "../scanCode";
import { Produto, ItemBalanco, TotaisBalanco } from "./types";

export default function Balanco() {
  const [codigo, setCodigo] = React.useState('');
  const [qtd, setQtd] = React.useState('');
  const [produto, setProduto] = React.useState<Produto | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [itembalanco, setItemBalanco] = React.useState<TotaisBalanco | null>(null);
  const [balancoID, setBalancoID] = React.useState<number | null>(null);
  const [scannerVisible, setScannerVisible] = React.useState(false);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [userLevel, setUserLevel] = React.useState<number | null>(null);
  const [tipoBalanco, setTipoBalanco] = React.useState<string>('GONDOLA');
  const [userId, setUserId] = React.useState<number | null>(null);
  const [modalOptionVisible, setModalOptionVisible] = React.useState(false);

  //Resetar formulário
  const resetForm = () => {
    setProduto(null);
    setItemBalanco(null);
    setCodigo('');
    setQtd('');
  };

  // Função para criar o objeto de registro de balanço
  const criarRegistroBalanco = (quantidade: number) => ({
    codbar: codigo,
    quantidade,
    balanco: balancoID,
    descricao: produto?.DESCRICAO,
    tipo: tipoBalanco,
    usuario_id: userId,
  });

  // Carregar ID do balanço selecionado
  async function loadBalancoID() {
    const stored = await AsyncStorage.getItem("@selectedBalanco");
    if (stored) {
      const parsed = JSON.parse(stored);
      setBalancoID(Number(stored));
    }
  }

  // Carregar informações do usuário
  async function loadUser() {
    const stored = await AsyncStorage.getItem("@user");
    if (stored) {
      const parsed = JSON.parse(stored);
      setUserLevel(parsed.nivel);
      setUserId(parsed.id);
    }
  }

  // Carregar dados iniciais
  React.useEffect(() => {
    loadBalancoID();
    loadUser();
  }, []);

  // Exibir modal quando o userLevel for carregado
  React.useEffect(() => {
    if (userLevel !== null && userLevel >= 6) {
      setModalOptionVisible(true);
    }
  }, [userLevel]);

  //Fazer o scanner
  function handleScanned(data: string) {
    setCodigo(data);          // joga no input
    buscarProduto(data); // opcional: chama a busca automaticamente
  }
  // Função para buscar produto pelo código de barras
  async function buscarProduto(cod?: string) {
    try {
      const valor = cod ?? codigo; // usa o parâmetro, senão pega do estado

      if (!valor) {
        return Alert.alert("Atenção", "Digite um código de barras");
      }

      setLoading(true);
      const codNumber = Number(valor);

      const { data, error } = await supabase
        .from("tbProdutos")
        .select("*")
        .eq("CODBAR", codNumber)
        .single();

      if (error) {
        console.log(error);
        Alert.alert("Erro", "Produto não encontrado");
        setProduto(null);
      } else {
        
        if(data.associado === 1){
          Alert.alert("Atenção", "Produto associado, verifique o item principal!");
          setProduto(null);
        } else{
          await verificarBalanco(codNumber);
          setProduto(data);
        }
      }
    } catch (err) {
      console.log(err);
      Alert.alert("Erro", "Falha ao buscar produto");
    } finally {
      setLoading(false);
    }
  }


  async function verificarBalanco(cod: number) {
    try {
      const codNumber = Number(cod);

      const { data: registros, error } = await supabase
        .from("tbBalanco")
        .select("*")
        .eq("codbar", codNumber)
        .eq("balanco", balancoID);

      if (error) {
        console.log(error);
        setItemBalanco(null);
        return;
      }

      if (registros && registros.length > 0) {
        const totais: TotaisBalanco = {
          gondola: registros
            .filter(r => r.tipo === 'GONDOLA')
            .reduce((sum, r) => sum + r.quantidade, 0),
          deposito: registros
            .filter(r => r.tipo === 'DEPOSITO')
            .reduce((sum, r) => sum + r.quantidade, 0),
          registros
        };

        setItemBalanco(totais);
        Alert.alert(
          "Atenção",
          `Produto já lançado no balanço!\nGôndola: ${totais.gondola}\nDepósito: ${totais.deposito}`
        );
      } else {
        setItemBalanco({ gondola: 0, deposito: 0, registros: [] });
      }
    } catch (err) {
      console.log(err);
      Alert.alert("Erro", "Falha ao buscar produto");
    }
  }

  async function inserirBalanco(value: number) {
    try {

      // 1. Pega a string do input. Se estiver vazia ou nula, considera "0".
    const valorString = value.toString();

    // 2. Substitui a vírgula (,) por ponto (.)
    // Isso padroniza o formato decimal para o JavaScript entender.
    const valorComPonto = valorString.replace(',', '.');

    // 3. Converte a string (já com ponto) para um número de ponto flutuante (float)
    const quantidade = parseFloat(valorComPonto);

      setLoading(true);

      if (!produto) {
        return Alert.alert("Atenção", "Nenhum produto selecionado");
      }

      if (!qtd) {
        return Alert.alert("Atenção", "Digite uma quantidade para adicionar");
      }

      const registro = criarRegistroBalanco(quantidade);
      const { data, error } = await supabase
        .from("tbBalanco")
        .insert([registro])
        .select();

      if (error) {
        console.error(error);
        Alert.alert("Erro", "Não foi possível inserir o registro de balanço");
        return null;
      }

      Alert.alert("Sucesso", `${itembalanco ? "Quantidade adicionada" : "Item adicionado"} ao balanço`);
      resetForm();
      return data;
    } catch (err) {
      console.error(err);
      Alert.alert("Erro", "Falha inesperada ao inserir balanço");
      return null;
    } finally {
      setLoading(false);
    }
  }

  async function inserirBalancoOptions(option: string, quantidade: number) {
    try {
      if (!produto || !qtd) {
        const mensagem = !produto ? "Nenhum produto selecionado" : "Digite uma quantidade para adicionar";
        return Alert.alert("Atenção", mensagem);
      }

      if (option === 'subtrair') {
        const novoTotal = (itembalanco?.[tipoBalanco.toLowerCase() as 'gondola' | 'deposito'] || 0) - quantidade;
        if (novoTotal < 0) {
          return Alert.alert("Erro", "Quantidade resultante seria negativa");
        }

        const registro = criarRegistroBalanco(quantidade * -1);
        const { data, error } = await supabase
          .from("tbBalanco")
          .insert([registro])
          .select();

        if (error) {
          console.error(error);
          Alert.alert("Erro", "Não foi possível realizar a subtração");
          return null;
        }

        Alert.alert("Sucesso", "Quantidade subtraída do balanço");
        await verificarBalanco(Number(codigo));
        resetForm();
        setModalVisible(false);
        return data;
      } else {
        // Para substituição, inserimos um registro negativo para zerar e outro com o novo valor
        const totalAtual = itembalanco?.[tipoBalanco.toLowerCase() as 'gondola' | 'deposito'] || 0;
        if (totalAtual > 0) {
          await supabase
            .from("tbBalanco")
            .insert([criarRegistroBalanco(-totalAtual)])
            .select();
        }

        const { data, error } = await supabase
          .from("tbBalanco")
          .insert([criarRegistroBalanco(quantidade)])
          .select();

        if (error) {
          console.error(error);
          Alert.alert("Erro", "Não foi possível realizar a substituição");
          return null;
        }

        Alert.alert("Sucesso", "Quantidade substituída no balanço");
        await verificarBalanco(Number(codigo));
        resetForm();
        setModalVisible(false);
        return data;
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Erro", "Falha inesperada ao inserir balanço");
      return null;
    }
  }

  //Página de balanço de estoque
  return (
    <View style={styles.container}>
      {/* Barra de pesquisa */}
      <View style={[styles.searchBarBox, { gap: 10 }]}>
        <View style={styles.boxInput}>
          <TextInput
            style={styles.input}
            returnKeyType='done'
            placeholder="Pesquisar código de barras"
            placeholderTextColor={themes.colors.darkGray}
            keyboardType="numeric"
            value={codigo}
            onChangeText={(e) => setCodigo(e)}
            onSubmitEditing={() => buscarProduto()} // busca ao apertar enter
          />
          <TouchableOpacity onPress={() => buscarProduto()}>
            {loading ? (
              <ActivityIndicator size="small" color={themes.colors.primary} />
            ) : (
              <MaterialIcons name="search" size={20} color="gray" />
            )}
          </TouchableOpacity>
        </View>

        <View style={{ width: "15%", flexDirection: "row-reverse" }}>
          <TouchableOpacity style={styles.buttonScanner} onPress={() => setScannerVisible(true)}>
            <AntDesign
              name="barcode"
              size={25}
              color={themes.colors.secondary}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.separator} />

      {/* Exibir informações do produto */}
      {produto ? (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "flex-start",
            width: "100%",
          }}
        >
          <Image
            source={require("../../assets/icoBalanco.png")}
            style={{ width: 100, height: 100, resizeMode: "contain" }}
          />

          <View
            style={{
              paddingLeft: 15,
              justifyContent: "center",
              height: 140,
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: "bold",
                color: themes.colors.primary,
              }}>
              {produto.DESCRICAO}
            </Text>

            <Text style={{ fontSize: 16, color: themes.colors.darkGray }}>
              {produto.CODBAR}
            </Text>

            <View style={{ width: '100%', gap: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: 16, color: 'gray', fontWeight: 'bold' }}>GÔNDOLA:</Text>
                <View style={[styles.boxInput, { width: 70, marginLeft: 10, height: 30, alignItems: 'center', justifyContent: 'center' }]}>
                  <Text style={{ fontSize: 16, color: 'black', fontWeight: 'bold' }}>
                    {itembalanco?.gondola || 0}
                  </Text>
                </View>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: 16, color: 'gray', fontWeight: 'bold' }}>DEPÓSITO:</Text>
                <View style={[styles.boxInput, { width: 70, marginLeft: 10, height: 30, alignItems: 'center', justifyContent: 'center' }]}>
                  <Text style={{ fontSize: 16, color: 'black', fontWeight: 'bold' }}>
                    {itembalanco?.deposito || 0}
                  </Text>
                </View>
              </View>
            </View>
          </View>

        </View>

      ) : (
        <Text style={{ marginTop: 20, color: "gray" }}>
          Nenhum produto carregado
        </Text>
      )}

      <View style={styles.separator} />

      <View style={{ width: '100%', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
        <Text style={{ fontSize: 24, color: themes.colors.primary, fontWeight: 'bold', paddingTop: 8 }}>LANÇAR BALANÇO</Text>

        <View style={[styles.boxInput, { width: 100 }]}>

          <TextInput
            style={[styles.input, { fontSize: 16, textAlign: 'center' }]}
            keyboardType="numeric"
            returnKeyType='done'
            value={qtd}
            onChangeText={(e) => setQtd(e)}
          />
        </View>

        <TouchableOpacity style={[styles.buttonScanner, { width: 200, backgroundColor: themes.colors.lightGray }]} onPress={() => inserirBalanco(Number(qtd))} disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color={themes.colors.primary} />
          ) : (
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
            <MaterialIcons
              name='add'
              size={30}
              color={'green'}
            />
            <Text style={[styles.textButton, { color: 'green' }]}>ADICIONAR</Text>
          </View>)}
        </TouchableOpacity>

      </View>

      {userLevel !== null && userLevel >= 6 && (
        <View style={{ alignItems: 'center', justifyContent: 'flex-end', width: '100%', padding: 100 }}>
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Text style={{ fontStyle: 'italic', color: 'blue', textDecorationLine: 'underline' }}>Outras opções</Text>
          </TouchableOpacity>
        </View>
      )}

      <BarcodeScannerModal
        visible={scannerVisible}
        onClose={() => setScannerVisible(false)}
        onScanned={handleScanned}
      />

      <Modal
        transparent={true}
        animationType="slide"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Button title="Subtrair" onPress={() => inserirBalancoOptions('subtrair', Number(qtd))} />
            <View style={styles.separator} />
            <Button title="Ver Logs" onPress={() => inserirBalancoOptions('Substituir', Number(qtd))} />
            <View style={styles.separator} />
            <Button title="Fechar" onPress={() => setModalVisible(false)} color="red" />
          </View>
        </View>
      </Modal>

      <Modal
        transparent={true}
        animationType="slide"
        visible={modalOptionVisible}
      >
        <View style={styles.modalOverlay2}>
          <View style={styles.modalContent2}>
            <Text style={styles.modalTitle}>
              Qual local de realização da contagem?
            </Text>

            <Pressable
              style={styles.opitionButton}
              onPress={() => {setTipoBalanco('DEPOSITO');
              setModalOptionVisible(false)}}
            >
              <Text style={{ color: themes.colors.white, fontSize: 16, fontWeight: 'bold' }}>DEPOSITO</Text>
            </Pressable>

            <View style={styles.separator} />

            <Pressable
              style={styles.opitionButton}
              onPress={() => {setTipoBalanco('GONDOLA');
              setModalOptionVisible(false)}}
            >
              <Text style={{ color: themes.colors.white, fontSize: 16, fontWeight: 'bold' }}>GÔNDOLAS</Text>
            </Pressable>

          </View>
        </View>
      </Modal>

    </View>
  );
}