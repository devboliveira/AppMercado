export interface Produto {
  CODBAR: number;
  DESCRICAO: string;
  associado: number;
}

export interface ItemBalanco {
  id: number;
  codbar: string;
  quantidade: number;
  balanco: number;
  descricao: string;
  tipo: string;
  usuario_id: number;
}

export interface TotaisBalanco {
  gondola: number;
  deposito: number;
  registros: ItemBalanco[];
}