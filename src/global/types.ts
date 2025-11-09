export interface User {
  id: number;
  created_at: string;
  nome: string;
  usuario: string;
  senha: string;
  nivel: number;
  status: string;
};

export interface Produto {
    CODBAR: number;
    DESCRICAO: string;
    PRVENDA: number;
    ESTOQ: number;
    CODPROD: number;
    CUSTO: number;
};

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  ListBalanco: undefined;
  Balanco: undefined;
  Etiqueta: undefined;
  Usuarios: undefined;
  SelecaoProduto: { onSelect?: (produto: Produto) => void };
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}