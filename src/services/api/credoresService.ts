
import { getSupabaseClient } from "@/lib/supabase/client";
import type { ICredor } from "@/types";

// Database interface (snake_case)
export interface ICredorDB {
    id: string;
    tipo_credor?: string;
    cadastro_rfb?: string;
    identificador?: string;
    natureza_juridica?: string;
    nome: string;
    nome_social?: string;
    nome_fantasia?: string;
    nit_pis_pasep?: string;
    inscricao_estadual?: string;
    inscricao_municipal?: string;
    optante_simples?: boolean;
    data_final_opcao_simples?: string;
    optante_cprb?: boolean;
    data_final_opcao_cprb?: string;
    cpf_administrador?: string;
    nome_administrador?: string;
    rg?: string;
    orgao_emissor_rg?: string;
    data_emissao_rg?: string;
    cep?: string;
    logradouro?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    caixa_postal?: string;
    uf?: string;
    municipio?: string;
    ponto_referencia?: string;
    telefone_comercial?: string;
    telefone_comercial_2?: string;
    telefone_residencial?: string;
    telefone_celular?: string;
    email?: string;
    email_2?: string;
    site?: string;
    banco_id?: string;
    agencia?: string;
    agencia_id?: string;
    digito_agencia?: string;
    conta_bancaria?: string;
    digito_conta?: string;
    tipo_conta_bancaria?: string;
    porte_estabelecimento?: string;
    data_abertura_cnpj?: string;
    situacao_cadastral?: string;
    data_situacao_cadastral?: string;
    inativo?: boolean;
    bloqueado?: boolean;
    observacao?: string;
    ativo: boolean;
    excluido: boolean;
    created_at: string;
    updated_at: string;
}

// Helper: Convert DB record to frontend format
function dbToFrontend(db: ICredorDB): ICredor {
    return {
        id: db.id,
        tipoCredor: (db.tipo_credor as 'Física' | 'Jurídica') || 'Física',
        cadastroRfb: db.cadastro_rfb || '',
        identificador: db.identificador || '',
        naturezaJuridica: db.natureza_juridica,
        nome: db.nome,
        nomeSocial: db.nome_social,
        nomeFantasia: db.nome_fantasia,
        nitPisPasep: db.nit_pis_pasep,
        inscricaoEstadual: db.inscricao_estadual,
        inscricaoMunicipal: db.inscricao_municipal,
        optanteSimples: db.optante_simples || false,
        dataFinalOpcaoSimples: db.data_final_opcao_simples ? new Date(db.data_final_opcao_simples) : undefined,
        optanteCprb: db.optante_cprb || false,
        dataFinalOpcaoCprb: db.data_final_opcao_cprb ? new Date(db.data_final_opcao_cprb) : undefined,
        cpfAdministrador: db.cpf_administrador,
        nomeAdministrador: db.nome_administrador,
        rg: db.rg,
        orgaoEmissorRg: db.orgao_emissor_rg,
        dataEmissaoRg: db.data_emissao_rg ? new Date(db.data_emissao_rg) : undefined,
        cep: db.cep || '',
        logradouro: db.logradouro || '',
        numero: db.numero || '',
        complemento: db.complemento,
        bairro: db.bairro || '',
        caixaPostal: db.caixa_postal,
        uf: db.uf || '',
        municipio: db.municipio || '',
        pontoReferencia: db.ponto_referencia,
        telefoneComercial: db.telefone_comercial,
        telefoneComercial2: db.telefone_comercial_2,
        telefoneResidencial: db.telefone_residencial,
        telefoneCelular: db.telefone_celular,
        email: db.email || '',
        email2: db.email_2,
        site: db.site,
        bancoId: db.banco_id,
        agencia: db.agencia,
        agenciaId: db.agencia_id,
        digitoAgencia: db.digito_agencia,
        contaBancaria: db.conta_bancaria,
        digitoConta: db.digito_conta,
        tipoContaBancaria: db.tipo_conta_bancaria as 'Corrente' | 'Poupança' | 'Salário' | undefined,
        porteEstabelecimento: db.porte_estabelecimento,
        dataAberturaCnpj: db.data_abertura_cnpj ? new Date(db.data_abertura_cnpj) : undefined,
        situacaoCadastral: db.situacao_cadastral,
        dataSituacaoCadastral: db.data_situacao_cadastral ? new Date(db.data_situacao_cadastral) : undefined,
        inativo: db.inativo || false,
        bloqueado: db.bloqueado || false,
        observacao: db.observacao,
        createdAt: new Date(db.created_at),
        updatedAt: new Date(db.updated_at),
    };
}

