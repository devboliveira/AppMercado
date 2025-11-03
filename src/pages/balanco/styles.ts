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
        padding: 20,
        borderRadius: 10,
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
});