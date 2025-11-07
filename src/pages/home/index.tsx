import React from "react";
import { Text, View, TextInput, TouchableOpacity, Alert, ActivityIndicator, Image} from "react-native";
import { styles } from "./styles";
import { MaterialIcons } from "@expo/vector-icons";
import { themes } from "../../global/themes";
import { useNavigation, NavigationProp } from "@react-navigation/native";

export default function Home() {
  const navigation = useNavigation<NavigationProp<any>>();
  return ( 
    <View style={styles.container}>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Etiqueta')}>
          <Image 
            source={require('../../assets/icoEtiqueta.png')}
            style={{ width: 100, height: 100, marginBottom: 10 }}
            resizeMode="contain"
          />
          <Text style={styles.textButton}>ETIQUETAS DE GÔNDOLA</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('ListBalanco')}>
          <Image 
            source={require('../../assets/icoBalanco.png')}
            style={{ width: 100, height: 100, marginBottom: 10 }}
            resizeMode="contain"
          />
          <Text style={styles.textButton}>BALANÇOS</Text>
        </TouchableOpacity>
      
    </View>
    );
}