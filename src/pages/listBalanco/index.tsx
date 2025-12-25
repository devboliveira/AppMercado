import React, { useEffect, useState } from "react";
import { Text, View, TextInput, TouchableOpacity, Alert, ActivityIndicator, Image, FlatList, StyleSheet, Modal, Pressable } from "react-native";
import { styles } from "./styles";
import { supabase } from "../../services/supabase";
import { MaterialIcons } from "@expo/vector-icons";
import { themes } from "../../global/themes";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, NavigationProp } from "@react-navigation/native";

type Balanco = {
  id: number;
  created_at: any;
  descricao: string;
  status: string;
  created_for: string;
  observacoes: string;
};

export default function ListBalanco() {

  const [balancos, setBalancos] = useState<Balanco[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [userLevel, setUserLevel] = useState<number | null>(null);
  const navigation = useNavigation<NavigationProp<any>>();

  async function loadUser() {
    const stored = await AsyncStorage.getItem("@user");
    if (stored) {
      const parsed = JSON.parse(stored);
      setUserLevel(parsed.nivel);
    }
  }

  async function loadBalancos() {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("tbListBalanco")
        .select("*")
        .order("id", { ascending: true });

      if (error) {
        console.log(error);
        return Alert.alert("Erro", "Não foi possível carregar os produtos");
      }

      setBalancos(data || []);

    }
    catch (e) {
      console.log(e);
      Alert.alert("Erro", "Falha ao carregar dados");
    }
    finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBalancos();
    loadUser();
  }, []);

  function handleSelect(id: number) {
    setSelectedId(id);
    setModalVisible(true);
    console.log("Selecionado:", id);
  }

  function closeModal() {
    setSelectedId(null);
    setModalVisible(false);
  }

  async function handleOption(option: string) {

    if (option === "Balanco") {
      //Salvar selectedID no AsyncStorage
      await AsyncStorage.setItem("@selectedBalanco", JSON.stringify(selectedId));
      navigation.navigate("Balanco");
    }

    closeModal();
  }

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <FlatList
          style={{ width: '100%', padding: 10 }}
          data={balancos}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => {
            const isSelected = selectedId === item.id;
            return (
              <TouchableOpacity
                onPress={() => handleSelect(item.id)}
                style={[styles.listItem, { backgroundColor: isSelected ? '#9febf5ff' : '#ecececff' }]}
              >
                <View style={styles.rowItem}>
                  <Text style={{ fontSize: 16, fontWeight: "500", width: "70%" }}>{item.descricao}</Text>
                  <View style={{ width: '30%', flexDirection: 'row-reverse' }}>
                    <View style={{ backgroundColor: item.status === 'ATIVO' ? '#4caf50' : '#f44336', padding: 5, borderRadius: 10 }}>
                      <Text style={{ fontSize: 16, fontWeight: "500" }}>{item.status}</Text>
                    </View>
                  </View>
                </View>

                <Text style={{ color: "#666" }}>{item.observacoes}</Text>

              </TouchableOpacity>
            );
          }}
        />
      )}

      <Modal
        transparent={true}
        animationType="slide"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Escolha uma Opção:
            </Text>


            <Pressable
              style={styles.optionButton}
              onPress={() => handleOption("Balanco")}
            >
              <Text style={styles.optionText}>➕ Realizar Balanço</Text>
            </Pressable>

            {userLevel !== null && userLevel >= 6 && (
              <Pressable
                style={styles.optionButton}
              //onPress={() => handleOption("Excluir")}
              >
                <Text style={styles.optionText}>📋 Ver Itens</Text>
              </Pressable>)}

            {userLevel !== null && userLevel >= 6 && (
              <Pressable
                style={styles.optionButton}
              //onPress={() => handleOption("Detalhes")}
              >
                <Text style={styles.optionText}>ℹ️ Detalhes</Text>
              </Pressable>)}

            <Pressable
              style={[styles.optionButton, { backgroundColor: "#ddd" }]}
              onPress={() => closeModal()}
            >
              <Text style={[styles.optionText, { color: "red", fontWeight: 'bold' }]}>❌ Fechar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}