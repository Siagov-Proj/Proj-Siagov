-- Seed data for preview/develop branches.
-- This mirrors the current application data from main for the most relevant public tables.
-- Note: Storage object binaries are NOT copied by this file, only database rows/metadata.

BEGIN;

TRUNCATE TABLE
    public.documento_historico,
    public.documento_anexos,
    public.documentos,
    public.categorias_orgaos,
    public.subcategorias_documentos,
    public.categorias_documentos,
    public.titulos_normativos,
    public.leis_normativas,
    public.orgaos,
    public.instituicoes,
    public.bancos,
    public.esferas
RESTART IDENTITY CASCADE;

INSERT INTO public.esferas (id, sigla, nome, descricao, ativo, excluido, created_at, updated_at) VALUES
('8872e288-6c75-4878-b7da-2154976338d4','EST','Estadual','Órgãos e entidades da administração pública estadual',true,false,'2026-01-29 17:40:18.546913+00','2026-01-29 17:40:18.546913+00'),
('b9e064d9-ccba-4815-98df-322dc1bdec5e','MUN','Municipal','Órgãos e entidades da administração pública municipal',true,false,'2026-01-29 17:40:18.546913+00','2026-01-29 17:40:18.546913+00'),
('df2d66e8-4c89-4202-bd41-2570f343efdf','DIS','Distrital','Órgãos e entidades do Distrito Federal',true,false,'2026-01-29 17:40:18.546913+00','2026-01-29 17:40:18.546913+00'),
('1a7e2bbc-0b57-4e7e-a640-0a2e8e900a83','FED','Federal','Órgãos e entidades da administração pública federal',true,false,'2026-01-29 17:40:18.546913+00','2026-01-29 17:40:18.546913+00'),
('3a316e6d-08ae-4432-9b1e-9cae5e750d35','FED','Federal test','Esfera federal de teste',true,true,'2026-01-29 17:46:49.264416+00','2026-02-02 19:53:29.746717+00'),
('6a2c9933-14de-4468-86ff-63ccbd13a8aa','Q5776','Esfera QA Updated 1769726185776',NULL,true,true,'2026-01-29 22:36:26.405556+00','2026-01-29 22:36:27.043304+00'),
('68cd81e8-7d5e-40a1-a8c9-bdf289f14dae','Q3124','Esfera QA Updated 1769726283124',NULL,true,true,'2026-01-29 22:38:03.784795+00','2026-01-29 22:38:04.356602+00'),
('ebb26c18-5fda-4de2-adad-8a599cd33f7e','Q3343','Esfera QA Updated 1769726333343',NULL,true,true,'2026-01-29 22:38:53.999226+00','2026-01-29 22:38:54.604307+00'),
('d1156476-30e6-4f72-89a6-73d6a550262c','TES','Esfera teste','esfera teste',true,true,'2026-02-03 17:14:10.170723+00','2026-02-03 17:14:22.41825+00');

INSERT INTO public.bancos (id, codigo, nome, nome_abreviado, cnpj, ativo, excluido, created_at, updated_at) VALUES
('d7bdb229-0ceb-4fce-860c-8706e761107b','001','Banco do Brasil S.A.','BB',NULL,true,false,'2026-01-29 17:40:18.546913+00','2026-01-29 17:40:18.546913+00'),
('31528ed1-25cc-4d63-ab0e-021960382181','104','Caixa Econômica Federal','CEF',NULL,true,false,'2026-01-29 17:40:18.546913+00','2026-01-29 17:40:18.546913+00'),
('558e8eb2-a16b-4d78-b992-9c2c1346325d','237','Banco Bradesco S.A.','BRADESCO',NULL,true,false,'2026-01-29 17:40:18.546913+00','2026-01-29 17:40:18.546913+00'),
('48b301a7-7e56-43eb-9f3e-b87ceb7aa539','341','Itaú Unibanco S.A.','ITAU',NULL,true,false,'2026-01-29 17:40:18.546913+00','2026-01-29 17:40:18.546913+00'),
('2e225a57-b35c-4354-a9f3-03e4f15830fd','033','Banco Santander Brasil S.A.','SANTANDER',NULL,true,false,'2026-01-29 17:40:18.546913+00','2026-01-29 17:40:18.546913+00'),
('5f0175d8-eb7a-4815-a790-bcaf42f35eb0','B76','Banco QA Upd 1769726185776',NULL,NULL,true,true,'2026-01-29 22:36:28.476349+00','2026-01-29 22:36:29.033726+00'),
('307ce1a7-a8df-4b5c-94b5-fb5bd11c73cd','B24','Banco QA Upd 1769726283124',NULL,NULL,true,true,'2026-01-29 22:38:06.856043+00','2026-01-29 22:38:07.421882+00'),
('f4b6fb08-cea2-4170-8a69-a3efd2738ea7','B43','Banco QA Upd 1769726333343',NULL,NULL,true,true,'2026-01-29 22:39:02.075902+00','2026-01-29 22:39:02.735271+00'),
('a91acbca-5ae1-47a1-9ed5-5e65e593a2af','009','TESTE','TESTE','12.321.312/3',true,false,'2026-02-03 15:39:27.552767+00','2026-02-03 15:39:27.552767+00');

