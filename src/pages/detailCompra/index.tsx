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
import { Produto, CotacaoItem, Fornecedor } from "../../global/types";
import { Dropdown } from 'react-native-element-dropdown';


export default function DetailCompra({ route }: any) {
    const [fornecedores, setFornecedores] = React.useState<Fornecedor[]>([]);
    const [itemID, setItemID] = React.useState<number | null>(null);
    const { compraId } = route.params.compraId;
    const [fornecedor, setFornecedor] = React.useState<number>(0);
    const [qtdCompra, setQtdCompra] = React.useState('');
    const [valorCompra, setValorCompra] = React.useState('');
    const [temBonificacao, setTemBonificacao] = React.useState(false);
    const [descricaoBonificacao, setDescricaoBonificacao] = React.useState('');
    const [itemCotacao, setItemCotacao] = React.useState<CotacaoItem | null>(null);
    const [valorCompraText, setValorCompraText] = React.useState('');
    const [valorCompraNumber, setValorCompraNumber] = React.useState<number>(0);
    const formatarValor = (valor: number) => {
        if (!valor) return '';
        const valorFormatado = Number(valor);
        return valorFormatado.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        });
    };

    async function loadFornecedores() {
        try {
            const { data, error } = await supabase
                .from('tbFornecedores')
                .select('id, fornecedor')
                .order('fornecedor', { ascending: true });
            if (error) {
                console.error("Erro ao carregar fornecedores:", error.message);
            } else {
                setFornecedores(data);
            }
        } catch (err) {
            console.error("Erro inesperado ao carregar fornecedores:", err);
        }
    }

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
        loadFornecedores();
    }, []);

    React.useEffect(() => {
        console.log("Carregando detalhes da compra para ID:", itemID);
        if (itemID !== null) {
            loadCompraDetails(itemID);
            loadFornecedores();
        }

    }, [itemID]);

    function formatMoneyBR(value: string): string {
        // Remove tudo que não for número
        const onlyNumbers = value.replace(/\D/g, '');

        if (!onlyNumbers) return '';

        // Converte para centavos
        const number = Number(onlyNumbers) / 100;

        return number.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        });
    }


    function handleValorCompraChange(text: string) {
        const formatted = formatMoneyBR(text);
        setValorCompraText(formatted);

        // Mantém valor numérico limpo (para salvar no banco)
        const numeric = Number(text.replace(/\D/g, '')) / 100;
        setValorCompraNumber(numeric);
    }


    return (
        <View style={styles.container}>

            <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    width: '100%',
                }}>
                <Image
                    source={require("../../assets/icoBalanco.png")}
                    style={{ width: 100, height: 100, resizeMode: "contain" }}
                />

                <View
                    style={{
                        width: '80%',
                        paddingLeft: 15,
                        justifyContent: "center",
                        height: 140,
                    }}>
                    <Text
                        style={{
                            fontSize: 20,
                            fontWeight: "bold",
                            color: themes.colors.primary,
                            width: '100%',
                        }}>
                        {itemCotacao?.descricao}
                    </Text>

                    <Text style={{ fontSize: 16, color: themes.colors.darkGray }}>
                        {itemCotacao?.codbar}
                    </Text>

                    <Text style={{ fontSize: 16, color: themes.colors.darkGray }}>
                        Estoque Atual: {itemCotacao && (itemCotacao?.produto as any)?.ESTOQ}
                    </Text>

                    <Text style={{ fontSize: 16, color: themes.colors.darkGray }}>
                        Custo: {formatarValor((itemCotacao?.produto as any)?.CUSTO)} -- Margem: {itemCotacao && (itemCotacao?.produto as any)?.PRVENDA ? (((((itemCotacao?.produto as any)?.PRVENDA - (itemCotacao?.produto as any)?.CUSTO) / (itemCotacao?.produto as any)?.CUSTO) * 100).toFixed(2)) : '0'}%
                    </Text>

                    <Text style={{ fontSize: 16, color: themes.colors.darkGray }}>
                        Venda: {formatarValor((itemCotacao?.produto as any)?.PRVENDA)}
                    </Text>
                </View>
            </View>

            <View style={styles.separator} />

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}>
                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={{
                        flexGrow: 1,
                        paddingBottom: 40,
                        width: '100%',
                    }}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}>

                    <View style={{ width: '100%', gap: 10 }}>
                        {/* Produto (se existir) */}
                        <Text style={styles.title}>DADOS DA COMPRA</Text>

                        {/* Fornecedor */}
                        <View>
                            <Text style={styles.label}>Fornecedor</Text>
                            <View style={[styles.boxInputForm, { width: '100%' }]}>
                                <Dropdown
                                    data={fornecedores}
                                    containerStyle={{ backgroundColor: themes.colors.lightGray, borderRadius: 8 }}
                                    maxHeight={250}
                                    style={{ width: '100%' }}
                                    labelField="fornecedor"
                                    valueField='id'
                                    value={fornecedor}
                                    placeholder="Selecione o fornecedor..."
                                    placeholderStyle={{ color: themes.colors.darkGray, fontStyle: 'italic' }}
                                    search
                                    searchPlaceholder="Pesquisar Fornecedor..."
                                    onChange={(item) => setFornecedor(item.id)} />

                            </View>
                        </View>

                        {/* Quantidade */}
                        <View>
                            <Text style={styles.label}>Quantidade comprada</Text>
                            <View style={[styles.boxInputForm, { width: '100%' }]}>
                                <TextInput
                                    style={styles.inputForm}
                                    keyboardType="numeric"
                                    placeholder="0"
                                    value={qtdCompra}
                                    onChangeText={setQtdCompra}
                                />
                            </View>
                        </View>

                        {/* Valor */}
                        <View>
                            <Text style={styles.label}>Valor de compra</Text>
                            <View style={[styles.boxInputForm, { width: '100%' }]}>
                                <TextInput
                                    style={styles.inputForm}
                                    keyboardType='number-pad'
                                    placeholder="R$ 0,00"
                                    value={valorCompraText}
                                    onChangeText={handleValorCompraChange}
                                />
                            </View>
                        </View>


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
                                <View>
                                    <Text style={styles.label}>Descrição da bonificação</Text>
                                    <View style={[styles.boxInputForm, { width: '100%', height: 100 }]}>
                                        <TextInput
                                            style={[styles.inputForm]}
                                            multiline
                                            value={descricaoBonificacao}
                                            onChangeText={setDescricaoBonificacao}
                                        />
                                    </View>
                                </View>
                            </>
                        )}

                        {/* Botão */}
                        <TouchableOpacity style={[styles.optionButton, { alignItems: 'center', justifyContent: 'center', height: 50, borderRadius: 40, padding: 0, marginTop: 0 }]}>
                            <Text style={[styles.opitionText, { color: themes.colors.secondary }]}>Salvar Compra</Text>
                        </TouchableOpacity>
                    </View>

                </ScrollView>

            </KeyboardAvoidingView>

        </View>
    );
}