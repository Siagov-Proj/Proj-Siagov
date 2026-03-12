# Runbook de virada para produção

## T-60 min

- Confirmar commit/tag final da release
- Confirmar que `npm run build` passou localmente
- Confirmar que o lint está sem erros bloqueantes
- Confirmar que Supabase Pro e Vercel Pro estão provisionados

## T-45 min

- No Supabase produção, revisar projeto correto e região
- Aplicar todas as migrations até `015_post_hardening_cleanup.sql`
- Confirmar tabelas críticas: `documentos`, `documento_anexos`, `processos`, `usuarios`, `chamados`
- Confirmar bucket `anexos`

## T-35 min

- Abrir Security Advisors do Supabase
- Confirmar ausência de erros de RLS/policies
- Ativar manualmente `Leaked Password Protection`
- Ajustar Auth URL settings:
  - Site URL
  - Redirect URL de login/callback
  - Redirect URL de recovery

## T-25 min

- Configurar variáveis na Vercel produção:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `NEXT_PUBLIC_APP_URL`
- Validar domínio principal e HTTPS

## T-15 min

- Fazer deploy de produção na Vercel
- Aguardar build e validação das rotas principais

## T-10 min - Smoke test funcional

- Login
- Logout
- Recuperação de senha
- Cadastro de usuário
- Cadastro de categoria/subcategoria
- Criação de documento
- Upload de anexo
- Preview e download do anexo
- Criação de processo
- Criação de chamado
- Auditoria exibindo registros

## T-5 min - Verificação operacional

- Conferir logs da Vercel
- Conferir logs do Supabase
- Conferir Storage uploads recentes
- Conferir sessão autenticada no middleware

## Go-live

- Liberar acesso aos usuários finais
- Monitorar erros e performance por 30 a 60 minutos

## Rollback rápido

- Reverter deploy na Vercel para a release anterior
- Se houver migration problemática, interromper uso e avaliar rollback manual controlado
- Preservar banco e logs antes de qualquer reversão destrutiva

## Pendências manuais após a virada

- Ajustar Auth DB connection strategy para percentage no Supabase
- Revisar índices marcados como `unused` somente após alguns dias de uso real