INSERT INTO public.instituicoes (id, codigo, nome, nome_abreviado, esfera_id, cnpj, email, codigo_siasg, cep, logradouro, numero, complemento, bairro, municipio, uf, ativo, excluido, created_at, updated_at) VALUES
('ba6da2ea-ecf7-4456-b7f1-ec4a1420e216','I3','Instituicao QA Upd 1769726333343',NULL,'ebb26c18-5fda-4de2-adad-8a599cd33f7e',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,false,true,'2026-01-29 22:38:55.053845+00','2026-02-02 19:58:08.813846+00'),
('9dc24c83-e0f2-459b-9d28-2ec01752de68','001','Instituição teste','TEST','1a7e2bbc-0b57-4e7e-a640-0a2e8e900a83','12.345.678/9100-11','Teste@gmail.com','1234','12343-211','Rua 1','1','1','Bairro teste','São Luís','MA',true,false,'2026-02-02 19:57:44.489838+00','2026-02-02 19:58:35.153584+00'),
('49f2515c-fb84-4fd8-bceb-fbc3fee32d43','002','Instituicao Teste E2E - EDITADO','ITE2E','8872e288-6c75-4878-b7da-2154976338d4','','','','','','','','','','',true,false,'2026-03-10 16:12:04.638642+00','2026-03-10 16:12:49.297381+00');

INSERT INTO public.orgaos (id, codigo, instituicao_id, poder_vinculado, nome, sigla, cnpj, codigo_siasg, ug_tce, ug_siafem_sigef, nome_anterior, nome_abreviado_anterior, ativo, excluido, created_at, updated_at) VALUES
('66681be0-7dd7-48b1-96f5-542d51df744b','O343','ba6da2ea-ecf7-4456-b7f1-ec4a1420e216',NULL,'Orgao QA Upd 1769726333343',NULL,NULL,NULL,NULL,NULL,NULL,NULL,true,true,'2026-01-29 22:38:56.146935+00','2026-01-29 22:38:56.753817+00'),
('93216f1b-0daa-4510-97cf-2ec3e52ce236','000003','9dc24c83-e0f2-459b-9d28-2ec01752de68','Executivo','Secretaria estadual de 123','123','12.321.321/3124-12','123','12321','4124','','',true,false,'2026-02-03 03:42:44.523066+00','2026-02-03 03:42:44.523066+00'),
('80db748d-dae4-4104-b7dc-7eab1415939c','000001','49f2515c-fb84-4fd8-bceb-fbc3fee32d43','Legislativo','Orgao Teste E2E','OTE2E','',NULL,NULL,NULL,'','',true,false,'2026-03-10 16:15:24.056987+00','2026-03-10 16:15:24.056987+00');

INSERT INTO public.leis_normativas (id, nome, descricao, ativo, excluido, created_at, updated_at) VALUES
('eff8704e-a885-4966-a058-d8b77d291fc3','Lei 14.133/2021','Nova Lei de Licitações e Contratos Administrativos',true,false,'2026-02-24 15:33:13.938239+00','2026-02-24 15:33:13.938239+00'),
('6bd01042-9f45-4b8d-ad97-378d5a3c3beb','Lei 8.666/93','Lei de Licitações e Contratos da Administração Pública',true,false,'2026-02-24 15:33:13.938239+00','2026-02-24 15:33:13.938239+00'),
('f227d1ec-a134-4716-ade9-e7b1f9211b42','Lei 13.019/14','Marco Regulatório das Organizações da Sociedade Civil',true,false,'2026-02-24 15:33:13.938239+00','2026-02-24 15:33:13.938239+00'),
('2fa9597d-f770-42c7-a611-9adf50aedd9d','Lei teste 1','12312313',true,true,'2026-02-24 17:31:34.267544+00','2026-02-24 17:31:46.085194+00'),
('794dcd02-76fc-4168-86de-9049801fc3d1','teste','1',true,true,'2026-03-12 00:41:41.681232+00','2026-03-12 00:41:46.621775+00');

