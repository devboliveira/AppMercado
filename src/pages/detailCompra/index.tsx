import React from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Image,
    Switch,
} from 'react-native';
import { styles } from "../../global/styles";
import { MaterialIcons, AntDesign } from "@expo/vector-icons";
import { themes } from "../../global/themes";
import { supabase } from "../../services/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BarcodeScannerModal from "../scanCode";
import { Produto, CotacaoItem } from "../../global/types";

export default function DetailCompra({ route }: any) {
    const [itemID, setItemID] = React.useState<number | null>(null);
    const { compraId } = route.params.compraId;
    const [fornecedor, setFornecedor] = React.useState('');
    const [qtdCompra, setQtdCompra] = React.useState('');
    const [valorCompra, setValorCompra] = React.useState('');
    const [temBonificacao, setTemBonificacao] = React.useState(false);
    const [descricaoBonificacao, setDescricaoBonificacao] = React.useState('');
    const [itemCotacao, setItemCotacao] = React.useState<CotacaoItem | null>(null);


    async function loadCompraDetails(id: number) {
        try {
            const { data, error } = await supabase
                        .from('tbCotacoes')
                        .select(`
                            id,
                            codbar,
                            descricao,
                            created_for,
                            cotacao_id,
                            fornecedor_id,
                            data_compra,
                            qtd_compra,
                            valor_compra,
                            bonificacao,
                            desc_bonificacao,
                            produto:tbProdutos(DESCRICAO, ESTOQ, PRVENDA, CUSTO),
                            fornecedor:tbFornecedores(fornecedor)
                          `)
                        .eq('id', id);
            

            if (error) {
                console.error("Erro ao carregar detalhes da compra:", error.message);
            } else if (data && data.length > 0) {
                const item = data[0];
                setFornecedor((item.fornecedor as any)?.fornecedor);
                setQtdCompra(item.qtd_compra);
                setValorCompra(item.valor_compra);
                setTemBonificacao(item.bonificacao);
                setDescricaoBonificacao(item.desc_bonificacao);
                setItemCotacao(item);
            }
        } catch (err) {
            console.error("Erro inesperado ao carregar detalhes da compra:", err);
        }
    }

    React.useEffect(() => {
        setItemID(route.params.compraId);
    }, []);

    React.useEffect(() => {
        console.log("Carregando detalhes da compra para ID:", itemID);
        if (itemID !== null){
            loadCompraDetails(itemID);
        }
        
    }, [itemID]);

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
        >
            <ScrollView
                contentContainerStyle={{ padding: 16 }}
                keyboardShouldPersistTaps="handled">

                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "flex-start",
                        width: "100%",
                    }}>
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
                            {itemCotacao?.descricao}
                        </Text>

                        <Text style={{ fontSize: 16, color: themes.colors.darkGray }}>
                            {itemCotacao?.codbar}
                        </Text>

                        <Text style={{ fontSize: 16, color: themes.colors.darkGray }}>
                            ESTOQUE ATUAL: {itemCotacao && (itemCotacao?.produto as any)?.ESTOQ}
                        </Text>

                        <Text style={{ fontSize: 16, color: themes.colors.darkGray }}>
                            CUSTO: {itemCotacao && (itemCotacao?.produto as any)?.CUSTO}
                        </Text>
                    </View>
                </View>

                {/* Produto (se existir) */}
                <Text style={styles.title}>Dados da Compra</Text>


                {/* Fornecedor */}
                <Text style={styles.label}>Fornecedor</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Nome do fornecedor"
                    value={fornecedor}
                    onChangeText={setFornecedor}
                />

                {/* Quantidade */}
                <Text style={styles.label}>Quantidade comprada</Text>
                <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={qtdCompra}
                    onChangeText={setQtdCompra}
                />

                {/* Valor */}
                <Text style={styles.label}>Valor de compra</Text>
                <TextInput
                    style={styles.input}
                    keyboardType="decimal-pad"
                    value={valorCompra}
                    onChangeText={setValorCompra}
                />

                {/* Bonificação */}
                <View style={styles.switchRow}>
                    <Text style={styles.label}>Possui bonificação?</Text>
                    <Switch
                        value={temBonificacao}
                        onValueChange={setTemBonificacao}
                    />
                </View>

                {/* Descrição da bonificação */}
                {temBonificacao && (
                    <>
                        <Text style={styles.label}>Descrição da bonificação</Text>
                        <TextInput
                            style={[styles.input, { height: 80 }]}
                            multiline
                            value={descricaoBonificacao}
                            onChangeText={setDescricaoBonificacao}
                        />
                    </>
                )}

                {/* Botão */}
                <TouchableOpacity style={styles.optionButton}>
                    <Text style={styles.optionButton}>Salvar compra</Text>
                </TouchableOpacity>

            </ScrollView>
        </KeyboardAvoidingView>

    );
}