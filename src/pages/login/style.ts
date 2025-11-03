import { StyleSheet, Dimensions } from "react-native";
import {MaterialIcons} from '@expo/vector-icons';
import { themes } from "../../global/themes";

export const styles = StyleSheet.create({

    container: {
        flex: 1,
        alignItems: "center", 
        justifyContent: "center",
    },
    topView: {
        width: "100%",
        height: Dimensions.get("window").height / 3,
        alignItems: "center",
        justifyContent: "center",
    },

    midView: {
        width: "100%",
        height: Dimensions.get("window").height / 4,
        //alignItems: "center",
        //justifyContent: "center",
        paddingHorizontal: 37,
    },

    bottomView: {     
        width: "100%",
        height: Dimensions.get("window").height / 3,
        alignItems: "center",
        justifyContent: "center",
    },

    title: {
        fontSize: 30,
        fontWeight: "bold",
        color: themes.colors.primary,
    },

    titleInput: {
        color: "gray",
        marginTop: 20,
    },

    boxInput: {
        width: "100%",
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

    button: {
        width: 200,
        height: 50,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: themes.colors.primary,
        borderRadius: 40,
        opacity: 1,
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
        color: themes.colors.white,
        fontWeight: "bold",
        fontSize: 16,
    }
}); 