INSERT INTO public.titulos_normativos (id, lei_id, nome, descricao, ativo, excluido, created_at, updated_at) VALUES
('5bf1b1de-bc10-4807-907b-2c4a8987a5cf','eff8704e-a885-4966-a058-d8b77d291fc3','Dispensa',NULL,true,false,'2026-02-24 16:10:46.347208+00','2026-02-24 16:10:46.347208+00'),
('bb10fce6-ace4-427c-8e8d-99e85b939c9b','6bd01042-9f45-4b8d-ad97-378d5a3c3beb','Contratações Direta',NULL,true,false,'2026-02-24 17:34:48.213587+00','2026-02-24 17:34:48.213587+00'),
('24a3a8b7-b5fe-46f2-98a2-ad261597dd83','eff8704e-a885-4966-a058-d8b77d291fc3','Título test1',NULL,true,false,'2026-03-12 00:55:47.310884+00','2026-03-12 00:55:47.310884+00');

INSERT INTO public.categorias_documentos (id, nome, descricao, lei, cor, ativo, excluido, created_at, updated_at, titulo_id, codigo) VALUES
('30b1b2a5-c5cd-45f0-95b1-98d099bebed7','Categoria QA 1769726185776','Desc Updated',NULL,NULL,true,true,'2026-01-29 22:36:30.360653+00','2026-01-29 22:36:30.922853+00',NULL,NULL),
('ee7cb09d-ed86-4fa0-856c-e7dde0d6ce30','Categoria QA 1769726283124','Desc Updated',NULL,NULL,true,true,'2026-01-29 22:38:08.676684+00','2026-01-29 22:38:09.229118+00',NULL,NULL),
('da6bae29-6615-444a-96ff-924735e1915a','Categoria QA 1769726333343','Desc Updated',NULL,NULL,true,true,'2026-01-29 22:39:04.084245+00','2026-01-29 22:39:04.717353+00',NULL,NULL),
('2645d8b9-ddfe-434d-ad94-a4c78e3d6e32','Categoria Teste 1769727570953',NULL,'Lei 14.133/2021',NULL,true,false,'2026-01-29 22:59:32.471552+00','2026-01-29 22:59:32.471552+00',NULL,NULL),
('96f02fef-6286-42fd-817d-1bcba4e99018','Categoria Teste 1769742612171',NULL,'Lei 14.133/2021',NULL,true,false,'2026-01-30 03:10:14.163055+00','2026-01-30 03:10:14.163055+00',NULL,NULL),
('2eb84ede-e7e1-4185-9733-13d0c0605325','Categoria Teste 1769742836032',NULL,'Lei 14.133/2021',NULL,true,false,'2026-01-30 03:13:56.756459+00','2026-01-30 03:13:56.756459+00',NULL,NULL),
('fda2f62c-4c9d-4cb6-b214-e9d423ba442f','Categoria Teste 1769742977414',NULL,'Lei 14.133/2021',NULL,true,false,'2026-01-30 03:16:18.485382+00','2026-01-30 03:16:18.485382+00',NULL,NULL),
('1897f6ba-27a5-4adb-8200-b54361439192','Categoria Teste 1769743116787',NULL,'Lei 14.133/2021',NULL,true,false,'2026-01-30 03:18:37.760157+00','2026-01-30 03:18:37.760157+00',NULL,NULL),
('102b5064-8adc-404d-be43-e2392e742e30','Categoria Teste 1769743168194',NULL,'Lei 14.133/2021',NULL,true,false,'2026-01-30 03:19:28.879937+00','2026-01-30 03:19:28.879937+00',NULL,NULL),
('6ed1c76d-1cdc-49e9-9550-2bb8e94e8291','QA_Category_1769743888015',NULL,'Lei QA',NULL,true,false,'2026-01-30 03:31:29.457693+00','2026-01-30 03:31:29.457693+00',NULL,NULL),
('59564923-9d41-419d-bb4b-989605208e3b','Pareceres técnicos',NULL,NULL,NULL,true,false,'2026-02-24 16:10:46.574107+00','2026-02-24 16:10:46.574107+00','5bf1b1de-bc10-4807-907b-2c4a8987a5cf',NULL),
('e225522d-f394-4676-8f9f-a48e3edecdc4','Dispensa por valor',NULL,NULL,NULL,true,false,'2026-02-24 17:34:48.432273+00','2026-02-24 17:34:48.432273+00','bb10fce6-ace4-427c-8e8d-99e85b939c9b',NULL),
('703fc8af-0bf6-4ee2-9c0d-ad2f4ae71276','6. Categoria test1',NULL,NULL,NULL,true,false,'2026-03-12 00:55:47.613074+00','2026-03-12 00:55:47.613074+00','24a3a8b7-b5fe-46f2-98a2-ad261597dd83',NULL),
('4ce7b204-8335-4657-bf3e-f67bef721cbc','7. Dispensa geral - contratação teste',NULL,NULL,NULL,true,false,'2026-03-12 01:13:25.750344+00','2026-03-12 01:13:25.750344+00','5bf1b1de-bc10-4807-907b-2c4a8987a5cf',NULL);