// Helper: Convert frontend format to DB
function frontendToDb(frontend: Partial<ICredor>): Partial<ICredorDB> {
    const db: Partial<ICredorDB> = {};

    if (frontend.tipoCredor !== undefined) db.tipo_credor = frontend.tipoCredor;
    if (frontend.cadastroRfb !== undefined) db.cadastro_rfb = frontend.cadastroRfb;
    if (frontend.identificador !== undefined) db.identificador = frontend.identificador;
    if (frontend.naturezaJuridica !== undefined) db.natureza_juridica = frontend.naturezaJuridica;
    if (frontend.nome !== undefined) db.nome = frontend.nome;
    if (frontend.nomeSocial !== undefined) db.nome_social = frontend.nomeSocial;
    if (frontend.nomeFantasia !== undefined) db.nome_fantasia = frontend.nomeFantasia;
    if (frontend.nitPisPasep !== undefined) db.nit_pis_pasep = frontend.nitPisPasep;
    if (frontend.inscricaoEstadual !== undefined) db.inscricao_estadual = frontend.inscricaoEstadual;
    if (frontend.inscricaoMunicipal !== undefined) db.inscricao_municipal = frontend.inscricaoMunicipal;
    if (frontend.optanteSimples !== undefined) db.optante_simples = frontend.optanteSimples;
    if (frontend.dataFinalOpcaoSimples !== undefined) db.data_final_opcao_simples = frontend.dataFinalOpcaoSimples?.toISOString().split('T')[0];
    if (frontend.optanteCprb !== undefined) db.optante_cprb = frontend.optanteCprb;
    if (frontend.dataFinalOpcaoCprb !== undefined) db.data_final_opcao_cprb = frontend.dataFinalOpcaoCprb?.toISOString().split('T')[0];
    if (frontend.cpfAdministrador !== undefined) db.cpf_administrador = frontend.cpfAdministrador;
    if (frontend.nomeAdministrador !== undefined) db.nome_administrador = frontend.nomeAdministrador;
    if (frontend.rg !== undefined) db.rg = frontend.rg;
    if (frontend.orgaoEmissorRg !== undefined) db.orgao_emissor_rg = frontend.orgaoEmissorRg;
    if (frontend.dataEmissaoRg !== undefined) db.data_emissao_rg = frontend.dataEmissaoRg?.toISOString().split('T')[0];
    if (frontend.cep !== undefined) db.cep = frontend.cep;
    if (frontend.logradouro !== undefined) db.logradouro = frontend.logradouro;
    if (frontend.numero !== undefined) db.numero = frontend.numero;
    if (frontend.complemento !== undefined) db.complemento = frontend.complemento;
    if (frontend.bairro !== undefined) db.bairro = frontend.bairro;
    if (frontend.caixaPostal !== undefined) db.caixa_postal = frontend.caixaPostal;
    if (frontend.uf !== undefined) db.uf = frontend.uf;
    if (frontend.municipio !== undefined) db.municipio = frontend.municipio;
    if (frontend.pontoReferencia !== undefined) db.ponto_referencia = frontend.pontoReferencia;
    if (frontend.telefoneComercial !== undefined) db.telefone_comercial = frontend.telefoneComercial;
    if (frontend.telefoneComercial2 !== undefined) db.telefone_comercial_2 = frontend.telefoneComercial2;
    if (frontend.telefoneResidencial !== undefined) db.telefone_residencial = frontend.telefoneResidencial;
    if (frontend.telefoneCelular !== undefined) db.telefone_celular = frontend.telefoneCelular;
    if (frontend.email !== undefined) db.email = frontend.email;
    if (frontend.email2 !== undefined) db.email_2 = frontend.email2;
    if (frontend.site !== undefined) db.site = frontend.site;
    if (frontend.bancoId !== undefined) db.banco_id = frontend.bancoId;
    if (frontend.agencia !== undefined) db.agencia = frontend.agencia;
    if (frontend.agenciaId !== undefined) db.agencia_id = frontend.agenciaId;
    if (frontend.digitoAgencia !== undefined) db.digito_agencia = frontend.digitoAgencia;
    if (frontend.contaBancaria !== undefined) db.conta_bancaria = frontend.contaBancaria;
    if (frontend.digitoConta !== undefined) db.digito_conta = frontend.digitoConta;
    if (frontend.tipoContaBancaria !== undefined) db.tipo_conta_bancaria = frontend.tipoContaBancaria;
    if (frontend.porteEstabelecimento !== undefined) db.porte_estabelecimento = frontend.porteEstabelecimento;
    if (frontend.dataAberturaCnpj !== undefined) db.data_abertura_cnpj = frontend.dataAberturaCnpj?.toISOString().split('T')[0];
    if (frontend.situacaoCadastral !== undefined) db.situacao_cadastral = frontend.situacaoCadastral;
    if (frontend.dataSituacaoCadastral !== undefined) db.data_situacao_cadastral = frontend.dataSituacaoCadastral?.toISOString().split('T')[0];
    if (frontend.inativo !== undefined) db.inativo = frontend.inativo;
    if (frontend.bloqueado !== undefined) db.bloqueado = frontend.bloqueado;
    if (frontend.observacao !== undefined) db.observacao = frontend.observacao;

    return db;
}

