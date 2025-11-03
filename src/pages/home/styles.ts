import { StyleSheet, Dimensions } from "react-native";
import {MaterialIcons} from '@expo/vector-icons';
import { themes } from "../../global/themes";

export const styles = StyleSheet.create({
    container: {
        flex: 1,
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
    }
});