export interface EtiquetaItem {
  id: number;
  codbarra: number;
  quantidade: number;
  usuario: number;
  produto?: {
    DESCRICAO: string;
  }[];
}
