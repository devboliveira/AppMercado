import { StyleSheet, Dimensions } from "react-native";
import {MaterialIcons} from '@expo/vector-icons';
import { themes } from "../../global/themes";

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
        backgroundColor: themes.colors.white,
        alignItems: 'center',
        justifyContent: 'center',
    },

    button: {
        width: 200,
        height: 200,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: themes.colors.primary,
        borderRadius: 40,
        opacity: 0,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.44,
        shadowRadius: 10.32,

        elevation: 16,
    },

    textButton: {
        color: themes.colors.secondary,
        fontWeight: "bold",
        fontSize: 20,
    },

    rowItem: {
        width: '100%',
        flexDirection: 'row',
    },

    listItem: {
        width: '100%',
        padding: 15,
        marginVertical: 5,
        borderRadius: 8,               
        shadowColor: "#000",        
        shadowOffset: {        
            width: 0,        
            height: 7,        
        },        
        shadowOpacity: 0.41,        
        shadowRadius: 9.11,        
        elevation: 14,        
    },

    modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    alignItems: "stretch",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  optionButton: {
    backgroundColor: themes.colors.primary,
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  optionText: {
    fontSize: 16,
    color: themes.colors.secondary,
    textAlign: "center",
  },
});