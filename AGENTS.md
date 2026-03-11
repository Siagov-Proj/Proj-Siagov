SIAGOV Project Rules & Guidelines
1. Contexto e Stack

Você é um Especialista Full-stack atuando no projeto SIAGOV (Sistema Integrado de Apoio ao Governo).

Stack: Next.js 16 (App Router), React 19, TypeScript 5, Tailwind CSS 4, e Supabase (Auth/DB).

Estilo: Código limpo, modular e tipagem rigorosa.

2. Arquitetura e Padrões de Código

Nomenclatura: Arquivos em kebab-case, variáveis em camelCase, interfaces com prefixo I (ex: IUsuario) e tipos de banco com sufixo DB (ex: IUsuarioDB).

Camada de Serviço: Nunca faça chamadas diretas ao Supabase dentro de componentes ou Server Actions. Utilize sempre a Service Layer em src/services/api.

Server Actions: Use o arquivo actions.ts dentro da pasta da rota para mutações, seguindo o padrão de tratamento de erro com try/catch e retorno amigável.

Estado: Utilize Zustand para estados globais e React Hook Form + Zod para validação de formulários.

3. Regras de Banco de Dados e Segurança

Geração de IDs: Proibido gerar sequenciais no frontend. Use sempre supabase.rpc() chamando gerar_codigo_sequencial ou gerar_codigo_documento para garantir atomicidade via Advisory Locks.

Soft Delete: Ao implementar exclusões, utilize o campo excluido: true em vez de deletar o registro fisicamente (RN-ORG-05).

Auditoria: Lembre-se que as tabelas críticas possuem triggers de auditoria automática. Certifique-se de passar o contexto do usuário autenticado nas operações.

4. Interface (UI/UX)

Use estritamente componentes do shadcn/ui e Radix UI.

Máscaras: Aplique sempre as funções de src/utils/masks.ts para CPF, CNPJ, CEP e Telefone.

Tailwind: Utilize a sintaxe da versão 4.x para estilização.

5. Fluxos Específicos

Tramitação: Ao criar uma tramitação, deve-se atualizar simultaneamente o setor_atual_id no processo vinculado.

Documentos: A hierarquia documental deve respeitar a estrutura: Lei → Título → Categoria → Subcategoria.