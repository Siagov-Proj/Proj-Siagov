/**
 * Services API Index
 * Export all services for easy import
 */

export { esferasService } from './esferasService';
export type { IEsferaDB } from './esferasService';

export { instituicoesService } from './instituicoesService';
export type { IInstituicaoDB } from './instituicoesService';

export { orgaosService } from './orgaosService';
export type { IOrgaoDB } from './orgaosService';

export { unidadesService } from './unidadesService';
export type { IUnidadeGestoraDB } from './unidadesService';

export { setoresService } from './setoresService';
export type { ISetorDB } from './setoresService';

export { cargosService } from './cargosService';
export type { ICargoDB } from './cargosService';

export { bancosService } from './bancosService';
export type { IBancoDB } from './bancosService';

export { agenciasService } from './agenciasService';
export type { IAgenciaDB } from './agenciasService';

export { usuariosService } from './usuariosService';
export type { IUsuarioDB } from './usuariosService';

export { exerciciosService } from './exerciciosService';
export type { IExercicioFinanceiroDB } from './exerciciosService';

export { credoresService } from './credoresService';
export type { ICredorDB } from './credoresService';

export { categoriasDocService } from './categoriasDocService';
export type { ICategoriaDocumentoDB, ISubcategoriaDocumentoDB, ICategoriaOrgaoDB } from './categoriasDocService';

export { leisNormativasService } from './leisNormativasService';
export type { ILeiNormativaDB } from './leisNormativasService';

export { titulosNormativosService } from './titulosNormativosService';
export type { ITituloNormativoDB } from './titulosNormativosService';

export { auditService } from './auditService';
export type { IAuditLog } from './auditService';

export { sequenceService, gerarProximoCodigo } from './sequenceService';

export { lotacoesService } from './lotacoesService';
export type { ILotacaoDB, ILotacaoComInstituicao } from './lotacoesService';

export { permissoesService } from './permissoesService';
export type { IPermissaoDB, ICargoPermissaoDB } from './permissoesService';
