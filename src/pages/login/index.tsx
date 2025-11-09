import React from "react";
import { Text, View, TextInput, TouchableOpacity, Alert, ActivityIndicator} from "react-native";
import { styles } from "./style";
import { MaterialIcons } from "@expo/vector-icons";
import { themes } from "../../global/themes";
import { supabase } from "../../services/supabase";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Login() {
    const navigation = useNavigation<NavigationProp<any>>();
    const [user, setUser] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [loading, setLoading] = React.useState(false);

    async function getLogin() {
        try {
            setLoading(true);

            //Validação dos campos
            if (!user || !password) {
                return Alert.alert("Atenção", "Preencha todos os campos!");
            }

            //Consulta no Supabase para verificar usuário e senha
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

            //Salvar dados do usuário no AsyncStorage
            await AsyncStorage.setItem("@user", JSON.stringify(data));
            
            // Navegar para a tela Home
            navigation.reset({
                routes: [{ name: "Home" }],
            });

        } 
        catch (error) {
            console.log(error);
            Alert.alert("Erro", "Não foi possível realizar o login");
        } 
        finally {
            setLoading(false);
        }
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
                onChangeText={(e) => setUser(e)}/>
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
                onSubmitEditing={()=>getLogin()}/>
            <MaterialIcons 
                name='lock' 
                size={20} 
                color="gray" />

        </View>

      </View>

      <View style={styles.bottomView}>
        <TouchableOpacity style={styles.button} onPress={()=>getLogin()}>
            {
                loading ? <ActivityIndicator color={themes.colors.white} /> : <Text style={styles.textButton}>ENTRAR</Text>
            }
        </TouchableOpacity>
      </View>

    </View>
  );
}