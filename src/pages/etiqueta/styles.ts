import { StyleSheet, Dimensions } from "react-native";
import { MaterialIcons } from '@expo/vector-icons';
import { themes } from "../../global/themes";

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: themes.colors.white,
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: 10,
        gap: 10,
    },

    button: {
        width: 200,
        height: 200,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: themes.colors.primary,
        borderRadius: 40,
        opacity: 0.8,
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

    titleInput: {
        color: "gray",
        marginTop: 20,
    },

    boxInput: {
        width: "85%",
        height: 40,
        borderWidth: 1,
        borderColor: "gray",
        borderRadius: 40,
        marginTop: 5,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 15,
        backgroundColor: themes.colors.lightGray,
    },

    input: {
        height: "100%",
        width: "95%",
        borderRadius: 40,
        borderColor: "transparent",
        outlineColor: "transparent",
        outlineOffset: 0,
        outlineWidth: 0,
        borderWidth: 0,
        padding: 10,
    },

    searchBarBox: {
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        paddingLeft: 10,
    },

    buttonScanner: {
        width: '100%',
        height: 40,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: themes.colors.primary,
        borderRadius: 20,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.44,
        shadowRadius: 2,

        elevation: 8,
    },

    separator: {
        height: 1, // Altura da linha
        width: '95%',
        backgroundColor: '#ccc', // Cor da linha
        marginVertical: 5, // Espaçamento vertical
    },

    modalOverlay2: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.2)",
        justifyContent: "center",
        alignItems: "center",
    },

    modalContent2: {
        backgroundColor: "#fff",
        padding: 10,
        borderRadius: 10,
        gap: 10,
        width: "80%",
        alignItems: "stretch",
    },

    modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 15,
        alignContent: 'center',
        textAlign: 'center',
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.2)",
        justifyContent: "flex-end",
        alignItems: "center",
    },

    modalContent: {
        backgroundColor: "#fff",
        padding: 5,
        paddingTop: 7,
        paddingBottom: 30,
        borderRadius: 10,
        width: "95%",
        alignItems: "center",
    },

    opitionButton: {
        color: themes.colors.white,
        backgroundColor: themes.colors.primary,
        width: '95%',
        padding: 2,
        borderRadius: 8,
        flexDirection: 'row',
        gap: 5,
        alignItems: 'center',
        justifyContent: 'center'
    },

    opitionText: {
        fontSize: 16,
        textAlign: 'center',
        fontWeight: 'bold'
    },

    modalTitulo: {
        fontWeight: "bold",
        fontSize: 16,
        marginBottom: 10,
        textAlign: "center",
    },
    inputQuantidade: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        textAlign: "center",
        padding: 8,
        fontSize: 16,
        marginBottom: 15,
    },
    modalBotoes: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginTop: 10,
    },
    modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 20,
  },

  opitionCancelButton: {
        color: themes.colors.white,
        padding: 4,
        paddingHorizontal: 10,
        borderRadius: 8,
        flexDirection: 'row',
        gap: 5,
        alignItems: 'center',
        justifyContent: 'center'
    },

    opitionCancelText: {
        fontSize: 18,
        textAlign: 'center',
        color: 'red',
        fontWeight: 'semibold'
    },
  
});