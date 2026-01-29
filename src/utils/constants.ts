// ============================================
// SIAGOV - Application Constants
// ============================================

// Estados brasileiros
export const ESTADOS_BRASIL = [
    { value: 'AC', label: 'Acre' },
    { value: 'AL', label: 'Alagoas' },
    { value: 'AP', label: 'Amapá' },
    { value: 'AM', label: 'Amazonas' },
    { value: 'BA', label: 'Bahia' },
    { value: 'CE', label: 'Ceará' },
    { value: 'DF', label: 'Distrito Federal' },
    { value: 'ES', label: 'Espírito Santo' },
    { value: 'GO', label: 'Goiás' },
    { value: 'MA', label: 'Maranhão' },
    { value: 'MT', label: 'Mato Grosso' },
    { value: 'MS', label: 'Mato Grosso do Sul' },
    { value: 'MG', label: 'Minas Gerais' },
    { value: 'PA', label: 'Pará' },
    { value: 'PB', label: 'Paraíba' },
    { value: 'PR', label: 'Paraná' },
    { value: 'PE', label: 'Pernambuco' },
    { value: 'PI', label: 'Piauí' },
    { value: 'RJ', label: 'Rio de Janeiro' },
    { value: 'RN', label: 'Rio Grande do Norte' },
    { value: 'RS', label: 'Rio Grande do Sul' },
    { value: 'RO', label: 'Rondônia' },
    { value: 'RR', label: 'Roraima' },
    { value: 'SC', label: 'Santa Catarina' },
    { value: 'SP', label: 'São Paulo' },
    { value: 'SE', label: 'Sergipe' },
    { value: 'TO', label: 'Tocantins' },
] as const;

// Esferas de governo
export const ESFERAS = [
    { value: 'Federal', label: 'Federal' },
    { value: 'Estadual', label: 'Estadual' },
    { value: 'Municipal', label: 'Municipal' },
    { value: 'Distrital', label: 'Distrital' },
] as const;

// Poderes
export const PODERES = [
    { value: 'Executivo', label: 'Executivo' },
    { value: 'Legislativo', label: 'Legislativo' },
    { value: 'Judiciário', label: 'Judiciário' },
] as const;

// Tipos de administração
export const TIPOS_ADMINISTRACAO = [
    { value: 'Direta', label: 'Direta' },
    { value: 'Indireta', label: 'Indireta' },
] as const;

// Grupos de administração indireta
export const GRUPOS_INDIRETA = [
    { value: 'Autarquia', label: 'Autarquia' },
    { value: 'Fundação', label: 'Fundação' },
    { value: 'Empresa Pública', label: 'Empresa Pública' },
    { value: 'Sociedade de Economia Mista', label: 'Sociedade de Economia Mista' },
] as const;

// Tipos de credor
export const TIPOS_CREDOR = [
    { value: 'Física', label: 'Pessoa Física' },
    { value: 'Jurídica', label: 'Pessoa Jurídica' },
] as const;

// Tipos de conta bancária
export const TIPOS_CONTA_BANCARIA = [
    { value: 'Corrente', label: 'Conta Corrente' },
    { value: 'Poupança', label: 'Conta Poupança' },
    { value: 'Salário', label: 'Conta Salário' },
] as const;

// Status de processo
export const STATUS_PROCESSO = [
    { value: 'Aberto', label: 'Aberto' },
    { value: 'Em Tramitação', label: 'Em Tramitação' },
    { value: 'Arquivado', label: 'Arquivado' },
    { value: 'Cancelado', label: 'Cancelado' },
] as const;

// Prioridades de processo
export const PRIORIDADES_PROCESSO = [
    { value: 'Baixa', label: 'Baixa' },
    { value: 'Normal', label: 'Normal' },
    { value: 'Alta', label: 'Alta' },
    { value: 'Urgente', label: 'Urgente' },
] as const;

// Limites de caracteres para campos
export const FIELD_LIMITS = {
    nome: 80,
    nomeAbreviado: 30,
    sigla: 10,
    cnpj: 18,
    cpf: 14,
    email: 100,
    logradouro: 100,
    numero: 10,
    complemento: 50,
    bairro: 50,
    municipio: 60,
    uf: 2,
    cep: 9,
    telefone: 15,
    codigoInstituicao: 3,
    codigoOrgao: 6,
    codigoUG: 6,
    codigoSetor: 3,
    codigoCargo: 3,
    codigoUsuario: 3,
    codigoBanco: 3,
    codigoAgencia: 10,
    codigoSiasg: 6,
    ugTce: 5,
    observacao: 500,
} as const;

// Menu items para sidebar
export const MENU_ITEMS = [
    { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard', path: '/' },
    { id: 'processos', label: 'Processos', icon: 'FileText', path: '/processos' },
    {
        id: 'cadastros',
        label: 'Cadastros',
        icon: 'Database',
        path: '/cadastros',
        children: [
            { id: 'instituicoes', label: 'Instituições', path: '/cadastros/instituicoes' },
            { id: 'orgaos', label: 'Órgãos', path: '/cadastros/orgaos' },
            { id: 'unidades', label: 'Unidades Gestoras', path: '/cadastros/unidades' },
            { id: 'setores', label: 'Setores', path: '/cadastros/setores' },
            { id: 'cargos', label: 'Cargos', path: '/cadastros/cargos' },
            { id: 'usuarios', label: 'Usuários', path: '/cadastros/usuarios' },
            { id: 'credores', label: 'Credores', path: '/cadastros/credores' },
            { id: 'exercicios', label: 'Exercício Financeiro', path: '/cadastros/exercicios' },
            { id: 'bancos', label: 'Rede Bancária', path: '/cadastros/bancos' },
            { id: 'agencias', label: 'Agências Bancárias', path: '/cadastros/agencias' },
        ],
    },
    { id: 'relatorios', label: 'Relatórios', icon: 'PieChart', path: '/relatorios' },
    { id: 'configuracoes', label: 'Configurações', icon: 'Settings', path: '/configuracoes' },
] as const;

// Exercício financeiro corrente (deve ser definido dinamicamente)
export const getExercicioCorrente = (): number => {
    return new Date().getFullYear();
};
