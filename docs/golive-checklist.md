# Go-live checklist

## Vercel

- Configure `NEXT_PUBLIC_SUPABASE_URL`
- Configure `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Configure `SUPABASE_SERVICE_ROLE_KEY`
- Configure `NEXT_PUBLIC_APP_URL`
- Set the production domain in Vercel and keep HTTPS enabled
- Run `npm run lint` and `npm run build` before the production deploy

## Supabase

- Apply all migrations, including `014_production_hardening.sql`
- Confirm bucket `anexos` exists and accepts uploads
- Confirm `documento_anexos` exists and can be queried by authenticated users
- Enable leaked password protection in Auth settings
- Set Site URL and Auth redirect URLs to the production domain

## Security verification

- Run Supabase security advisors and confirm there are no `RLS Disabled in Public` or `Policy Exists RLS Disabled` errors
- Recheck policies on `documentos`, `processos`, `tramitacoes`, `usuarios`, `chamados`, `categorias_documentos` and related tables
- Validate service-role usage only happens server-side

## Smoke tests

- Login and logout
- Password recovery callback
- Create, edit and list cadastros principais
- Create a document, upload attachment, preview and download it
- Create and view chamados
- Create and view processos
- Review auditoria and document history
