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
  ListCotacao: undefined;
  Balanco: undefined;
  Etiqueta: undefined;
  Usuarios: undefined;
  Cotacao: undefined;
  DetailCompra: { compraId: number };
  SelecaoProduto: { onSelect?: (produto: Produto) => void };
};

export interface ItemBalanco {
  id: number;
  codbar: string;
  quantidade: number;
  balanco: number;
  descricao: string;
  tipo: string;
  usuario_id: number;
}

export interface Fornecedor {
  id: number;
  created_at: string;
  fornecedor: string;
  status: string;
  vendedor: string;
}

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

export interface EtiquetaItem {
  id: number;
  codbarra: number;
  quantidade: number;
  usuario: number;
  produto?: {
    DESCRICAO: string;
  }[];
}

export interface CotacaoItem {
  id: number;
  descricao: string;
  codbar: number;
  cotacao_id: number;
  created_for: number;
  fornecedor_id: number;
  data_compra?: string;
  qtd_compra?: number;
  valor_compra?: number;
  bonificacao?: boolean;
  desc_bonificacao?: string;
  produto?: {
    DESCRICAO: string;
    ESTOQ: number;
    PRVENDA: number;
    CUSTO: number;
  }[];
  fornecedor?: {
    fornecedor: string;
  }[];
}