INSERT INTO public.subcategorias_documentos (id, categoria_id, nome, descricao, ativo, excluido, created_at, updated_at, codigo) VALUES
('bc816f05-86bd-4101-bcc9-236db70aec27','2645d8b9-ddfe-434d-ad94-a4c78e3d6e32','Subcategoria Teste',NULL,true,false,'2026-01-29 22:59:32.839104+00','2026-01-29 22:59:32.839104+00',NULL),
('af382aea-2bac-4eec-8e00-5ee3c58ce989','96f02fef-6286-42fd-817d-1bcba4e99018','Subcategoria Teste',NULL,true,false,'2026-01-30 03:10:14.521653+00','2026-01-30 03:10:14.521653+00',NULL),
('e54d341b-5778-4ecb-9185-b77cb0fdaf52','2eb84ede-e7e1-4185-9733-13d0c0605325','Subcategoria Teste',NULL,true,false,'2026-01-30 03:13:56.980691+00','2026-01-30 03:13:56.980691+00',NULL),
('d674dd81-33a7-4534-9033-0c547e6ebc04','fda2f62c-4c9d-4cb6-b214-e9d423ba442f','Subcategoria Teste',NULL,true,false,'2026-01-30 03:16:18.668832+00','2026-01-30 03:16:18.668832+00',NULL),
('6ac86f77-1947-4d43-b3ba-47fe3ff9402e','1897f6ba-27a5-4adb-8200-b54361439192','Subcategoria Teste',NULL,true,false,'2026-01-30 03:18:37.970887+00','2026-01-30 03:18:37.970887+00',NULL),
('f678dc4a-f087-497f-b16e-e31440fa6268','102b5064-8adc-404d-be43-e2392e742e30','Subcategoria Teste',NULL,true,false,'2026-01-30 03:19:29.079087+00','2026-01-30 03:19:29.079087+00',NULL),
('9725ea3e-4204-4592-bccc-f17847125037','6ed1c76d-1cdc-49e9-9550-2bb8e94e8291','QA_SubCategory',NULL,true,false,'2026-01-30 03:31:29.743305+00','2026-01-30 03:31:29.743305+00',NULL),
('965228c3-3101-42e3-abe9-0f350c77420a','e225522d-f394-4676-8f9f-a48e3edecdc4','SubCategoria teste',NULL,true,false,'2026-02-24 17:34:48.946461+00','2026-02-24 17:34:48.946461+00',NULL),
('30c09bec-5464-4d11-bd03-da20b0824716','703fc8af-0bf6-4ee2-9c0d-ad2f4ae71276','6.1. Dispensa-teste','teste',true,false,'2026-03-12 00:56:21.891936+00','2026-03-12 00:56:21.891936+00',NULL),
('fff624cb-7bf8-4d46-8bff-7a2050747742','4ce7b204-8335-4657-bf3e-f67bef721cbc','7.1. Subcategoria dispensa',NULL,true,false,'2026-03-12 01:13:26.172604+00','2026-03-12 01:13:26.172604+00',NULL);