const TABLE_NAME = 'credores';

export const credoresService = {
    async listar(termoBusca?: string): Promise<ICredor[]> {
        const supabase = getSupabaseClient();
        let query = supabase
            .from(TABLE_NAME)
            .select('*')
            .eq('excluido', false)
            .order('nome', { ascending: true });

        if (termoBusca) {
            query = query.or(`nome.ilike.%${termoBusca}%,identificador.ilike.%${termoBusca}%,nome_fantasia.ilike.%${termoBusca}%`);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Erro ao listar credores:', error);
            throw error;
        }

        return (data as ICredorDB[]).map(dbToFrontend);
    },

    async buscarPorId(id: string): Promise<ICredor | null> {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select('*')
            .eq('id', id)
            .eq('excluido', false)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            console.error('Erro ao buscar credor por id:', error);
            throw error;
        }

        return dbToFrontend(data as ICredorDB);
    },

    async buscarPorIdentificador(identificador: string): Promise<ICredor | null> {
        const supabase = getSupabaseClient();
        const identificadorLimpo = identificador.replace(/\D/g, '');

        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select('*')
            .eq('identificador', identificadorLimpo)
            .eq('excluido', false)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            console.error('Erro ao buscar credor por identificador:', error);
            throw error;
        }

        return dbToFrontend(data as ICredorDB);
    },

    async criar(credor: Omit<ICredor, 'id' | 'createdAt' | 'updatedAt'>): Promise<ICredor> {
        const supabase = getSupabaseClient();
        const dbData = frontendToDb(credor);

        const { data, error } = await supabase
            .from(TABLE_NAME)
            .insert({
                ...dbData,
                ativo: true,
                excluido: false,
            })
            .select()
            .single();

        if (error) {
            console.error('Erro ao criar credor:', error);
            throw error;
        }

        return dbToFrontend(data as ICredorDB);
    },

    async atualizar(id: string, credor: Partial<ICredor>): Promise<ICredor> {
        const supabase = getSupabaseClient();
        const dbData = frontendToDb(credor);

        const { data, error } = await supabase
            .from(TABLE_NAME)
            .update(dbData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Erro ao atualizar credor:', error);
            throw error;
        }

        return dbToFrontend(data as ICredorDB);
    },

    async excluir(id: string): Promise<void> {
        const supabase = getSupabaseClient();
        const { error } = await supabase
            .from(TABLE_NAME)
            .update({ excluido: true })
            .eq('id', id);

        if (error) {
            console.error('Erro ao excluir credor:', error);
            throw error;
        }
    }
};
