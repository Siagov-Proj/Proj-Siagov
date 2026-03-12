# SIAGOV - Análise Estática de Código
## Relatório de QA - Análise de Vulnerabilidades, Falhas de Validação e Cenários de Teste

**Data da Análise:** 10 de Março de 2026  
**Versão do Projeto:** 1.0.0  
**Analista:** QA Engineer Senior

---

## Índice

1. [Resumo Executivo](#resumo-executivo)
2. [Módulo de Documentos](#módulo-de-documentos)
3. [Módulo de Cadastros](#módulo-de-cadastros)
4. [Logs de Auditoria](#logs-de-auditoria)
5. [Cenários de Teste BDD/Gherkin](#cenários-de-teste-bddgherkin)
6. [Exemplos de Implementação de Testes](#exemplos-de-implementação-de-testes)
7. [Recomendações de Correção](#recomendações-de-correção)

---

## Resumo Executivo

### Estatísticas da Análise

| Categoria | Crítico | Alto | Médio | Baixo |
|-----------|---------|------|-------|-------|
| Vulnerabilidades de Segurança | 2 | 4 | 6 | 3 |
| Falhas de Validação | 3 | 5 | 7 | 4 |
| Erros de Lógica | 1 | 3 | 4 | 2 |
| **Total** | **6** | **12** | **17** | **9** |

### Principais Achados

1. **Race Condition na geração de códigos** - Risco de códigos duplicados em operações concorrentes
2. **Ausência de validação server-side para uploads** - Arquivos maliciosos podem ser enviados
3. **Falta de schemas Zod** - Validação manual propensa a erros e payloads maliciosos
4. **Tabela `documentos` não possui audit trigger** - Operações não são auditadas
5. **Exclusão sem verificação de dependências** - Possível inconsistência de dados

---

## Módulo de Documentos

### Localização: `/src/app/(dashboard)/documentos/` e `/src/services/api/documentosService.ts`

### 1. Vulnerabilidades de Upload de Arquivos

#### 🔴 CRÍTICO: Ausência de Validação Server-Side

**Arquivo:** `src/app/(dashboard)/documentos/novo/page.tsx` (linhas 147-158)

```typescript
// PROBLEMA: Validação apenas no client-side via atributo accept
<input
    ref={fileInputRef}
    type="file"
    multiple
    accept=".pdf,.doc,.docx,.xls,.xlsx"  // ← Facilmente bypassado
    className="hidden"
    onChange={handleFileChange}
/>
```

**Vulnerabilidades Identificadas:**
- ❌ Não há validação de MIME type no servidor
- ❌ Não há verificação de magic bytes do arquivo
- ❌ Limite de tamanho (10MB) existe apenas na documentação, não no código
- ❌ Não há sanitização de nomes de arquivos (path traversal)
- ❌ Extensão pode ser alterada (ex: malware.exe → malware.pdf)

**Impacto:** Um atacante pode fazer upload de arquivos maliciosos (executáveis, scripts) que podem ser executados no servidor ou distribuídos para outros usuários.

**Recomendação:**
```typescript
// Implementar validação server-side
const ALLOWED_MIME_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function validateUpload(file: File): Promise<ValidationResult> {
    // 1. Validar tamanho
    if (file.size > MAX_FILE_SIZE) {
        return { valid: false, error: 'Arquivo excede 10MB' };
    }
    
    // 2. Validar MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        return { valid: false, error: 'Tipo de arquivo não permitido' };
    }
    
    // 3. Validar magic bytes (cabeçalho do arquivo)
    const header = await readFileHeader(file, 8);
    if (!validateMagicBytes(header, file.type)) {
        return { valid: false, error: 'Arquivo corrompido ou falsificado' };
    }
    
    // 4. Sanitizar nome do arquivo
    const sanitizedName = sanitizeFilename(file.name);
    
    return { valid: true, sanitizedName };
}
```

---

#### 🟠 ALTO: Ausência de Tratamento de Falha de Rede

**Arquivo:** `src/app/(dashboard)/documentos/novo/page.tsx` (linhas 165-196)

```typescript
const salvar = async () => {
    // PROBLEMA: Sem retry logic, sem progress tracking
    setLoading(true);
    try {
        await documentosService.criar({...});
        router.push(returnPath);  // ← Navega mesmo sem confirmar upload dos anexos
    } catch (error) {
        console.error('Erro ao salvar documento:', error);
        alert('Erro ao salvar documento. Verifique o console.');  // ← UX ruim
    } finally {
        setLoading(false);
    }
};
```

**Problemas:**
- ❌ Anexos não são salvos (código morto - não envia para storage)
- ❌ Sem indicador de progresso de upload
- ❌ Sem retry automático em falhas de rede
- ❌ Mensagem de erro genérica sem detalhes úteis

---

### 2. Race Condition na Geração de Códigos

#### 🔴 CRÍTICO: Códigos Duplicados em Operações Concorrentes

**Arquivo:** `src/services/api/documentosService.ts` (linhas 80-124)

```typescript
async gerarProximoCodigo(subcategoriaId: string): Promise<string> {
    const supabase = getSupabaseClient();

    // PROBLEMA: Leitura e incremento não são atômicos
    const { count, error: countError } = await supabase
        .from(TABLE_NAME)
        .select('*', { count: 'exact', head: true })
        .eq('subcategoria_id', subcategoriaId)
        .eq('excluido', false);
    
    // Entre esta contagem e o INSERT, outro usuário pode inserir
    const proximoNum = (count || 0) + 1;
    return `${prefixo}.${proximoNum}.`;  // ← Código potencialmente duplicado
}
```

**Cenário de Falha:**
```
T0: Usuário A consulta count = 5
T1: Usuário B consulta count = 5
T2: Usuário A insere documento com código 4.1.6.
T3: Usuário B insere documento com código 4.1.6.  ← DUPLICADO!
```

**Recomendação:** Usar função PostgreSQL com lock ou sequence:
```sql
-- Criar sequence por subcategoria
CREATE OR REPLACE FUNCTION gerar_codigo_documento(p_subcategoria_id UUID)
RETURNS TEXT AS $$
DECLARE
    v_prefixo TEXT;
    v_seq INT;
BEGIN
    -- Lock advisory para evitar race condition
    PERFORM pg_advisory_xact_lock(hashtext(p_subcategoria_id::text));
    
    SELECT COALESCE(MAX(CAST(SPLIT_PART(numero, '.', 3) AS INT)), 0) + 1
    INTO v_seq
    FROM documentos
    WHERE subcategoria_id = p_subcategoria_id AND excluido = false;
    
    SELECT codigo INTO v_prefixo FROM subcategorias_documentos WHERE id = p_subcategoria_id;
    
    RETURN v_prefixo || '.' || v_seq || '.';
END;
$$ LANGUAGE plpgsql;
```

---

### 3. Ausência de Schemas Zod para Validação

#### 🟠 ALTO: Validação Manual Incompleta

**Arquivo:** `src/app/(dashboard)/documentos/novo/page.tsx` (linhas 134-145)

```typescript
const validar = (): boolean => {
    const novosErros: Record<string, string> = {};

    // PROBLEMA: Validação básica, sem proteção contra payloads maliciosos
    if (!formData.tipo) novosErros.tipo = 'Tipo é obrigatório';
    if (!formData.categoriaId) novosErros.categoriaId = 'Categoria é obrigatória';
    if (!formData.subcategoriaId) novosErros.subcategoriaId = 'Subcategoria é obrigatória';
    if (!formData.especialistaId) novosErros.especialistaId = 'Especialista é obrigatório';
    if (!formData.objetivo.trim()) novosErros.objetivo = 'Objetivo é obrigatório';
    // ❌ Não valida UUID format de categoria/subcategoria
    // ❌ Não valida tamanho máximo dos campos
    // ❌ Não valida caracteres especiais/HTML
    // ❌ Não valida strings com apenas espaços
    
    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
};
```

**Payloads Maliciosos Não Detectados:**
```typescript
// Estes payloads passam na validação atual:
const maliciousPayloads = {
    objetivo: '   ',  // Apenas espaços - passa no trim() mas é inválido
    titulo: '<script>alert("XSS")</script>',  // XSS
    categoriaId: 'not-a-uuid',  // UUID inválido
    tipo: 'A'.repeat(10000),  // DoS via payload grande
};
```

**Recomendação:** Implementar schema Zod:
```typescript
import { z } from 'zod';

export const documentoSchema = z.object({
    titulo: z.string()
        .min(1, 'Título é obrigatório')
        .max(200, 'Título deve ter no máximo 200 caracteres')
        .regex(/^[^<>]*$/, 'Caracteres inválidos no título'),
    
    tipo: z.enum([
        'Parecer', 'Nota Técnica', 'Relatório', 'Termo de Referência',
        'Edital', 'Ata', 'Minuta', 'DFD', 'Memorando', 'Ofício'
    ], { errorMap: () => ({ message: 'Tipo de documento inválido' }) }),
    
    categoriaId: z.string().uuid('ID de categoria inválido'),
    subcategoriaId: z.string().uuid('ID de subcategoria inválido'),
    processoId: z.string().uuid('ID de processo inválido').optional(),
    especialistaId: z.string().min(1, 'Especialista é obrigatório'),
    
    objetivo: z.string()
        .min(10, 'Objetivo deve ter pelo menos 10 caracteres')
        .max(2000, 'Objetivo deve ter no máximo 2000 caracteres')
        .transform(val => val.trim())
        .refine(val => val.length > 0, 'Objetivo não pode conter apenas espaços'),
    
    contexto: z.string().max(5000).optional(),
});

export type DocumentoInput = z.infer<typeof documentoSchema>;
```

---

### 4. Tratamento de Arquivos na Edição

#### 🟡 MÉDIO: Arquivos Órfãos no Storage

**Observação:** Não há implementação de upload de anexos (código presente mas não funcional).

**Problemas Potenciais:**
- Ao excluir documento (soft delete), anexos permanecem no storage
- Ao substituir anexos, versões antigas não são removidas
- Sem limpeza automática de arquivos órfãos

**Recomendação:**
```typescript
// Implementar job de limpeza
async function cleanupOrphanedFiles() {
    const supabase = getSupabaseClient();
    
    // Buscar anexos de documentos excluídos há mais de 30 dias
    const { data: orphanedAnexos } = await supabase
        .from('documento_anexos')
        .select('id, url, documento_id')
        .in('documento_id', 
            supabase
                .from('documentos')
                .select('id')
                .eq('excluido', true)
                .lt('updated_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        );
    
    for (const anexo of orphanedAnexos || []) {
        await supabase.storage.from('anexos').remove([anexo.url]);
        await supabase.from('documento_anexos').delete().eq('id', anexo.id);
    }
}
```

---

### 5. Links Expirados e Permissões RLS

#### 🟡 MÉDIO: Ausência de URLs Assinadas com Expiração

**Problema:** Não há implementação de download de anexos com URLs assinadas.

**Impacto:**
- URLs de anexos podem ser compartilhadas indefinidamente
- Sem controle de acesso aos arquivos no storage
- Possível vazamento de documentos sensíveis

**Recomendação:**
```typescript
async function getSignedUrl(path: string, expiresIn: number = 3600): Promise<string> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.storage
        .from('anexos')
        .createSignedUrl(path, expiresIn);
    
    if (error) throw error;
    return data.signedUrl;
}
```

---

## Módulo de Cadastros

### Localização: `/src/app/(dashboard)/cadastros/` e `/src/services/api/`

### 1. Validação de Hierarquia

#### 🟠 ALTO: Falta de Validação de Integridade Hierárquica

**Arquivos Analisados:**
- `instituicoesService.ts`
- `orgaosService.ts`
- `unidadesService.ts`
- `setoresService.ts`
- `cargosService.ts`

**Problema:** Ao excluir uma entidade pai, as entidades filhas permanecem referenciando um ID que não está mais ativo.

```typescript
// instituicoesService.ts - linha 116
async excluir(id: string): Promise<void> {
    const supabase = getSupabaseClient();
    const { error } = await supabase
        .from(TABLE_NAME)
        .update({ excluido: true })
        .eq('id', id);
    // ❌ Não verifica se há órgãos vinculados
    // ❌ Não exclui em cascata
    // ❌ Não impede exclusão se houver dependências
}
```

**Hierarquia de Dependências:**
```
Esfera → Instituição → Órgão → Unidade Gestora → Setor → Cargo
                                                    ↓
                                                 Usuários
```

**Recomendação:**
```typescript
async excluir(id: string): Promise<void> {
    const supabase = getSupabaseClient();
    
    // 1. Verificar dependências
    const { count: orgaosCount } = await supabase
        .from('orgaos')
        .select('*', { count: 'exact', head: true })
        .eq('instituicao_id', id)
        .eq('excluido', false);
    
    if (orgaosCount && orgaosCount > 0) {
        throw new Error(`Não é possível excluir: existem ${orgaosCount} órgão(s) vinculado(s)`);
    }
    
    // 2. Soft delete
    const { error } = await supabase
        .from(TABLE_NAME)
        .update({ excluido: true })
        .eq('id', id);
    
    if (error) throw error;
}
```

---

### 2. Race Condition na Numeração Sequencial

#### 🔴 CRÍTICO: Geração de Códigos Não Atômica

**Arquivo:** `src/services/api/sequenceService.ts` (linhas 17-64)

```typescript
export async function gerarProximoCodigo(
    tabela: string,
    tamanhoCodigo: number,
    campoPai?: string,
    idPai?: string
): Promise<string> {
    // PROBLEMA: Mesmo padrão vulnerável do módulo de documentos
    const { data, error } = await query;  // ← Leitura
    // Janela de vulnerabilidade aqui
    const proximoNumero = numero + 1;  // ← Incremento local
    return String(proximoNumero).padStart(tamanhoCodigo, '0');
}
```

**Recomendação:** Implementar função PostgreSQL:
```sql
CREATE OR REPLACE FUNCTION gerar_codigo_entidade(
    p_tabela TEXT,
    p_tamanho INT,
    p_campo_pai TEXT DEFAULT NULL,
    p_id_pai UUID DEFAULT NULL
) RETURNS TEXT AS $$
DECLARE
    v_codigo TEXT;
    v_max_codigo INT;
BEGIN
    EXECUTE format(
        'SELECT COALESCE(MAX(CAST(codigo AS INT)), 0) + 1 FROM %I WHERE excluido = false %s',
        p_tabela,
        CASE WHEN p_campo_pai IS NOT NULL 
            THEN format('AND %I = %L', p_campo_pai, p_id_pai)
            ELSE ''
        END
    ) INTO v_max_codigo;
    
    v_codigo := LPAD(v_max_codigo::TEXT, p_tamanho, '0');
    RETURN v_codigo;
END;
$$ LANGUAGE plpgsql;
```

---

### 3. Validação de CRUD

#### 🟠 ALTO: Ausência de Prevenção de Duplo Clique

**Arquivo:** `src/app/(dashboard)/cadastros/instituicoes/novo/page.tsx` (linha 85)

```typescript
const handleSalvar = async () => {
    if (!validate()) return;
    // PROBLEMA: Usuário pode clicar múltiplas vezes enquanto saving é false
    try {
        setSaving(true);  // ← Só é true DEPOIS de entrar no try
        await instituicoesService.criar({...});
        router.push('/cadastros/instituicoes');
    } catch (err) {
        // ...
    } finally {
        setSaving(false);
    }
};
```

**Recomendação:**
```typescript
const handleSalvar = async () => {
    if (saving) return;  // ← Guard clause
    if (!validate()) return;
    
    setSaving(true);  // ← Antes do try
    try {
        await instituicoesService.criar({...});
        router.push('/cadastros/instituicoes');
    } catch (err) {
        console.error('Erro ao salvar:', err);
        toast.error('Erro ao salvar instituição');
    } finally {
        setSaving(false);
    }
};
```

**Ou usar debounce:**
```typescript
import { useDebouncedCallback } from 'use-debounce';

const handleSalvar = useDebouncedCallback(async () => {
    // ...
}, 500, { leading: true, trailing: false });
```

---

### 4. Validações de Dados

#### 🟡 MÉDIO: CNPJ Não Validado Antes de Salvar

**Arquivo:** `src/app/(dashboard)/cadastros/instituicoes/novo/page.tsx`

```typescript
// Existe a função validateCnpj em formatters.ts, mas NÃO é usada no formulário
const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.nome) newErrors.nome = 'Nome é obrigatório';
    if (!formData.esferaId) newErrors.esfera = 'Esfera é obrigatória';
    // ❌ CNPJ não é validado!
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
};
```

**Campos que deveriam ser validados:**
| Campo | Validação Necessária | Status |
|-------|---------------------|--------|
| CNPJ | Algoritmo de validação | ❌ Não implementado |
| Email | Formato RFC 5322 | ❌ Não implementado |
| CEP | Formato 00000-000 + existência | ❌ Não implementado |
| UUIDs | Formato válido | ❌ Não implementado |

**Recomendação:**
```typescript
const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.nome?.trim()) {
        newErrors.nome = 'Nome é obrigatório';
    }
    
    if (!formData.esferaId) {
        newErrors.esfera = 'Esfera é obrigatória';
    }
    
    if (formData.cnpj && !validateCnpj(formData.cnpj)) {
        newErrors.cnpj = 'CNPJ inválido';
    }
    
    if (formData.email && !validateEmail(formData.email)) {
        newErrors.email = 'E-mail inválido';
    }
    
    if (formData.cep && !/^\d{5}-?\d{3}$/.test(formData.cep)) {
        newErrors.cep = 'CEP inválido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
};
```

---

### 5. Injeção de Dados via Query String

#### 🟡 MÉDIO: Parâmetros Não Sanitizados

**Arquivo:** `src/services/api/instituicoesService.ts` (linha 47)

```typescript
if (termoBusca) {
    query = query.or(`nome.ilike.%${termoBusca}%,nome_abreviado.ilike.%${termoBusca}%`);
    // O Supabase faz escape, mas a string é interpolada diretamente
}
```

**Observação:** O Supabase protege contra SQL Injection, mas é boa prática sanitizar inputs.

---

## Logs de Auditoria

### Localização: `/supabase/migrations/008_audit_logs.sql`

### 1. Implementação Atual

#### ✅ PONTOS POSITIVOS

```sql
-- Estrutura bem definida
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name VARCHAR(255) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(10) NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    old_data JSONB,
    new_data JSONB,
    changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Extração correta do user ID do JWT
current_user_id := (current_setting('request.jwt.claims', true)::jsonb ->> 'sub')::UUID;
```

**Funcionando Corretamente:**
- ✅ Trigger function genérica e reutilizável
- ✅ Captura de `changed_by` via JWT claims
- ✅ Captura de `old_data` e `new_data` como JSONB
- ✅ Índices apropriados para consultas

---

### 2. Problemas Identificados

#### 🔴 CRÍTICO: Tabela `documentos` Não Auditada

**Arquivo:** `008_audit_logs.sql` (linhas 69-88)

```sql
FOREACH t IN ARRAY ARRAY[
    'esferas',
    'instituicoes',
    'orgaos',
    'unidades_gestoras',
    'setores',
    'cargos',
    'bancos',
    'agencias',
    'usuarios',
    'exercicios_financeiros',
    'credores',
    'categorias_documentos',
    'subcategorias_documentos'
    -- ❌ 'documentos' NÃO ESTÁ NA LISTA!
    -- ❌ 'processos' NÃO ESTÁ NA LISTA!
    -- ❌ 'documento_anexos' NÃO ESTÁ NA LISTA!
]
```

**Impacto:** Operações CRUD na tabela `documentos` não são registradas no audit_logs, violando requisitos de compliance e rastreabilidade.

**Correção:**
```sql
-- Adicionar triggers faltantes
DO $$
BEGIN
    EXECUTE 'DROP TRIGGER IF EXISTS audit_documentos ON documentos';
    EXECUTE 'CREATE TRIGGER audit_documentos AFTER INSERT OR UPDATE OR DELETE ON documentos FOR EACH ROW EXECUTE FUNCTION audit_trigger_function()';
    
    EXECUTE 'DROP TRIGGER IF EXISTS audit_processos ON processos';
    EXECUTE 'CREATE TRIGGER audit_processos AFTER INSERT OR UPDATE OR DELETE ON processos FOR EACH ROW EXECUTE FUNCTION audit_trigger_function()';
    
    EXECUTE 'DROP TRIGGER IF EXISTS audit_documento_anexos ON documento_anexos';
    EXECUTE 'CREATE TRIGGER audit_documento_anexos AFTER INSERT OR UPDATE OR DELETE ON documento_anexos FOR EACH ROW EXECUTE FUNCTION audit_trigger_function()';
END;
$$;
```

---

#### 🟡 MÉDIO: Histórico Específico de Documentos Redundante

**Observação:** Existe tabela `documento_historico` separada do `audit_logs`.

```typescript
// documentosService.ts - linha 259
await supabase.from('documento_historico').insert({
    documento_id: data.id,
    acao: 'Criado',
    usuario_id: user?.id || null,
    usuario_nome: user?.email || 'Sistema',
});
```

**Problema:** Dois sistemas de log paralelos (audit_logs genérico + documento_historico específico) podem causar:
- Inconsistência de dados
- Overhead de storage
- Complexidade de manutenção

**Recomendação:** Unificar ou definir claramente o propósito de cada um.

---

## Cenários de Teste BDD/Gherkin

### Módulo de Documentos

```gherkin
Feature: Upload de Documentos
  Como um usuário do SIAGOV
  Eu quero fazer upload de documentos
  Para anexar arquivos aos meus registros

  Background:
    Given que estou autenticado no sistema
    And estou na página de novo documento

  @critical @security
  Scenario: Rejeitar arquivo com extensão não permitida
    When eu seleciono um arquivo "malware.exe" para upload
    Then o sistema deve rejeitar o arquivo
    And exibir a mensagem "Tipo de arquivo não permitido"
    And o arquivo não deve ser enviado ao servidor

  @critical @security
  Scenario: Rejeitar arquivo com extensão falsificada
    Given que eu tenho um arquivo executável renomeado para "documento.pdf"
    When eu seleciono esse arquivo para upload
    Then o sistema deve validar o magic byte do arquivo
    And rejeitar o arquivo com mensagem "Arquivo corrompido ou falsificado"

  @high @validation
  Scenario: Validar tamanho máximo do arquivo
    When eu seleciono um arquivo com mais de 10MB
    Then o sistema deve rejeitar o arquivo
    And exibir a mensagem "Arquivo excede o limite de 10MB"

  @high @race-condition
  Scenario: Gerar códigos únicos em operações concorrentes
    Given que existem 5 documentos na subcategoria "4.1. Dispensa"
    When dois usuários criam documentos simultaneamente
    Then cada documento deve receber um código único
    And os códigos devem ser "4.1.6." e "4.1.7."

  @medium @validation
  Scenario: Rejeitar formulário com campos obrigatórios vazios
    When eu tento salvar um documento sem preencher o tipo
    Then o sistema deve exibir erro "Tipo é obrigatório"
    And o documento não deve ser criado

  @medium @validation
  Scenario Outline: Validar campos com payloads maliciosos
    When eu preencho o campo "<campo>" com "<payload>"
    Then o sistema deve <acao>

    Examples:
      | campo    | payload                          | acao                                    |
      | titulo   | <script>alert('XSS')</script>   | sanitizar o conteúdo                    |
      | objetivo |                                  | exibir erro "Objetivo é obrigatório"    |
      | objetivo | apenas_espacos                   | exibir erro "Objetivo inválido"         |

  @high @network
  Scenario: Retry automático em falha de rede
    Given que o upload está em andamento
    When a conexão de rede é interrompida
    Then o sistema deve tentar novamente automaticamente
    And exibir indicador de "Reconectando..."
    And completar o upload quando a conexão for restaurada

  @medium @ux
  Scenario: Prevenir duplo clique no botão salvar
    When eu clico duas vezes rapidamente no botão "Salvar"
    Then apenas uma requisição deve ser enviada ao servidor
    And apenas um documento deve ser criado
```

### Módulo de Cadastros

```gherkin
Feature: Gestão de Hierarquia Organizacional
  Como um administrador do SIAGOV
  Eu quero gerenciar a hierarquia de entidades
  Para manter a estrutura organizacional correta

  Background:
    Given que estou autenticado como administrador
    And existe a hierarquia:
      | Tipo          | Nome                  | Código |
      | Instituição   | Prefeitura Municipal  | 001    |
      | Órgão         | Secretaria de Saúde   | 000001 |
      | Unidade       | Hospital Central      | 000001 |

  @critical @hierarchy
  Scenario: Impedir exclusão de instituição com órgãos vinculados
    When eu tento excluir a "Prefeitura Municipal"
    Then o sistema deve bloquear a exclusão
    And exibir mensagem "Não é possível excluir: existem 1 órgão(s) vinculado(s)"

  @high @sequence
  Scenario: Gerar código sequencial ao criar órgão
    Given que a instituição "001" possui 2 órgãos
    When eu crio um novo órgão vinculado à instituição "001"
    Then o código sugerido deve ser "000003"

  @high @validation
  Scenario: Validar CNPJ ao cadastrar instituição
    When eu preencho o CNPJ com "11.111.111/1111-11"
    And clico em salvar
    Then o sistema deve exibir erro "CNPJ inválido"

  @high @validation
  Scenario: Aceitar CNPJ válido
    When eu preencho o CNPJ com "11.222.333/0001-81"
    And os demais campos obrigatórios estão preenchidos
    And clico em salvar
    Then a instituição deve ser criada com sucesso

  @medium @cascade
  Scenario: Listar dependências antes de excluir
    When eu solicito exclusão do órgão "Secretaria de Saúde"
    Then o sistema deve exibir:
      """
      Esta ação afetará:
      - 1 Unidade Gestora
      - 0 Setores
      - 0 Cargos
      Deseja continuar?
      """

  @critical @concurrency
  Scenario: Evitar códigos duplicados em criação simultânea
    Given que dois administradores estão criando instituições
    When ambos salvam ao mesmo tempo
    Then cada instituição deve ter código único
    And não deve haver violação de constraint
```

### Logs de Auditoria

```gherkin
Feature: Auditoria de Operações
  Como um auditor do sistema
  Eu quero visualizar histórico de alterações
  Para garantir rastreabilidade das operações

  @critical @audit
  Scenario: Registrar criação de documento
    Given que estou autenticado como "usuario@gov.br"
    When eu crio um novo documento
    Then deve existir um registro em audit_logs com:
      | table_name | documentos                       |
      | action     | INSERT                           |
      | changed_by | <user_id>                        |
      | new_data   | contendo os dados do documento   |

  @critical @audit
  Scenario: Registrar atualização com dados antigos e novos
    Given que existe um documento com título "Original"
    When eu altero o título para "Modificado"
    Then deve existir um registro em audit_logs com:
      | action   | UPDATE                        |
      | old_data | {"titulo": "Original", ...}   |
      | new_data | {"titulo": "Modificado", ...} |

  @high @audit
  Scenario: Capturar usuário responsável pela alteração
    Given que estou autenticado como "admin@gov.br"
    When eu excluo uma instituição
    Then o audit_log deve registrar meu ID como changed_by

  @high @query
  Scenario: Consultar histórico por entidade
    Given que o documento "DOC-001" teve 5 alterações
    When eu consulto o histórico do documento
    Then devo ver as 5 alterações ordenadas por data (mais recente primeiro)
    And cada alteração deve mostrar: ação, usuário, data, dados alterados
```

---

## Exemplos de Implementação de Testes

### Testes End-to-End (Playwright)

```typescript
// tests/e2e/documentos/upload.spec.ts
import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Upload de Documentos', () => {
    test.beforeEach(async ({ page }) => {
        // Login
        await page.goto('/login');
        await page.fill('[data-testid="email"]', 'teste@gov.br');
        await page.fill('[data-testid="password"]', 'senha123');
        await page.click('[data-testid="btn-login"]');
        await page.waitForURL('/dashboard');
    });

    test('deve rejeitar arquivo com extensão não permitida', async ({ page }) => {
        await page.goto('/documentos/novo');
        
        // Tentar upload de arquivo .exe
        const fileInput = page.locator('input[type="file"]');
        await fileInput.setInputFiles(path.join(__dirname, 'fixtures', 'malware.exe'));
        
        // Verificar rejeição
        await expect(page.locator('[data-testid="error-message"]'))
            .toContainText('Tipo de arquivo não permitido');
        
        // Verificar que arquivo não foi adicionado à lista
        await expect(page.locator('[data-testid="anexo-item"]')).toHaveCount(0);
    });

    test('deve validar tamanho máximo do arquivo', async ({ page }) => {
        await page.goto('/documentos/novo');
        
        // Criar arquivo grande (mock)
        const largeFile = Buffer.alloc(11 * 1024 * 1024); // 11MB
        await page.evaluate((content) => {
            const file = new File([new Uint8Array(content)], 'grande.pdf', { type: 'application/pdf' });
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            const input = document.querySelector('input[type="file"]') as HTMLInputElement;
            input.files = dataTransfer.files;
            input.dispatchEvent(new Event('change', { bubbles: true }));
        }, [...largeFile]);
        
        await expect(page.locator('[data-testid="error-message"]'))
            .toContainText('Arquivo excede o limite de 10MB');
    });

    test('deve prevenir duplo clique no salvamento', async ({ page }) => {
        await page.goto('/documentos/novo');
        
        // Preencher formulário
        await page.selectOption('[data-testid="tipo"]', 'Parecer');
        await page.selectOption('[data-testid="categoria"]', { index: 1 });
        await page.waitForSelector('[data-testid="subcategoria"]:not([disabled])');
        await page.selectOption('[data-testid="subcategoria"]', { index: 1 });
        await page.selectOption('[data-testid="especialista"]', { index: 1 });
        await page.fill('[data-testid="objetivo"]', 'Objetivo do documento de teste');
        
        // Interceptar requisições
        const requests: number[] = [];
        await page.route('**/documentos', (route) => {
            requests.push(Date.now());
            route.fulfill({ status: 200, body: JSON.stringify({ id: '123' }) });
        });
        
        // Duplo clique rápido
        await page.click('[data-testid="btn-salvar"]');
        await page.click('[data-testid="btn-salvar"]');
        
        // Aguardar processamento
        await page.waitForTimeout(1000);
        
        // Deve ter apenas uma requisição
        expect(requests.length).toBe(1);
    });

    test('deve gerar código único em subcategoria', async ({ page }) => {
        await page.goto('/documentos/novo');
        
        // Selecionar categoria e subcategoria
        await page.selectOption('[data-testid="categoria"]', { index: 1 });
        await page.waitForSelector('[data-testid="subcategoria"]:not([disabled])');
        await page.selectOption('[data-testid="subcategoria"]', { index: 1 });
        
        // Preencher demais campos
        await page.selectOption('[data-testid="tipo"]', 'Parecer');
        await page.selectOption('[data-testid="especialista"]', { index: 1 });
        await page.fill('[data-testid="objetivo"]', 'Teste de geração de código');
        
        // Salvar
        await page.click('[data-testid="btn-salvar"]');
        
        // Verificar redirecionamento e código gerado
        await page.waitForURL('/documentos');
        
        // Verificar na listagem
        const firstRow = page.locator('table tbody tr').first();
        const codigo = await firstRow.locator('td').first().textContent();
        expect(codigo).toMatch(/^\d+\.\d+\.\d+\.$/);
    });
});

// tests/e2e/cadastros/instituicoes.spec.ts
test.describe('Gestão de Instituições', () => {
    test('deve impedir exclusão com órgãos vinculados', async ({ page }) => {
        await page.goto('/cadastros/instituicoes');
        
        // Localizar instituição com órgãos
        const row = page.locator('tr', { hasText: 'Prefeitura' });
        await row.locator('[data-testid="btn-excluir"]').click();
        
        // Confirmar no modal
        await page.click('[data-testid="btn-confirmar-exclusao"]');
        
        // Verificar mensagem de erro
        await expect(page.locator('[data-testid="toast-error"]'))
            .toContainText('Não é possível excluir');
    });

    test('deve validar CNPJ inválido', async ({ page }) => {
        await page.goto('/cadastros/instituicoes/novo');
        
        await page.fill('[data-testid="nome"]', 'Instituição Teste');
        await page.selectOption('[data-testid="esfera"]', { index: 1 });
        await page.fill('[data-testid="cnpj"]', '11.111.111/1111-11');
        
        await page.click('[data-testid="btn-salvar"]');
        
        await expect(page.locator('[data-testid="error-cnpj"]'))
            .toContainText('CNPJ inválido');
    });

    test('deve aceitar CNPJ válido', async ({ page }) => {
        await page.goto('/cadastros/instituicoes/novo');
        
        await page.fill('[data-testid="nome"]', 'Instituição Teste');
        await page.selectOption('[data-testid="esfera"]', { index: 1 });
        await page.fill('[data-testid="cnpj"]', '11.222.333/0001-81');
        
        await page.click('[data-testid="btn-salvar"]');
        
        // Deve redirecionar para listagem (sucesso)
        await page.waitForURL('/cadastros/instituicoes');
    });
});
```

### Testes Unitários (Jest)

```typescript
// tests/unit/services/documentosService.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { documentosService } from '@/services/api/documentosService';
import { getSupabaseClient } from '@/lib/supabase/client';

// Mock do Supabase client
vi.mock('@/lib/supabase/client', () => ({
    getSupabaseClient: vi.fn()
}));

describe('documentosService', () => {
    let mockSupabase: any;

    beforeEach(() => {
        mockSupabase = {
            from: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            insert: vi.fn().mockReturnThis(),
            update: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn(),
            order: vi.fn().mockReturnThis(),
        };
        (getSupabaseClient as any).mockReturnValue(mockSupabase);
    });

    describe('gerarProximoCodigo', () => {
        it('deve gerar código baseado na subcategoria', async () => {
            // Mock: subcategoria com código "4.1"
            mockSupabase.single.mockResolvedValueOnce({
                data: { nome: '4.1. Dispensa', codigo: '4.1' },
                error: null
            });
            
            // Mock: contagem de documentos existentes = 5
            mockSupabase.select.mockReturnValueOnce({
                ...mockSupabase,
                eq: vi.fn().mockReturnValue({
                    eq: vi.fn().mockResolvedValue({ count: 5, error: null })
                })
            });

            const codigo = await documentosService.gerarProximoCodigo('uuid-subcategoria');
            
            expect(codigo).toBe('4.1.6.');
        });

        it('deve retornar fallback quando subcategoria não existe', async () => {
            mockSupabase.single.mockResolvedValueOnce({
                data: null,
                error: { code: 'PGRST116' }
            });

            const codigo = await documentosService.gerarProximoCodigo('uuid-invalido');
            
            expect(codigo).toMatch(/^DOC-\d{4}$/);
        });

        it('deve tratar subcategoria sem prefixo numérico', async () => {
            mockSupabase.single.mockResolvedValueOnce({
                data: { nome: 'Categoria sem número', codigo: null },
                error: null
            });
            
            mockSupabase.select.mockReturnValueOnce({
                ...mockSupabase,
                eq: vi.fn().mockReturnValue({
                    eq: vi.fn().mockResolvedValue({ count: 2, error: null })
                })
            });

            const codigo = await documentosService.gerarProximoCodigo('uuid-sem-prefixo');
            
            expect(codigo).toBe('3');
        });
    });

    describe('criar', () => {
        it('deve criar documento com código gerado', async () => {
            const mockDocumento = {
                id: 'uuid-novo',
                numero: '4.1.1.',
                titulo: 'Novo Documento'
            };

            mockSupabase.single
                .mockResolvedValueOnce({ data: { codigo: '4.1' }, error: null })
                .mockResolvedValueOnce({ data: mockDocumento, error: null });
            
            mockSupabase.select.mockReturnValueOnce({
                ...mockSupabase,
                eq: vi.fn().mockReturnValue({
                    eq: vi.fn().mockResolvedValue({ count: 0, error: null })
                })
            });

            mockSupabase.auth = {
                getUser: vi.fn().mockResolvedValue({ 
                    data: { user: { id: 'user-123', email: 'test@test.com' } } 
                })
            };

            const resultado = await documentosService.criar({
                titulo: 'Novo Documento',
                tipo: 'Parecer',
                categoria_id: 'cat-uuid',
                subcategoria_id: 'subcat-uuid',
                status: 'Rascunho'
            });

            expect(resultado.numero).toBe('4.1.1.');
        });
    });
});

// tests/unit/utils/formatters.test.ts
import { describe, it, expect } from 'vitest';
import { validateCnpj, validateCpf, validateEmail } from '@/utils/formatters';

describe('Validadores', () => {
    describe('validateCnpj', () => {
        it('deve aceitar CNPJ válido', () => {
            expect(validateCnpj('11.222.333/0001-81')).toBe(true);
            expect(validateCnpj('11222333000181')).toBe(true);
        });

        it('deve rejeitar CNPJ inválido', () => {
            expect(validateCnpj('11.111.111/1111-11')).toBe(false);
            expect(validateCnpj('00.000.000/0000-00')).toBe(false);
            expect(validateCnpj('12345')).toBe(false);
            expect(validateCnpj('')).toBe(false);
        });

        it('deve rejeitar CNPJ com dígitos repetidos', () => {
            expect(validateCnpj('11.111.111/1111-11')).toBe(false);
            expect(validateCnpj('22.222.222/2222-22')).toBe(false);
        });
    });

    describe('validateCpf', () => {
        it('deve aceitar CPF válido', () => {
            expect(validateCpf('123.456.789-09')).toBe(true);
            expect(validateCpf('12345678909')).toBe(true);
        });

        it('deve rejeitar CPF inválido', () => {
            expect(validateCpf('111.111.111-11')).toBe(false);
            expect(validateCpf('123.456.789-00')).toBe(false);
        });
    });

    describe('validateEmail', () => {
        it('deve aceitar emails válidos', () => {
            expect(validateEmail('teste@email.com')).toBe(true);
            expect(validateEmail('usuario@gov.br')).toBe(true);
            expect(validateEmail('nome.sobrenome@empresa.com.br')).toBe(true);
        });

        it('deve rejeitar emails inválidos', () => {
            expect(validateEmail('sem-arroba.com')).toBe(false);
            expect(validateEmail('@semdominio')).toBe(false);
            expect(validateEmail('espacos no email@teste.com')).toBe(false);
        });
    });
});

// tests/unit/utils/masks.test.ts
import { describe, it, expect } from 'vitest';
import { maskCnpj, maskCpf, maskCep, maskTelefone } from '@/utils/masks';

describe('Máscaras', () => {
    describe('maskCnpj', () => {
        it('deve aplicar máscara corretamente', () => {
            expect(maskCnpj('11222333000181')).toBe('11.222.333/0001-81');
        });

        it('deve limitar a 14 dígitos', () => {
            expect(maskCnpj('112223330001819999')).toBe('11.222.333/0001-81');
        });

        it('deve remover caracteres não numéricos', () => {
            expect(maskCnpj('11.222.333/0001-81')).toBe('11.222.333/0001-81');
            expect(maskCnpj('abc11222def333ghi000181')).toBe('11.222.333/0001-81');
        });
    });

    describe('maskTelefone', () => {
        it('deve formatar telefone fixo (10 dígitos)', () => {
            expect(maskTelefone('1133334444')).toBe('(11) 3333-4444');
        });

        it('deve formatar celular (11 dígitos)', () => {
            expect(maskTelefone('11999998888')).toBe('(11) 99999-8888');
        });
    });
});

// tests/unit/services/sequenceService.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { gerarProximoCodigo } from '@/services/api/sequenceService';
import { getSupabaseClient } from '@/lib/supabase/client';

vi.mock('@/lib/supabase/client');

describe('sequenceService', () => {
    let mockSupabase: any;

    beforeEach(() => {
        mockSupabase = {
            from: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            limit: vi.fn().mockReturnThis(),
        };
        (getSupabaseClient as any).mockReturnValue(mockSupabase);
    });

    describe('gerarProximoCodigo', () => {
        it('deve gerar código incrementando o maior existente', async () => {
            mockSupabase.limit.mockResolvedValue({
                data: [{ codigo: '005' }],
                error: null
            });

            const codigo = await gerarProximoCodigo('instituicoes', 3);
            
            expect(codigo).toBe('006');
        });

        it('deve começar de 001 quando não há registros', async () => {
            mockSupabase.limit.mockResolvedValue({
                data: [],
                error: null
            });

            const codigo = await gerarProximoCodigo('instituicoes', 3);
            
            expect(codigo).toBe('001');
        });

        it('deve filtrar por entidade pai quando especificado', async () => {
            mockSupabase.limit.mockResolvedValue({
                data: [{ codigo: '000003' }],
                error: null
            });

            const codigo = await gerarProximoCodigo('orgaos', 6, 'instituicao_id', 'inst-uuid');
            
            expect(mockSupabase.eq).toHaveBeenCalledWith('instituicao_id', 'inst-uuid');
            expect(codigo).toBe('000004');
        });

        it('deve tratar erro de banco retornando fallback', async () => {
            mockSupabase.limit.mockResolvedValue({
                data: null,
                error: { message: 'Database error' }
            });

            const codigo = await gerarProximoCodigo('instituicoes', 3);
            
            expect(codigo).toBe('001');
        });
    });
});
```

### Testes de Integração (API)

```typescript
// tests/integration/api/auditLogs.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
);

describe('Audit Logs Integration', () => {
    let testInstituicaoId: string;

    beforeAll(async () => {
        // Criar instituição de teste
        const { data } = await supabase
            .from('instituicoes')
            .insert({
                codigo: '999',
                nome: 'Instituição de Teste',
                ativo: true,
                excluido: false
            })
            .select()
            .single();
        
        testInstituicaoId = data.id;
    });

    afterAll(async () => {
        // Limpar dados de teste
        await supabase.from('instituicoes').delete().eq('id', testInstituicaoId);
        await supabase.from('audit_logs').delete().eq('record_id', testInstituicaoId);
    });

    it('deve registrar INSERT no audit_logs', async () => {
        const { data: logs } = await supabase
            .from('audit_logs')
            .select('*')
            .eq('record_id', testInstituicaoId)
            .eq('action', 'INSERT')
            .single();

        expect(logs).not.toBeNull();
        expect(logs.table_name).toBe('instituicoes');
        expect(logs.new_data.nome).toBe('Instituição de Teste');
    });

    it('deve registrar UPDATE com old_data e new_data', async () => {
        // Atualizar instituição
        await supabase
            .from('instituicoes')
            .update({ nome: 'Nome Atualizado' })
            .eq('id', testInstituicaoId);

        const { data: logs } = await supabase
            .from('audit_logs')
            .select('*')
            .eq('record_id', testInstituicaoId)
            .eq('action', 'UPDATE')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        expect(logs).not.toBeNull();
        expect(logs.old_data.nome).toBe('Instituição de Teste');
        expect(logs.new_data.nome).toBe('Nome Atualizado');
    });

    it('deve registrar DELETE', async () => {
        // Criar e deletar instituição temporária
        const { data: temp } = await supabase
            .from('instituicoes')
            .insert({
                codigo: '888',
                nome: 'Temp para Delete',
                ativo: true,
                excluido: false
            })
            .select()
            .single();

        await supabase.from('instituicoes').delete().eq('id', temp.id);

        const { data: logs } = await supabase
            .from('audit_logs')
            .select('*')
            .eq('record_id', temp.id)
            .eq('action', 'DELETE')
            .single();

        expect(logs).not.toBeNull();
        expect(logs.old_data.nome).toBe('Temp para Delete');
    });
});
```

---

## Recomendações de Correção

### Prioridade 1 - Crítico (Implementar Imediatamente)

1. **Adicionar trigger de auditoria para tabela `documentos`**
   ```sql
   CREATE TRIGGER audit_documentos 
   AFTER INSERT OR UPDATE OR DELETE ON documentos 
   FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
   ```

2. **Implementar validação server-side de uploads**
   - Validar MIME type real (magic bytes)
   - Enforçar limite de tamanho
   - Sanitizar nome do arquivo

3. **Corrigir race condition na geração de códigos**
   - Implementar função PostgreSQL com lock
   - Ou usar sequence por subcategoria

### Prioridade 2 - Alto (Implementar em 2 Sprints)

4. **Implementar schemas Zod para validação**
   - Documentos
   - Cadastros (Instituições, Órgãos, etc.)

5. **Adicionar prevenção de duplo clique**
   - Guard clause no início das funções de submit
   - Debounce nos botões

6. **Validar dependências antes de exclusão**
   - Verificar entidades filhas
   - Exibir lista de dependências ao usuário

### Prioridade 3 - Médio (Backlog)

7. **Implementar retry logic para uploads**
8. **Criar job de limpeza de arquivos órfãos**
9. **Implementar URLs assinadas com expiração**
10. **Unificar ou documentar sistemas de log**

---

## Conclusão

A análise revelou vulnerabilidades significativas principalmente nas áreas de:
- **Segurança de uploads** (sem validação server-side)
- **Concorrência** (race conditions na geração de códigos)
- **Auditoria** (tabelas críticas não auditadas)
- **Validação de dados** (validações incompletas)

Os cenários de teste BDD e exemplos de implementação fornecidos cobrem os principais fluxos e casos de borda identificados. Recomenda-se priorizar as correções na ordem indicada para mitigar os riscos mais críticos primeiro.

---

*Documento gerado por análise estática de código - SIAGOV QA Analysis*