INSERT INTO public.categorias_orgaos (id, categoria_id, orgao_id, created_at) VALUES
('1d5db021-619d-42ea-b642-7b01808017ef','59564923-9d41-419d-bb4b-989605208e3b','93216f1b-0daa-4510-97cf-2ec3e52ce236','2026-02-24 16:10:46.831907+00'),
('b60a08d2-1064-445b-a0ef-c66c48e4763d','e225522d-f394-4676-8f9f-a48e3edecdc4','93216f1b-0daa-4510-97cf-2ec3e52ce236','2026-02-24 17:34:48.70555+00'),
('414247d9-c1a7-4acb-b4b7-b48ae28300a5','703fc8af-0bf6-4ee2-9c0d-ad2f4ae71276','93216f1b-0daa-4510-97cf-2ec3e52ce236','2026-03-12 00:55:47.990213+00'),
('d83e45d9-bf43-4b15-8748-ea84104eb4c5','4ce7b204-8335-4657-bf3e-f67bef721cbc','80db748d-dae4-4104-b7dc-7eab1415939c','2026-03-12 01:13:25.967369+00');

INSERT INTO public.documentos (id, numero, titulo, tipo, categoria_id, subcategoria_id, processo_id, arquivo_url, status, created_at, updated_at, ativo, excluido) VALUES
('8a54a8ff-80ca-46e7-8fc8-47d20c32efe7','BASE-1769742905456','Baseline Probe','Probe',NULL,NULL,NULL,NULL,'Rascunho','2026-01-30 03:15:06.154275+00','2026-01-30 03:15:06.154275+00',true,false),
('82517f79-16ea-4e52-b59a-6310713d5c00','PCAT-1769742906096','Probe Cat','Probe',NULL,NULL,NULL,NULL,'Rascunho','2026-01-30 03:15:06.674001+00','2026-01-30 03:15:06.674001+00',true,false),
('09bad7a9-5aa1-4cbd-a23b-bc2b0c51907b','2026-56','Parecer Técnico de Teste','Parecer','fda2f62c-4c9d-4cb6-b214-e9d423ba442f','d674dd81-33a7-4534-9033-0c547e6ebc04',NULL,NULL,'Rascunho','2026-01-30 03:16:18.860107+00','2026-01-30 03:16:18.860107+00',true,false),
('689cf220-bd25-43ab-b642-9e1239c83167','BASE-1769743021672','Baseline Probe','Probe',NULL,NULL,NULL,NULL,'Rascunho','2026-01-30 03:17:02.376228+00','2026-01-30 03:17:02.376228+00',true,false),
('6f80f613-597a-42e5-80fd-446520eaede7','PCAT-1769743022306','Probe Cat','Probe',NULL,NULL,NULL,NULL,'Rascunho','2026-01-30 03:17:02.903792+00','2026-01-30 03:17:02.903792+00',true,false),
('574ad11f-401f-4648-ac7e-d5ad038d455c','BADFK-1769743022535','Probe Bad FK','Probe','00000000-0000-0000-0000-000000000000',NULL,NULL,NULL,'Rascunho','2026-01-30 03:17:03.10943+00','2026-01-30 03:17:03.10943+00',true,false),
('8ec5af60-50af-4019-9a2b-39432d508456','2026-232','Parecer Técnico de Teste','Parecer','1897f6ba-27a5-4adb-8200-b54361439192','6ac86f77-1947-4d43-b3ba-47fe3ff9402e',NULL,NULL,'Rascunho','2026-01-30 03:18:38.182261+00','2026-01-30 03:18:38.182261+00',true,false),
('9e7773fe-bd05-4e28-a8c3-93e60b63b25e','2026-812','Parecer Técnico de Teste','Parecer','102b5064-8adc-404d-be43-e2392e742e30','f678dc4a-f087-497f-b16e-e31440fa6268',NULL,NULL,'Concluído','2026-01-30 03:19:29.293624+00','2026-01-30 03:19:29.293624+00',true,false),
('23a85188-b194-42ca-bc35-70d13e3900bb','BASE-1769743212298','Baseline Probe','Probe',NULL,NULL,NULL,NULL,'Rascunho','2026-01-30 03:20:13.03566+00','2026-01-30 03:20:13.03566+00',true,false),
('6e74f3a8-a77c-4ba5-8fdd-d3e269d365d4','PCAT-1769743212965','Probe Cat','Probe',NULL,NULL,NULL,NULL,'Rascunho','2026-01-30 03:20:13.54754+00','2026-01-30 03:20:13.54754+00',true,false),
('df912158-e225-48b6-a9bd-6b146d2aeaa0','PPRO-1769743213173','Probe Processo','Probe',NULL,NULL,NULL,NULL,'Rascunho','2026-01-30 03:20:13.758046+00','2026-01-30 03:20:13.758046+00',true,false),
('25922b3b-5b98-43cf-acb8-cd9fa0ae20d0','BADFK-1769743213380','Probe Bad FK','Probe','00000000-0000-0000-0000-000000000000',NULL,NULL,NULL,'Rascunho','2026-01-30 03:20:13.969035+00','2026-01-30 03:20:13.969035+00',true,false),
('91fc04a6-2f86-4d11-a94e-fd4c9cc3eb75','2026/QA-863','QA Test Document UPDATED','QA','6ed1c76d-1cdc-49e9-9550-2bb8e94e8291','9725ea3e-4204-4592-bccc-f17847125037',NULL,NULL,'Rascunho','2026-01-30 03:31:29.979832+00','2026-01-30 03:31:29.979832+00',true,true),
('651535f8-1ba1-42af-90db-9bb042d9fe37','1','Documento de Teste E2E','Parecer','2645d8b9-ddfe-434d-ad94-a4c78e3d6e32','bc816f05-86bd-4101-bcc9-236db70aec27',NULL,NULL,'Em Revisão','2026-03-10 16:02:47.264897+00','2026-03-10 16:02:47.264897+00',true,false),
('0be1a987-7313-47bd-b690-b9e39363c4d8','7.1.1.','Documento teste 1','Minuta','4ce7b204-8335-4657-bf3e-f67bef721cbc','fff624cb-7bf8-4d46-8bff-7a2050747742',NULL,NULL,'Rascunho','2026-03-12 01:42:04.283803+00','2026-03-12 01:45:57.684853+00',true,false),
('e354517a-e209-48a4-a6f8-d4fed2028346','7.1.2.','Doc teste1','Minuta','4ce7b204-8335-4657-bf3e-f67bef721cbc','fff624cb-7bf8-4d46-8bff-7a2050747742',NULL,NULL,'Rascunho','2026-03-12 01:53:31.006434+00','2026-03-12 01:53:31.006434+00',true,false);

