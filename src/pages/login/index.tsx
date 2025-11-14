import React, { useEffect, useState } from "react";
import { Text, View, TextInput, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { styles } from "./style";
import { MaterialIcons } from "@expo/vector-icons";
import { themes } from "../../global/themes";
import { supabase } from "../../services/supabase";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Updates from "expo-updates";

export default function Login() {
    const navigation = useNavigation<NavigationProp<any>>();
    const [user, setUser] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [checkingUpdate, setCheckingUpdate] = useState(true);

    // 🚀 Verifica e aplica atualizações OTA assim que o app abre
    useEffect(() => {
        async function checkForUpdates() {
            try {
                const update = await Updates.checkForUpdateAsync();
                if (update.isAvailable) {
                    console.log("Nova atualização disponível! Baixando...");
                    await Updates.fetchUpdateAsync();
                    await Updates.reloadAsync(); // Reinicia o app aplicando a nova versão
                }
            } catch (e) {
                console.log("Erro ao verificar atualização:", e);
            } finally {
                setCheckingUpdate(false);
            }
        }
        checkForUpdates();
    }, []);

    async function getLogin() {
        try {
            setLoading(true);

            if (!user || !password) {
                return Alert.alert("Atenção", "Preencha todos os campos!");
            }

            const { data, error } = await supabase
                .from("tbUsuarios")
                .select("*")
                .eq("usuario", user)
                .eq("senha", password)
                .eq("status", "ATIVO")
                .single();

            if (error || !data) {
                console.log(error);
                return Alert.alert("Erro", "Usuário ou senha inválidos!");
            }

            console.log("Logado com sucesso!");
            await AsyncStorage.setItem("@user", JSON.stringify(data));

            navigation.reset({
                routes: [{ name: "Home" }],
            });

        } catch (error) {
            console.log(error);
            Alert.alert("Erro", "Não foi possível realizar o login");
        } finally {
            setLoading(false);
        }
    }

    // Enquanto verifica atualização, mostra um pequeno loading
    if (checkingUpdate) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={themes.colors.secondary} />
                <Text style={{ color: themes.colors.secondary, marginTop: 10 }}>Verificando atualizações...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>

            <View style={styles.topView}>
                <Text style={styles.title}>LOGIN</Text>
            </View>

            <View style={styles.midView}>

                <Text style={styles.titleInput}>USUÁRIO</Text>

                <View style={styles.boxInput}>
                    <TextInput
                        style={styles.input}
                        placeholder="Usuário"
                        placeholderTextColor={themes.colors.darkGray}
                        autoCapitalize='none'
                        autoCorrect={false}
                        value={user}
                        onChangeText={(e) => setUser(e)} />
                    <MaterialIcons
                        name='person'
                        size={20}
                        color="gray" />
                </View>

                <Text style={styles.titleInput}>SENHA</Text>
                <View style={styles.boxInput}>
                    <TextInput
                        style={styles.input}
                        placeholder="Senha"
                        placeholderTextColor={themes.colors.darkGray}
                        secureTextEntry
                        value={password}
                        onChangeText={(e) => setPassword(e)}
                        onSubmitEditing={() => getLogin()} />
                    <MaterialIcons
                        name='lock'
                        size={20}
                        color="gray" />
                </View>

            </View>

            <View style={styles.bottomView}>
                <TouchableOpacity style={styles.button} onPress={() => getLogin()} disabled={loading}>
                    {
                        loading ? <ActivityIndicator color={themes.colors.secondary} /> : <Text style={styles.textButton}>ENTRAR</Text>
                    }
                </TouchableOpacity>
            </View>

        </View>
    );
}
