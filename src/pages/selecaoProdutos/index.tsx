// src/pages/selecaoProdutos.tsx
import React, { useState, useEffect } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { supabase } from "../../services/supabase";
import { themes } from "../../global/themes";
import type { RootStackParamList, Produto } from "../../global/types";
import type { StackScreenProps } from "@react-navigation/stack";
import { MaterialIcons, AntDesign } from "@expo/vector-icons";
import { styles } from "./styles";
import BarcodeScannerModal from "../scanCode";

type Props = StackScreenProps<RootStackParamList, "SelecaoProduto">;

export default function SelecaoProduto({ route, navigation }: Props) {
    const onSelect = route.params?.onSelect;
    const [produtos, setProdutos] = useState<Produto[]>([]);
    const [pesquisa, setPesquisa] = useState("");
    const [loading, setLoading] = useState(false);
    const [scannerVisible, setScannerVisible] = useState(false);
    const [codigo, setCodigo] = useState<string>("");

    useEffect(() => {
        buscarProdutos();
    }, []);

    function handleScanned (data : string){
        buscarProdutos(data)
    }

    async function buscarProdutos(filtro = "") {
        setLoading(true);
        try {
            let query = supabase
                .from("tbProdutos")
                .select("CODBAR, DESCRICAO, PRVENDA")
                .order("DESCRICAO", { ascending: true })
                .limit(50);

            if (filtro) {
                // Verifica se o filtro é numérico (provável busca por código de barras)
                const isNumero = /^\d+$/.test(filtro);

                if (isNumero) {
                    // Busca exata se for só números (melhor desempenho)
                    //query = query.eq("CODBAR", filtro);
                    query = query.or(`CODBAR.eq.${filtro},DESCRICAO.ilike.%${filtro}%`);
                } else {
                    // Busca textual
                    query = query.ilike("DESCRICAO", `%${filtro}%`);
                }
            }

            const { data, error } = await query;

            if (error) {
                console.error("Erro buscarProdutos:", error);
                setProdutos([]);
                return;
            }

            setProdutos((data as Produto[]) || []);
        } finally {
            setLoading(false);
        }
    }


    function selecionarProduto(item: Produto) {
        if (onSelect && typeof onSelect === "function") {
            onSelect(item);
        }
        navigation.goBack();
    }

    return (
        <View style={{ flex: 1, paddingHorizontal: 15, backgroundColor: "white", paddingTop: 10 }}>
            <View style={[styles.searchBarBox, { gap: 10 }]}>
                <View style={styles.boxInput}>
                    <TextInput
                        style={styles.input}
                        returnKeyType='done'
                        placeholder="Pesquisar produto..."
                        placeholderTextColor={themes.colors.darkGray}
                        keyboardType='default'
                        value={pesquisa}
                        onChangeText={setPesquisa}
                        onSubmitEditing={() => buscarProdutos(pesquisa)}// busca ao apertar enter
                    />
                    <TouchableOpacity onPress={() => buscarProdutos(pesquisa)}>
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
            {loading ? (
                <ActivityIndicator size="large" color={themes.colors.primary} />
            ) : (
                <FlatList
                    data={produtos}
                    keyExtractor={(item) => item.CODBAR.toString()}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={{ paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: themes.colors.lightGray }}
                            onPress={() => selecionarProduto(item)}
                        >
                            <Text style={{ fontWeight: "bold" }}>{item.DESCRICAO}</Text>
                            <Text style={{ color: "gray" }}>{item.CODBAR}</Text>
                            <Text style={{ color: "gray" }}>{item.PRVENDA.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Text>
                        </TouchableOpacity>
                    )}
                />
            )}
            <BarcodeScannerModal
                visible={scannerVisible}
                onClose={() => setScannerVisible(false)}
                onScanned={handleScanned}
            />
        </View>
    );
}