INSERT INTO public.documento_anexos (id, documento_id, nome, tamanho, url, tipo_mime, created_at) VALUES
('8d37912f-41a9-4277-8227-c7e31bf1492d','e354517a-e209-48a4-a6f8-d4fed2028346','4.4.3. justificativa da contratação -  art. 75,ii - macro - sia44002-.docm','0.55 MB','e354517a-e209-48a4-a6f8-d4fed2028346/1773280411627_4.4.3._justificativa_da_contratacao_-_art._75_ii_-_macro_-_sia44002-.docm','application/octet-stream','2026-03-12 01:53:32.647985+00');

INSERT INTO public.documento_historico (id, documento_id, acao, usuario_id, usuario_nome, detalhes, created_at) VALUES
('e9ad2068-29cf-417b-90f8-aa2e41ef6c91','651535f8-1ba1-42af-90db-9bb042d9fe37','Criado','322cdb73-29d3-43b5-a785-af469da033f4','admin@siagov.com',NULL,'2026-03-10 16:02:47.806377+00'),
('3c27b203-d20f-4cfc-a840-ae1ada5d49eb','df912158-e225-48b6-a9bd-6b146d2aeaa0','Download','322cdb73-29d3-43b5-a785-af469da033f4','admin@siagov.com',NULL,'2026-03-11 00:11:17.086854+00'),
('db196b4a-5882-475f-a3d1-4063c2913439','0be1a987-7313-47bd-b690-b9e39363c4d8','Criado','322cdb73-29d3-43b5-a785-af469da033f4','admin@siagov.com',NULL,'2026-03-12 01:42:04.822889+00'),
('7e0b4990-a0d7-44dc-9840-b90eb634ede1','e354517a-e209-48a4-a6f8-d4fed2028346','Criado','322cdb73-29d3-43b5-a785-af469da033f4','admin@siagov.com',NULL,'2026-03-12 01:53:31.441478+00'),
('a18e53d2-861f-4faf-bb83-fd4bd2aa2dcf','e354517a-e209-48a4-a6f8-d4fed2028346','Download','322cdb73-29d3-43b5-a785-af469da033f4','admin@siagov.com',NULL,'2026-03-12 02:20:52.695352+00'),
('4f393d7a-a723-42fd-98dd-dce0bfbc8308','e354517a-e209-48a4-a6f8-d4fed2028346','Download','322cdb73-29d3-43b5-a785-af469da033f4','admin@siagov.com',NULL,'2026-03-12 02:20:55.771463+00');

COMMIT;
