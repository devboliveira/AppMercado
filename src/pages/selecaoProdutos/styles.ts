import { StyleSheet } from "react-native";
import { themes } from "../../global/themes";

export const styles = StyleSheet.create({

boxInput: {
        width: "85%",
        height: 40,
        borderWidth: 1,
        borderColor: "gray",
        borderRadius: 30,
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
});