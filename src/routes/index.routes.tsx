import React from "react";
import { createStackNavigator } from '@react-navigation/stack';
import { Header, getHeaderTitle } from '@react-navigation/elements';
import Login from "../pages/login";
import Home from "../pages/home";
import { themes } from "../global/themes";
import ListBalanco from "../pages/listBalanco";
import Balanco from "../pages/balanco";
import { StatusBar } from 'expo-status-bar';
import Etiqueta from "../pages/etiqueta";
import SelecaoProduto from "../pages/selecaoProdutos";
import type { RootStackParamList } from "../global/types";

const Stack = createStackNavigator<RootStackParamList>();

export default function Routes() {
    //const Stack = createStackNavigator()
    return (
        <Stack.Navigator
            initialRouteName="Login"
            screenOptions={
                {
                    header: ({ options, route, back }) => (
                        <Header
                            headerTitleStyle={{ color: themes.colors.secondary, fontWeight: 'bold' }}
                            headerStyle={{
                                backgroundColor: themes.colors.primary,
                            }}
                            {...options}
                            back={back}
                            headerBackButtonDisplayMode='minimal'
                            title={getHeaderTitle(options, route.name)}
                            headerShadowVisible={false}
                            headerTintColor={themes.colors.secondary}
                        />
                    ),
                }
            }>
            
            <Stack.Screen
                name="Login"
                component={Login}
                options={{
                    title: 'SUPERMERCADO BOM PREÇO',
                }}
            />

            <Stack.Screen
                name="Home"
                component={Home}
                options={{
                    title: 'SUPERMERCADO BOM PREÇO',
                }}
            />

            <Stack.Screen
                name="ListBalanco"
                component={ListBalanco}
                options={{
                    title: 'BALANÇOS',
                }}
            />

            <Stack.Screen
                name="Balanco"
                component={Balanco}
                options={{
                    title: 'REALIZAR CONTAGEM',
                }}
            />

            <Stack.Screen
                name="Etiqueta"
                component={Etiqueta}
                options={{
                    title: 'ETIQUETA',
                }}
            />

            <Stack.Screen
                name="SelecaoProduto"
                component={SelecaoProduto}
                options={{
                    title: 'SELECIONAR PRODUTO',
                }}
            />

        </Stack.Navigator>
    )
}