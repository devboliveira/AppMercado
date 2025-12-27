import { StyleSheet, Dimensions } from "react-native";
import { MaterialIcons } from '@expo/vector-icons';
import { themes } from "./themes";

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: themes.colors.white,
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: 10,
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

    separator: {
        height: 1,
        width: '100%',
        backgroundColor: '#ccc',
        marginVertical: 5,
    },

    buttonSearchBox: {
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

    modalTitle: {
        width: 'auto',
        fontSize: 18,
        fontWeight: "bold",
        alignContent: 'center',
        textAlign: 'center',
        color: themes.colors.secondary,
    },

    modalOverlayBottom: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.2)",
        justifyContent: "flex-end",
        alignItems: "center",
    },

    modalContentBottom: {
        backgroundColor: '#fff',
        paddingBottom: 40,
        borderTopStartRadius: 20,
        borderTopEndRadius: 20,
        width: "95%",
        alignItems: "center",
    },

    modalHeader: {
        flexDirection: 'row',
        backgroundColor: themes.colors.primary,
        width: '100%',
        borderTopStartRadius: 20,
        borderTopEndRadius: 20,
        paddingVertical: 10,
        paddingHorizontal: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },

    modalBotoes: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginTop: 10,
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

    opitionText: {
        fontSize: 16,
        textAlign: 'center',
        fontWeight: 'bold'
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

    optionButton: {
        backgroundColor: themes.colors.primary,
        padding: 12,
        borderRadius: 8,
        marginTop: 10,
    },

    modalOverlayCenter: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.2)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContentCenter: {
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 10,
        width: "80%",
        alignItems: "stretch",
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

    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: themes.colors.primary,
        marginBottom: 10,
    },

    label: {
        fontSize: 14,
        color: themes.colors.darkGray,
    },

    switchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },

    boxInputForm: {
        width: '100%',
        height: 40,
        borderWidth: 1,
        borderColor: "gray",
        borderRadius: 8,
        marginTop: 5,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 15,
        backgroundColor: themes.colors.lightGray,
    },

    inputForm: {
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
});