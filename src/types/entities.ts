// ============================================
// SIAGOV - TypeScript Interfaces for Entities
// ============================================

// ======================
// Core Entity Interfaces
// ======================

export interface IInstituicao {
    id: string;
    codigo: string;           // 3 dígitos sequencial (001, 002...)
    nome: string;             // 80 caracteres
    nomeAbreviado: string;    // 30 caracteres
    esfera: 'Federal' | 'Estadual' | 'Municipal' | 'Distrital';
    cnpj: string;             // 18 caracteres com máscara
    email: string;            // 100 caracteres
    codigoSiasg: string;      // 6 caracteres
    cep: string;              // 9 caracteres com máscara
    logradouro: string;       // 100 caracteres
    numero: string;           // 10 caracteres
    complemento: string;      // 50 caracteres
    bairro: string;           // 50 caracteres
    municipio: string;        // 60 caracteres
    uf: string;               // 2 caracteres
    ativo: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface IOrgao {
    id: string;
    codigo: string;             // 6 dígitos com zeros à esquerda
    instituicaoId: string;      // Referência à instituição
    poderVinculado: 'Executivo' | 'Legislativo' | 'Judiciário'; // OBRIGATÓRIO
    nome: string;               // 80 caracteres
    sigla: string;              // 10 caracteres
    cnpj: string;               // 18 caracteres
    codigoSiasg: string;        // 6 dígitos
    ugTce: string;              // 5 caracteres
    ugSiafemSigef: string;      // 6 dígitos
    nomeAnterior?: string;      // 80 caracteres
    nomeAbreviadoAnterior?: string; // 30 caracteres
    ativo: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface IUnidadeGestora {
    id: string;
    codigo: string;               // 6 dígitos
    orgaoId: string;
    nome: string;                 // 80 caracteres
    nomeAbreviado: string;        // 30 caracteres
    cnpj: string;                 // 18 caracteres
    cep: string;                  // 9 caracteres
    logradouro: string;           // 100 caracteres
    numero: string;               // 10 caracteres
    complemento: string;          // 50 caracteres
    bairro: string;               // 50 caracteres
    uf: string;                   // 2 caracteres
    municipio: string;            // 60 caracteres
    tipoAdministracao: 'Direta' | 'Indireta';
    grupoIndireta?: 'Autarquia' | 'Fundação' | 'Empresa Pública' | 'Sociedade de Economia Mista';
    normativaCriacao?: string;    // 50 caracteres
    numeroDiarioOficial?: string; // 20 caracteres
    ordenadorDespesa?: string;    // 80 caracteres (Novo)
    emailPrimario: string;        // 100 caracteres
    emailSecundario?: string;     // 100 caracteres
    telefone: string;             // 15 caracteres
    ugSiafemSigef: string;        // 6 dígitos
    ugTce: string;                // 5 caracteres
    ugSiasg: string;              // 6 dígitos
    tipoUnidadeGestora: string;
    ativo: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface ISetor {
    id: string;
    codigo: string;             // 3 dígitos
    instituicaoId: string;
    orgaoId: string;
    unidadeGestoraId: string;
    nome: string;               // 80 caracteres
    nomeAbreviado: string;      // 30 caracteres
    emailPrimario: string;      // 100 caracteres
    emailSecundario?: string;   // 100 caracteres
    telefone01: string;         // 15 caracteres
    telefone02?: string;        // 15 caracteres
    ramal?: string;             // 10 caracteres
    responsavel?: string;       // 80 caracteres
    ativo: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface ICargo {
    id: string;
    codigo: string;             // 3 dígitos
    instituicaoId: string;
    orgaoId: string;
    unidadeGestoraId: string;
    setorId: string;
    nome: string;               // 80 caracteres
    descricao?: string;         // 200 caracteres
    nivel?: string;             // Superior, Médio, etc.
    ativo: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface IUsuario {
    id: string;
    codigo: string;             // 3 dígitos
    instituicaoId: string;
    orgaoId: string;
    unidadeGestoraId: string;
    setorId: string;
    cargoId: string;
    cpf: string;                // 11 caracteres
    nome: string;               // 80 caracteres
    nomeCredor?: string;        // readonly, buscar por CPF
    matricula: string;          // 20 caracteres
    vinculo: string;
    ugOrigem?: string;
    emailInstitucional: string; // 100 caracteres
    emailPessoal?: string;      // 100 caracteres
    telefone01: string;         // 15 caracteres
    telefoneWhatsApp?: string;  // 15 caracteres
    permissoes?: string[];      // RBAC
    ativo: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface IBanco {
    id: string;
    codigo: string;             // 3 dígitos
    nome: string;               // 80 caracteres
    nomeAbreviado: string;      // 20 caracteres
    cnpj: string;               // 18 caracteres
    ativo: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface IAgencia {
    id: string;
    bancoId: string;
    codigoBanco: string;        // 3 dígitos - readonly, vem do Banco
    codigo: string;             // 10 caracteres (código da agência)
    digitoVerificador?: string; // 2 caracteres
    nome: string;               // 80 caracteres
    nomeAbreviado?: string;     // 30 caracteres
    cnpj?: string;              // 18 caracteres
    cnpjUnidadeGestora?: string;
    praca?: string;             // 60 caracteres
    gerente?: string;           // 60 caracteres (Legacy field)
    cep?: string;
    endereco?: string;
    numero?: string;
    bairro?: string;
    municipio?: string;
    uf?: string;
    telefone?: string;
    email?: string;
    ativo: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface IExercicioFinanceiro {
    id: string;
    ano: number;
    instituicaoId: string;
    dataAbertura: Date;
    dataFechamento?: Date;
    ativo: boolean;
    createdAt: Date;
    updatedAt: Date;
}

// ======================
// Credor - 45 campos em 5 abas
// ======================

export interface ICredor {
    id: string;

    // Aba 01 - Dados Gerais (15 campos)
    tipoCredor: 'Física' | 'Jurídica';
    cadastroRfb: string;
    identificador: string;        // CPF ou CNPJ
    naturezaJuridica?: string;
    nome: string;                 // 80 caracteres
    nomeSocial?: string;          // 80 caracteres
    nomeFantasia?: string;        // 80 caracteres
    nitPisPasep?: string;         // 14 caracteres
    inscricaoEstadual?: string;   // 20 caracteres
    inscricaoMunicipal?: string;  // 20 caracteres
    optanteSimples: boolean;
    dataFinalOpcaoSimples?: Date;
    optanteCprb: boolean;
    dataFinalOpcaoCprb?: Date;
    cpfAdministrador?: string;    // 14 caracteres
    nomeAdministrador?: string;   // 80 caracteres
    rg?: string;                  // 20 caracteres
    orgaoEmissorRg?: string;      // 20 caracteres
    dataEmissaoRg?: Date;

    // Aba 02 - Localização (11 campos)
    cep: string;                  // 9 caracteres
    logradouro: string;           // 100 caracteres
    numero: string;               // 10 caracteres
    complemento?: string;         // 50 caracteres
    bairro: string;               // 50 caracteres
    caixaPostal?: string;         // 10 caracteres
    uf: string;                   // 2 caracteres
    municipio: string;            // 60 caracteres
    pontoReferencia?: string;     // 100 caracteres

    // Aba 03 - Contato (7 campos)
    telefoneComercial?: string;   // 15 caracteres
    telefoneComercial2?: string;  // 15 caracteres
    telefoneResidencial?: string; // 15 caracteres
    telefoneCelular?: string;     // 15 caracteres
    email: string;                // 100 caracteres
    email2?: string;              // 100 caracteres
    site?: string;                // 100 caracteres

    // Aba 04 - Domicílio Bancário (4 campos)
    bancoId?: string;
    agencia?: string;             // Manual entry support
    agenciaId?: string;           // Relation support
    digitoAgencia?: string;
    contaBancaria?: string;       // 20 caracteres
    digitoConta?: string;
    tipoContaBancaria?: 'Corrente' | 'Poupança' | 'Salário';

    // Aba 05 - Informações Complementares (8 campos)
    porteEstabelecimento?: string;
    dataAberturaCnpj?: Date;
    situacaoCadastral?: string;
    dataSituacaoCadastral?: Date;
    inativo: boolean;
    bloqueado: boolean;
    observacao?: string;          // 500 caracteres

    createdAt: Date;
    updatedAt: Date;
}

// ======================
// Process and Document Interfaces
// ======================

export interface IProcesso {
    id: string;
    numero: string;
    ano?: number;
    tipo: string;
    assunto: string;
    interessado: string;
    interessadoId?: string;
    dataAbertura: Date;
    dataPrazo?: Date;
    dataEncerramento?: Date;
    status: 'Aberto' | 'Em Andamento' | 'Em Tramitação' | 'Aguardando' | 'Concluído' | 'Arquivado' | 'Cancelado';
    prioridade: 'Baixa' | 'Normal' | 'Alta' | 'Urgente';
    unidadeGestoraId?: string;
    setorId?: string;
    setorAtual?: string;
    setorAtualId?: string;
    responsavel?: string;
    observacoes?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface ITramitacao {
    id: string;
    processoId: string;
    setorOrigemId: string;
    setorOrigemNome?: string;
    setorDestinoId: string;
    setorDestinoNome?: string;
    dataEnvio?: Date;
    dataTramitacao?: Date;
    dataRecebimento?: Date;
    despacho: string;
    usuarioEnvioId?: string;
    usuarioRecebimentoId?: string;
    responsavel?: string;
    status: 'Enviado' | 'Recebido' | 'Concluído' | 'Cancelado';
    createdAt: Date;
}

// ======================
// Authentication Types
// ======================

export interface IAuthUser {
    id: string;
    nome: string;
    email: string;
    cpf: string;
    instituicaoId: string;
    orgaoId: string;
    unidadeGestoraId: string;
    setorId: string;
    cargoId: string;
    permissoes: string[];
    avatar?: string;
}

export interface IAuthState {
    user: IAuthUser | null;
    isAuthenticated: boolean;
    token: string | null;
    exercicioCorrente: number;
    instituicaoCorrente: IInstituicao | null;
}

// ======================
// Form and UI Types
// ======================

export type ActionBarMode = 'create' | 'edit' | 'view';

export interface ISelectOption {
    value: string;
    label: string;
}

export interface ITableColumn<T> {
    key: keyof T | string;
    header: string;
    className?: string;
    render?: (value: unknown, row: T) => React.ReactNode;
}

export interface IPaginationState {
    page: number;
    pageSize: number;
    total: number;
}

// ======================
// API Response Types
// ======================

export interface IApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface IListResponse<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}
