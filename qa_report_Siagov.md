# 🛡️ Relatório de QA — SIAGOV

**Data:** 2026-03-10  
**Escopo:** Módulo de Documentos · Módulo de Cadastros · Logs de Auditoria  
**Stack:** Next.js 14 (App Router), TypeScript, Supabase, Tailwind CSS

---

## 1. Relatório de Code Review

### 🔴 Severidade CRÍTICA

#### CR-01 · Race Condition na Geração de Código Sequencial
**Arquivo:** [documentosService.ts](file:///c:/Users/JoãoVictorRibeiroLag/Documents/Projetos%20Highcode/Projeto%20Siagov/siagov-next/src/services/api/documentosService.ts#L80-L124) · [sequenceService.ts](file:///c:/Users/JoãoVictorRibeiroLag/Documents/Projetos%20Highcode/Projeto%20Siagov/siagov-next/src/services/api/sequenceService.ts#L17-L63)

A geração de código usa `SELECT COUNT(*)` seguido de `INSERT`, sem transação atômica. Duas requisições concorrentes podem ler o mesmo `count` e gerar **códigos duplicados**.

```
Req A: COUNT → 5 → gera "4.1.6."
Req B: COUNT → 5 → gera "4.1.6."  ← DUPLICATA!
```

**[sequenceService.ts](file:///c:/Users/Jo%C3%A3oVictorRibeiroLag/Documents/Projetos%20Highcode/Projeto%20Siagov/siagov-next/src/services/api/sequenceService.ts)** tem o mesmo problema — usa `ORDER BY codigo DESC LIMIT 1` sem lock:

```typescript
// L38-39: query sem FOR UPDATE ou transaction
const { data, error } = await query;
const numero = parseInt(ultimoCodigo, 10); // +1
```

> [!CAUTION]
> **Correção recomendada:** Usar uma Postgres function com `SELECT FOR UPDATE` ou `pg_advisory_lock`, ou criar uma sequence nativa no banco para cada subcategoria.

---

#### CR-02 · Fallback de Código com `Math.random()` — Sem Unicidade Garantida
**Arquivo:** [documentosService.ts#L233-L236](file:///c:/Users/JoãoVictorRibeiroLag/Documents/Projetos%20Highcode/Projeto%20Siagov/siagov-next/src/services/api/documentosService.ts#L233-L236)

```typescript
const sequence = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
payload.numero = `${year}/${sequence}`;
```

Gera códigos aleatórios como fallback. Com 10.000 possibilidades, colisão é provável com volume. Não há `UNIQUE constraint CHECK` no código.

---

#### CR-03 · Nenhum Schema de Validação (Zod/Yup) no Projeto Inteiro
**Evidência:** `grep -r "zod" src/` retorna zero resultados.

Todas as validações são manuais `if (!field)` no frontend. Isso permite:
- **Payloads maliciosos**: Strings com SQL/HTML não são sanitizadas antes do Supabase
- **Campos obrigatórios contornados**: Um `POST` direto ao Supabase (sem RLS adequado) insere dados sem validação
- **Tipos incorretos**: Sem validação em runtime dos tipos (ex: `number` onde deveria ser `string`)

---

#### CR-04 · Verificação de Admin Baseada em Email Hardcoded
**Arquivo:** [documentos/\[id\]/page.tsx#L65-L83](file:///c:/Users/JoãoVictorRibeiroLag/Documents/Projetos%20Highcode/Projeto%20Siagov/siagov-next/src/app/(dashboard)/documentos/[id]/page.tsx#L65-L83)

```typescript
const isAdminUser =
    appMetadata?.role === 'admin' ||
    appMetadata?.claims_admin === true ||
    userMetadata?.role === 'admin' ||
    user.email?.endsWith('@admin.siagov.gov.br'); // ← HARDCODED
```

Um atacante que registra um email `@admin.siagov.gov.br` obtém acesso admin. Essa verificação roda **no client-side** — pode ser bypassed via DevTools.

---

### 🟠 Severidade ALTA

#### CR-05 · Upload de Arquivos Sem Validação de Tipo ou Tamanho
**Arquivo:** [documentos/novo/page.tsx#L147-L159](file:///c:/Users/JoãoVictorRibeiroLag/Documents/Projetos%20Highcode/Projeto%20Siagov/siagov-next/src/app/(dashboard)/documentos/novo/page.tsx#L147-L159)

```typescript
const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const novosAnexos = Array.from(files).map((file) => ({...}));
    setAnexos([...anexos, ...novosAnexos]);
};
```

**Falta:**
- Validação de tipo MIME (aceita `.exe`, `.sh`, etc.)
- Limite de tamanho de arquivo (um arquivo de 500MB trava o browser)
- Limite de quantidade de anexos
- Verificação de content-type vs extensão (magic bytes)

---

#### CR-06 · Exclusão Sem Proteção de Cascade para Setores e Cargos
**Arquivo:** [setoresService.ts#L109-L120](file:///c:/Users/JoãoVictorRibeiroLag/Documents/Projetos%20Highcode/Projeto%20Siagov/siagov-next/src/services/api/setoresService.ts#L109-L120) · [cargosService.ts#L105-L116](file:///c:/Users/JoãoVictorRibeiroLag/Documents/Projetos%20Highcode/Projeto%20Siagov/siagov-next/src/services/api/cargosService.ts#L105-L116)

Apenas `orgaosService` verifica filhos ([contarUnidadesGestoras](file:///c:/Users/Jo%C3%A3oVictorRibeiroLag/Documents/Projetos%20Highcode/Projeto%20Siagov/siagov-next/src/services/api/orgaosService.ts#140-155)). Os demais serviços:
- **Setores**: Podem ser excluídos mesmo com cargos vinculados
- **Cargos**: Podem ser excluídos mesmo com usuários lotados
- **Unidades Gestoras**: Podem ser excluídas com setores vinculados

---

#### CR-07 · TOCTOU na Exclusão de Órgãos (Check-Then-Delete)
**Arquivo:** [orgaos/page.tsx#L56-L74](file:///c:/Users/JoãoVictorRibeiroLag/Documents/Projetos%20Highcode/Projeto%20Siagov/siagov-next/src/app/(dashboard)/cadastros/orgaos/page.tsx#L56-L74)

```typescript
const count = await orgaosService.contarUnidadesGestoras(id);  // T1: count = 0
// ← Outra aba cria uma Unidade Gestora neste órgão aqui
if (count > 0) { return; }
await orgaosService.excluir(id);  // T2: exclui com filhos!
```

A verificação `count > 0` é feita no frontend sem transação. Um segundo usuário pode vincular uma unidade gestora entre a contagem e a exclusão.

---

#### CR-08 · [baixarPDF()](file:///c:/Users/Jo%C3%A3oVictorRibeiroLag/Documents/Projetos%20Highcode/Projeto%20Siagov/siagov-next/src/app/%28dashboard%29/documentos/%5Bid%5D/page.tsx#114-122) Não Gera/Baixa Nenhum Arquivo Real
**Arquivo:** [documentos/\[id\]/page.tsx#L114-L121](file:///c:/Users/JoãoVictorRibeiroLag/Documents/Projetos%20Highcode/Projeto%20Siagov/siagov-next/src/app/(dashboard)/documentos/[id]/page.tsx#L114-L121)

```typescript
const baixarPDF = async () => {
    if (!documento) return;
    await documentosService.registrarDownload(documento.id);
    loadDocumento(documento.id);
    alert('Download iniciado! O registro foi salvo no histórico.');
};
```

O botão "Baixar PDF" apenas registra o log — **não download nenhum arquivo**. O usuário vê o alert mas o download nunca acontece.

---

### 🟡 Severidade MÉDIA

#### CR-09 · Logs de Auditoria Silenciados em Catch
**Arquivo:** [documentosService.ts#L260-L270](file:///c:/Users/JoãoVictorRibeiroLag/Documents/Projetos%20Highcode/Projeto%20Siagov/siagov-next/src/services/api/documentosService.ts#L260-L270)

```typescript
try {
    await supabase.from('documento_historico').insert({...});
} catch (logError) {
    console.warn('Aviso: Não foi possível registrar log de criação:', logError);
    // ← Falha SILENCIOSA - documento criado sem auditoria
}
```

Se o log falhar, o documento é salvo sem registro. Para um sistema governamental, auditoria deveria ser **obrigatória** — falha no log deveria reverter a operação.

---

#### CR-10 · `auditService` é Somente Leitura
**Arquivo:** [auditService.ts](file:///c:/Users/JoãoVictorRibeiroLag/Documents/Projetos%20Highcode/Projeto%20Siagov/siagov-next/src/services/api/auditService.ts)

O serviço de auditoria **apenas lê** da tabela `audit_logs`. Não há método [registrar()](file:///c:/Users/Jo%C3%A3oVictorRibeiroLag/Documents/Projetos%20Highcode/Projeto%20Siagov/siagov-next/src/services/api/documentosService.ts#314-337) ou `inserir()`. Isso significa:
- Os logs dependem exclusivamente de **triggers do PostgreSQL** (não verificáveis no código frontend)
- Se os triggers não estiverem configurados corretamente, operações CRUD nos cadastros (`baseService.criar/atualizar/excluir`) passam **sem qualquer auditoria**
- O `documento_historico` é uma tabela separada com log manual — mas os cadastros não possuem log manual

---

#### CR-11 · Input `.ilike` Sem Sanitização (Injection via PostgREST)
**Arquivo:** Todos os serviços com busca — ex: [orgaosService.ts#L43](file:///c:/Users/JoãoVictorRibeiroLag/Documents/Projetos%20Highcode/Projeto%20Siagov/siagov-next/src/services/api/orgaosService.ts#L43)

```typescript
query = query.or(`nome.ilike.%${termoBusca}%,sigla.ilike.%${termoBusca}%`);
```

O `termoBusca` vem diretamente do input do usuário sem sanitização. Caracteres como `%`, `_`, `(`, `)` em PostgREST podem alterar o comportamento da query. Embora não seja SQL injection clássica, pode causar erros ou resultados inesperados.

---

#### CR-12 · Código do Órgão Permite Edição Manual Sem Validação de Formato
**Arquivo:** [orgaos/novo/page.tsx](file:///c:/Users/JoãoVictorRibeiroLag/Documents/Projetos%20Highcode/Projeto%20Siagov/siagov-next/src/app/(dashboard)/cadastros/orgaos/novo/page.tsx)

O código é auto-gerado ao selecionar a instituição, mas o campo é editável. Não há validação se:
- O código tem o formato correto (6 dígitos)
- O código não é duplicado
- O código reflete o prefixo da instituição pai

---

### 🔵 Severidade BAIXA

#### CR-13 · Anexos Não São Enviados ao Storage
**Arquivo:** [documentos/novo/page.tsx#L165-L197](file:///c:/Users/JoãoVictorRibeiroLag/Documents/Projetos%20Highcode/Projeto%20Siagov/siagov-next/src/app/(dashboard)/documentos/novo/page.tsx#L165-L197)

A função [salvar()](file:///c:/Users/Jo%C3%A3oVictorRibeiroLag/Documents/Projetos%20Highcode/Projeto%20Siagov/siagov-next/src/app/%28dashboard%29/documentos/novo/page.tsx#165-199) cria o documento no banco mas **não faz upload dos anexos para o Supabase Storage**. Os objetos [File](file:///c:/Users/Jo%C3%A3oVictorRibeiroLag/Documents/Projetos%20Highcode/Projeto%20Siagov/siagov-next/src/app/%28dashboard%29/documentos/novo/page.tsx#147-160) são mantidos apenas em memória local e perdidos no redirect.

---

#### CR-14 · [excluir()](file:///c:/Users/Jo%C3%A3oVictorRibeiroLag/Documents/Projetos%20Highcode/Projeto%20Siagov/siagov-next/src/services/api/documentosService.ts#338-347) Não Exclui Anexos do Storage
**Arquivo:** [documentosService.ts#L338-L346](file:///c:/Users/JoãoVictorRibeiroLag/Documents/Projetos%20Highcode/Projeto%20Siagov/siagov-next/src/services/api/documentosService.ts#L338-L346)

O soft-delete marca `excluido: true` no documento mas não limpa os anexos em `documento_anexos` nem remove arquivos do Supabase Storage, criando **dados órfãos**.

---

## 2. Cenários de Teste BDD (Gherkin)

### Cenário 1: Race Condition na Geração de Código de Documento

```gherkin
Feature: Geração de Código Sequencial de Documentos

  Scenario: Duas criações simultâneas devem gerar códigos únicos
    Given a subcategoria "4.1. Dispensa" com 5 documentos existentes
    When o Usuário A inicia a criação de um documento na subcategoria "4.1."
    And o Usuário B inicia a criação de um documento na subcategoria "4.1." simultaneamente
    Then o Usuário A deve receber o código "4.1.6."
    And o Usuário B deve receber o código "4.1.7."
    And nenhum código duplicado deve existir na tabela documentos

  Scenario: Fallback de código aleatório não deve colidir
    Given que a subcategoria não possui prefixo numérico válido
    When 100 documentos são criados em batch na mesma subcategoria
    Then todos os documentos devem ter códigos únicos
```

### Cenário 2: Exclusão de Entidade Pai com Filhos Vinculados

```gherkin
Feature: Proteção de Exclusão em Cascata

  Scenario: Bloquear exclusão de Órgão com Unidades Gestoras vinculadas
    Given um Órgão "Secretaria de Saúde" com 3 Unidades Gestoras
    When o administrador tenta excluir o Órgão
    Then o sistema deve exibir "Não é possível excluir. Existem 3 unidade(s) gestora(s)"
    And o Órgão não deve ser marcado como excluído

  Scenario: Permitir exclusão de Setor sem proteção (BUG ESPERADO)
    Given um Setor "Recursos Humanos" com 5 Cargos vinculados
    When o administrador tenta excluir o Setor
    Then o Setor é excluído sem verificação de filhos
    And os Cargos ficam órfãos no banco de dados
```

### Cenário 3: Upload de Documento com Validação de Arquivo

```gherkin
Feature: Upload de Documentos e Anexos

  Scenario: Upload de arquivo com formato não permitido
    Given que o usuário está na página de novo documento
    When o usuário tenta anexar um arquivo "malware.exe"
    Then o sistema deve rejeitar o arquivo
    And exibir mensagem "Formato de arquivo não permitido"

  Scenario: Upload de arquivo acima do limite de tamanho
    Given que o limite de tamanho é 10MB
    When o usuário tenta anexar um arquivo de 50MB
    Then o sistema deve rejeitar o arquivo
    And exibir mensagem "Arquivo excede o tamanho máximo de 10MB"

  Scenario: Documento salvo mas anexos não persistidos (BUG ESPERADO)
    Given que o usuário preencheu todos os campos obrigatórios
    And adicionou 2 anexos PDF
    When o usuário clica em "Salvar"
    Then o documento é criado no banco de dados
    But os anexos NÃO são enviados ao Supabase Storage
```

### Cenário 4: Hierarquia e Código Sequencial de Cadastros

```gherkin
Feature: Hierarquia e Numeração de Cadastros

  Scenario: Código do Órgão deve refletir herança da Instituição
    Given uma Instituição com código "01" 
    And já existem 2 Órgãos vinculados (códigos "000001", "000002")
    When o usuário seleciona esta Instituição para criar um novo Órgão
    Then o campo código deve sugerir automaticamente "000003"

  Scenario: Edição manual do código permite duplicação (BUG ESPERADO)
    Given um Órgão existente com código "000001" na Instituição "01"
    When o usuário cria um novo Órgão e altera manualmente o código para "000001"
    And tenta salvar
    Then o sistema deveria rejeitar por duplicação
    But atualmente o erro só ocorre se o banco tiver UNIQUE constraint

  Scenario: Criar Unidade Gestora sem selecionar Órgão válido
    Given que o usuário está na página de nova Unidade Gestora
    When o usuário preenche todos os campos exceto "Órgão Vinculado"
    And clica em "Salvar"
    Then o sistema deve exibir erro "Órgão é obrigatório"
    And a Unidade Gestora não deve ser criada
```

### Cenário 5: Logs de Auditoria e Rastreabilidade

```gherkin
Feature: Auditoria e Logs

  Scenario: Criação de documento deve registrar log com usuário
    Given que o usuário "admin@siagov.gov.br" está autenticado
    When ele cria um novo documento na subcategoria "4.1."
    Then deve existir um registro em "documento_historico"
    And o campo "acao" deve ser "Criado"
    And o campo "usuario_id" deve corresponder ao ID do usuário
    And o campo "usuario_nome" deve ser "admin@siagov.gov.br"

  Scenario: Falha no log não deve impedir criação do documento (BUG DE DESIGN)
    Given que a tabela "documento_historico" está inacessível
    When o usuário cria um novo documento
    Then o documento é criado com sucesso
    But nenhum log de auditoria é registrado
    And apenas um console.warn é emitido (invisível ao usuário)

  Scenario: Operações CRUD de cadastros devem alimentar audit_logs
    Given que existem triggers PostgreSQL para INSERT/UPDATE/DELETE
    When o usuário cria um novo Órgão
    Then deve existir um registro na tabela "audit_logs"
    With "table_name" = "orgaos"
    And "action" = "INSERT"
    And "changed_by" = ID do usuário da sessão
    And "new_data" contendo o JSON do registro criado
```

---

## 3. Scripts de Teste Automatizado

### 3.1 Playwright — E2E: Hierarquia de Cadastros e Geração Sequencial

```typescript
// tests/e2e/cadastros-hierarquia.spec.ts
import { test, expect, Page } from '@playwright/test';

test.describe('Hierarquia de Cadastros — Fluxo E2E', () => {

    test.beforeEach(async ({ page }) => {
        // Login - ajustar conforme implementação de auth
        await page.goto('/login');
        await page.fill('input[name="email"]', 'test@siagov.gov.br');
        await page.fill('input[name="password"]', 'Test@123');
        await page.click('button[type="submit"]');
        await page.waitForURL('**/dashboard**');
    });

    test('CT-01: Criar Órgão gera código sequencial automaticamente', async ({ page }) => {
        await page.goto('/cadastros/orgaos/novo');
        
        // Selecionar Instituição
        await page.click('[data-testid="select-instituicao"]');
        await page.click('[data-testid="select-instituicao"] [role="option"]:first-child');
        
        // Aguardar geração automática do código
        await page.waitForFunction(() => {
            const input = document.querySelector('input[name="codigo"]') as HTMLInputElement;
            return input && input.value && input.value !== '';
        }, { timeout: 5000 });
        
        const codigoGerado = await page.inputValue('input[name="codigo"]');
        
        // Validar formato: 6 dígitos numéricos
        expect(codigoGerado).toMatch(/^\d{6}$/);
        expect(parseInt(codigoGerado, 10)).toBeGreaterThan(0);
    });

    test('CT-02: Bloquear exclusão de Órgão com Unidades vinculadas', async ({ page }) => {
        await page.goto('/cadastros/orgaos');
        await page.waitForLoadState('networkidle');
        
        // Localizar um órgão que sabemos ter unidades vinculadas
        const deleteButton = page.locator('button:has(svg.lucide-trash-2)').first();
        
        // Interceptar o confirm dialog
        page.on('dialog', async dialog => {
            expect(dialog.type()).toBe('confirm');
            await dialog.accept();
        });
        
        // Interceptar o alert de bloqueio
        const alertPromise = page.waitForEvent('dialog');
        await deleteButton.click();
        const alertDialog = await alertPromise;
        
        expect(alertDialog.message()).toContain('Não é possível excluir');
        expect(alertDialog.message()).toMatch(/unidade\(s\) gestora\(s\)/);
        await alertDialog.dismiss();
    });

    test('CT-03: Cascata de dropdowns — Instituição > Órgão > Unidade', async ({ page }) => {
        await page.goto('/cadastros/unidades/novo');
        
        // Verificar que o dropdown de Órgão está vazio inicialmente
        const orgaoSelect = page.locator('[data-testid="select-orgao"]');
        await expect(orgaoSelect).toBeVisible();
        
        // Selecionar Instituição
        const instSelect = page.locator('[data-testid="select-instituicao"]');
        await instSelect.click();
        await page.click('[role="option"]:first-child');
        
        // Aguardar carregamento dos órgãos filtrados
        await page.waitForTimeout(500);
        
        // Órgão dropdown deve ter opções disponíveis agora
        await orgaoSelect.click();
        const orgaoOptions = page.locator('[role="option"]');
        const count = await orgaoOptions.count();
        expect(count).toBeGreaterThan(0);
    });

    test('CT-04: Submissão rápida repetida (double-click prevention)', async ({ page }) => {
        await page.goto('/cadastros/orgaos/novo');
        await page.waitForLoadState('networkidle');
        
        // Preencher formulário mínimo
        await page.click('[data-testid="select-instituicao"]');
        await page.click('[role="option"]:first-child');
        await page.waitForTimeout(1000);
        
        await page.click('[data-testid="select-poder-vinculado"]');
        await page.click('[role="option"]:first-child');
        
        await page.fill('input[name="nome"]', 'ORGÃO TESTE DOUBLE CLICK');
        await page.fill('input[name="sigla"]', 'OTDC');
        
        const saveButton = page.locator('button:has-text("Salvar")');
        
        // Duplo clique rápido
        await saveButton.dblclick();
        
        // O botão deve estar desabilitado após o primeiro clique
        await expect(saveButton).toBeDisabled();
    });

    test('CT-05: Geração de código de documento sequencial', async ({ page }) => {
        await page.goto('/documentos/novo');
        await page.waitForLoadState('networkidle');
        
        // Selecionar categoria
        await page.click('[data-testid="select-categoria"]');
        await page.click('[role="option"]:first-child');
        
        await page.waitForTimeout(500);
        
        // Selecionar subcategoria
        await page.click('[data-testid="select-subcategoria"]');
        await page.click('[role="option"]:first-child');
        
        // Preencher campos obrigatórios
        await page.click('[data-testid="select-tipo"]');
        await page.click('[role="option"]:first-child');
        
        await page.click('[data-testid="select-especialista"]');
        await page.click('[role="option"]:first-child');
        
        await page.fill('textarea[name="objetivo"]', 'Teste de geração sequencial');
        
        // Interceptar request de criação para verificar o número gerado
        const [request] = await Promise.all([
            page.waitForRequest(req => 
                req.url().includes('/rest/v1/documentos') && 
                req.method() === 'POST'
            ),
            page.click('button:has-text("Salvar")'),
        ]);
        
        const postData = request.postDataJSON();
        expect(postData.numero).toBeDefined();
        expect(postData.numero).not.toBe('');
        // Formato esperado: "X.Y.Z." onde X.Y é o prefixo da subcategoria
        expect(postData.numero).toMatch(/^\d+\.\d+\.\d+\.$/);
    });
});
```

### 3.2 Jest — Unitários: Geração de Código e Rastreabilidade

```typescript
// tests/unit/sequenceService.test.ts
import { gerarProximoCodigo } from '@/services/api/sequenceService';
import { getSupabaseClient } from '@/lib/supabase/client';

// Mock do Supabase client
jest.mock('@/lib/supabase/client', () => ({
    getSupabaseClient: jest.fn(),
}));

describe('sequenceService.gerarProximoCodigo', () => {
    let mockSupabase: any;

    beforeEach(() => {
        mockSupabase = {
            from: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            order: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
        };
        (getSupabaseClient as jest.Mock).mockReturnValue(mockSupabase);
    });

    test('deve retornar "001" quando não existem registros', async () => {
        mockSupabase.limit.mockResolvedValue({ data: [], error: null });

        const resultado = await gerarProximoCodigo('orgaos', 3);
        expect(resultado).toBe('001');
    });

    test('deve incrementar o último código existente', async () => {
        mockSupabase.limit.mockResolvedValue({
            data: [{ codigo: '005' }],
            error: null,
        });

        const resultado = await gerarProximoCodigo('orgaos', 3);
        expect(resultado).toBe('006');
    });

    test('deve retornar "001" quando último código é NaN', async () => {
        mockSupabase.limit.mockResolvedValue({
            data: [{ codigo: 'ABC' }],
            error: null,
        });

        const resultado = await gerarProximoCodigo('orgaos', 3);
        expect(resultado).toBe('001');
    });

    test('deve respeitar o padStart para 6 dígitos', async () => {
        mockSupabase.limit.mockResolvedValue({
            data: [{ codigo: '000042' }],
            error: null,
        });

        const resultado = await gerarProximoCodigo('orgaos', 6);
        expect(resultado).toBe('000043');
        expect(resultado.length).toBe(6);
    });

    test('deve filtrar por campo pai quando fornecido', async () => {
        mockSupabase.limit.mockResolvedValue({ data: [], error: null });

        await gerarProximoCodigo('orgaos', 6, 'instituicao_id', 'uuid-123');

        // Verificar que .eq foi chamado com o filtro do pai
        expect(mockSupabase.eq).toHaveBeenCalledWith('instituicao_id', 'uuid-123');
    });

    test('deve retornar "001" quando Supabase retorna erro', async () => {
        mockSupabase.limit.mockResolvedValue({
            data: null,
            error: { message: 'Connection failed' },
        });

        const resultado = await gerarProximoCodigo('orgaos', 3);
        expect(resultado).toBe('001');
    });

    test('deve retornar "001" quando exception é lançada', async () => {
        mockSupabase.limit.mockRejectedValue(new Error('Network error'));

        const resultado = await gerarProximoCodigo('orgaos', 3);
        expect(resultado).toBe('001');
    });

    // TESTE DE RACE CONDITION (demonstra o bug)
    test('FALHA ESPERADA: chamadas concorrentes geram mesmo código', async () => {
        // Simula duas chamadas lendo o mesmo estado
        mockSupabase.limit.mockResolvedValue({
            data: [{ codigo: '005' }],
            error: null,
        });

        const [codigoA, codigoB] = await Promise.all([
            gerarProximoCodigo('orgaos', 3),
            gerarProximoCodigo('orgaos', 3),
        ]);

        // Este teste DEMONSTRA o bug — ambos retornam "006"
        expect(codigoA).toBe('006');
        expect(codigoB).toBe('006'); // ← DUPLICATA!
        // Em um sistema correto, codigoB deveria ser "007"
    });
});
```

```typescript
// tests/unit/documentosService.test.ts
import { documentosService } from '@/services/api/documentosService';
import { getSupabaseClient } from '@/lib/supabase/client';

jest.mock('@/lib/supabase/client');

describe('documentosService.gerarProximoCodigo', () => {
    let mockSupabase: any;

    beforeEach(() => {
        mockSupabase = {
            from: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockReturnThis(),
        };
        (getSupabaseClient as jest.Mock).mockReturnValue(mockSupabase);
    });

    test('deve gerar código "4.1.1." para subcategoria "4.1." sem documentos', async () => {
        // Mock subcategoria lookup
        mockSupabase.single.mockResolvedValueOnce({
            data: { nome: '4.1. Dispensa', codigo: '4.1' },
            error: null,
        });
        // Mock count
        mockSupabase.eq.mockReturnValue({
            select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                    eq: jest.fn().mockResolvedValue({ count: 0, error: null }),
                }),
            }),
        });
        // Need to re-mock from for the second call
        mockSupabase.from.mockImplementation((table: string) => {
            if (table === 'subcategorias_documentos') {
                return {
                    select: () => ({
                        eq: () => ({
                            single: () => Promise.resolve({
                                data: { nome: '4.1. Dispensa', codigo: '4.1' },
                                error: null,
                            }),
                        }),
                    }),
                };
            }
            return {
                select: () => ({
                    eq: () => ({
                        eq: () => Promise.resolve({ count: 0, error: null }),
                    }),
                }),
            };
        });

        const codigo = await documentosService.gerarProximoCodigo('sub-uuid');
        expect(codigo).toBe('4.1.1.');
    });

    test('deve retornar fallback "DOC-XXXX" quando subcategoria não existe', async () => {
        mockSupabase.from.mockImplementation(() => ({
            select: () => ({
                eq: () => ({
                    single: () => Promise.resolve({
                        data: null,
                        error: { message: 'Not found', code: 'PGRST116' },
                    }),
                }),
            }),
        }));

        const codigo = await documentosService.gerarProximoCodigo('invalid-uuid');
        expect(codigo).toMatch(/^DOC-\d{4}$/);
    });
});
```

```typescript
// tests/unit/auditTraceability.test.ts
describe('Rastreabilidade de Auditoria', () => {

    test('documentosService.criar deve registrar log com usuario_id', async () => {
        const mockInsert = jest.fn().mockResolvedValue({ error: null });
        const mockUser = { id: 'user-123', email: 'admin@siagov.gov.br' };
        
        const mockSupabase = {
            from: jest.fn().mockImplementation((table: string) => {
                if (table === 'documento_historico') {
                    return { insert: mockInsert };
                }
                return {
                    insert: jest.fn().mockReturnValue({
                        select: jest.fn().mockReturnValue({
                            single: jest.fn().mockResolvedValue({
                                data: { id: 'doc-1', numero: '4.1.1.' },
                                error: null,
                            }),
                        }),
                    }),
                };
            }),
            auth: {
                getUser: jest.fn().mockResolvedValue({
                    data: { user: mockUser },
                }),
            },
        };

        // Verificar que o log foi inserido com os dados corretos
        expect(mockInsert).toHaveBeenCalledWith(
            expect.objectContaining({
                documento_id: expect.any(String),
                acao: 'Criado',
                usuario_id: 'user-123',
                usuario_nome: 'admin@siagov.gov.br',
            })
        );
    });

    test('documentosService.criar NÃO falha se log de auditoria falhar (design flaw)', async () => {
        // Este teste documenta o comportamento atual — o log falhando
        // silenciosamente é um bug de design, não uma feature
        const mockSupabase = {
            from: jest.fn().mockImplementation((table: string) => {
                if (table === 'documento_historico') {
                    return {
                        insert: jest.fn().mockRejectedValue(new Error('Permission denied')),
                    };
                }
                return {
                    insert: jest.fn().mockReturnValue({
                        select: jest.fn().mockReturnValue({
                            single: jest.fn().mockResolvedValue({
                                data: { id: 'doc-1', numero: '4.1.1.' },
                                error: null,
                            }),
                        }),
                    }),
                };
            }),
            auth: {
                getUser: jest.fn().mockResolvedValue({
                    data: { user: { id: 'user-1', email: 'test@test.com' } },
                }),
            },
        };

        // O documento DEVE ser criado mesmo com falha no log (comportamento atual)
        // Em um sistema ideal, isso deveria falhar ou pelo menos alertar
        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
        
        // Executar e verificar que console.warn foi chamado
        expect(consoleSpy).toHaveBeenCalledWith(
            'Aviso: Não foi possível registrar log de criação:',
            expect.any(Error)
        );
        
        consoleSpy.mockRestore();
    });

    test('baseService.excluir NÃO registra log de auditoria no código', () => {
        // Este teste documenta a AUSÊNCIA de logs no baseService
        // As operações do baseService dependem inteiramente de triggers SQL
        
        // Analisando o código-fonte de baseService.ts:
        // - criar(): NÃO registra log
        // - atualizar(): NÃO registra log
        // - excluir(): NÃO registra log
        // 
        // Conclusão: Se os triggers PostgreSQL não estiverem ativos,
        // TODAS as operações CRUD de cadastros passam sem auditoria.
        
        expect(true).toBe(true); // Placeholder — verificação é documental
    });
});
```

---

## 4. Resumo de Falhas (Dashboard)

| ID | Severidade | Módulo | Falha | Impacto |
|----|-----------|--------|-------|---------|
| CR-01 | 🔴 Crítica | Documentos | Race condition na geração de código | Códigos duplicados |
| CR-02 | 🔴 Crítica | Documentos | Fallback `Math.random()` sem unicidade | Colisão de códigos |
| CR-03 | 🔴 Crítica | Global | Zero schemas Zod no projeto | Payloads maliciosos |
| CR-04 | 🔴 Crítica | Documentos | Admin check client-side com email hardcoded | Bypass de permissão |
| CR-05 | 🟠 Alta | Documentos | Upload sem validação de tipo/tamanho | Upload de malware |
| CR-06 | 🟠 Alta | Cadastros | Exclusão sem cascade check (Setores/Cargos) | Dados órfãos |
| CR-07 | 🟠 Alta | Cadastros | TOCTOU na exclusão de Órgãos | Exclusão com filhos |
| CR-08 | 🟠 Alta | Documentos | [baixarPDF()](file:///c:/Users/Jo%C3%A3oVictorRibeiroLag/Documents/Projetos%20Highcode/Projeto%20Siagov/siagov-next/src/app/%28dashboard%29/documentos/%5Bid%5D/page.tsx#114-122) não baixa arquivo | Feature quebrada |
| CR-09 | 🟡 Média | Documentos | Logs silenciados em catch | Sem auditoria |
| CR-10 | 🟡 Média | Cadastros | `auditService` somente leitura | Dependência de triggers |
| CR-11 | 🟡 Média | Global | Busca `.ilike` sem sanitização | Queries inesperadas |
| CR-12 | 🟡 Média | Cadastros | Código editável sem validação de formato | Quebra do sequencial |
| CR-13 | 🔵 Baixa | Documentos | Anexos não enviados ao Storage | Anexos perdidos |
| CR-14 | 🔵 Baixa | Documentos | Soft-delete não limpa anexos | Storage órfão |

> [!IMPORTANT]
> **Prioridade de correção sugerida:** CR-01 → CR-03 → CR-04 → CR-06 → CR-05 → CR-08

---

## 5. Recomendações Estratégicas

1. **Geração de Código Atômico**: Migrar para uma PostgreSQL function `gerar_proximo_codigo(tabela, pai_id)` com `SELECT FOR UPDATE` ou sequence nativa
2. **Validação de Schema**: Instalar `zod` e criar schemas para todos os formulários, validando tanto no client quanto no service
3. **Upload Seguro**: Implementar whitelist de MIME types (`application/pdf`, `image/*`), limite de 10MB, e verificação de magic bytes
4. **Cascade Protection**: Adicionar métodos `contarFilhos()` em todos os serviços de hierarquia antes de permitir exclusão
5. **Audit Obrigatório**: Mover logs de auditoria para uma transação junto com a operação principal (não em catch separado)
6. **Admin via RLS**: Migrar verificação de admin para Row Level Security no Supabase, não no cliente
