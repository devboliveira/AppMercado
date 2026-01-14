import React from "react";
import { Text, View, TextInput, TouchableOpacity, Alert, ActivityIndicator, Image, ScrollView } from "react-native";
import { styles } from "./styles";
import { MaterialIcons } from "@expo/vector-icons";
import { themes } from "../../global/themes";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { clearRegister, getRegister } from "../../services/asyncStorageService";
import { User } from "../../global/types";
import { Feather } from "@expo/vector-icons";

export default function Home() {
  const navigation = useNavigation<NavigationProp<any>>();
  const [userNivel, setUserNivel] = React.useState<number>(0);
  const [permissonUser, setPermissionUser] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    getAsyncStorage();
  }, []);

  React.useEffect(() => {
    setPermissionUser(userNivel >= 1);
  }, []);

  async function getAsyncStorage() {
    const user = await getRegister('@user');
    setUserNivel(user?.nivel || 0);
  }

  return (
    <ScrollView style={styles.container}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around', paddingHorizontal: 10, gap: 20, paddingVertical: 20 }}>

        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Etiqueta')}>
          <Image
            source={require('../../assets/icoEtiqueta.png')}
            style={{ width: 100, height: 100, marginBottom: 10 }}
            resizeMode="contain"
          />
          <Text style={styles.textButton}>ETIQUETAS DE GÔNDOLA</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('ListCotacao')}>
          <Image
            source={require('../../assets/icoCotacao.png')}
            style={{ width: 100, height: 100, marginBottom: 10 }}
            resizeMode="contain"
          />
          <Text style={styles.textButton}>COTAÇÕES</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('ListBalanco')}>
          <Image
            source={require('../../assets/icoBalanco.png')}
            style={{ width: 100, height: 100, marginBottom: 10 }}
            resizeMode="contain"
          />
          <Text style={styles.textButton}>BALANÇOS</Text>
        </TouchableOpacity>

        {
          userNivel >= 8 ?
            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Usuarios')}>
              <Feather name="users" size={100} color={themes.colors.secondary} style={{ marginBottom: 10 }} />
              <Text style={styles.textButton}>USUÁRIOS</Text>
            </TouchableOpacity> : null
        }
      </View>
    </ScrollView>
  );
}