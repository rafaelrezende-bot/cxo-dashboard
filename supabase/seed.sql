-- Frentes
INSERT INTO frentes VALUES
('piloto',   'Projeto Piloto',                '#6c8cff', 1),
('educacao', 'Educação IA (Aculturamento)',   '#a78bfa', 2),
('socios',   'Alinhamento com Sócios',        '#fbbf24', 3),
('pipeline', 'Pipeline & Vendas Próprias',    '#f472b6', 4),
('cx',       'CX & Templates Agent First',   '#34d399', 5),
('ia',       'Biblioteca IA & Ferramentas',  '#38bdf8', 6);

-- Frente tasks
INSERT INTO frente_tasks VALUES
('p1','piloto','Mapear projetos em andamento',1,2,'done','2 pilotos eleitos: Newtrade Capital e Meta.'),
('p2','piloto','Documentar baseline de custo',1,2,'in-progress','Newtrade: baseline sendo definido. Meta: entre hoje e amanhã.'),
('p3','piloto','Aplicar Agent First no projeto',2,4,'in-progress','Newtrade em fase de decisões estratégicas. Meta inicia semana 2.'),
('p4','piloto','Documentar antes/depois',3,4,'pending',''),
('p5','piloto','Escalar para 2–3 projetos',5,8,'pending',''),
('p6','piloto','Economia recorrente documentada',9,12,'pending',''),
('e1','educacao','Formulário diagnóstico (80 pessoas)',1,2,'done','Formulário disparado.'),
('e2','educacao','Conversas qualitativas (8–12 pessoas)',1,3,'pending',''),
('e3','educacao','Documento de diagnóstico consolidado',3,4,'pending',''),
('e4','educacao','Workshops Fase 2 — áreas prioritárias',5,8,'pending',''),
('e5','educacao','Implantação novos processos (Fase 3)',9,11,'pending',''),
('e6','educacao','Newsletter + encontro mensal (Fase 4)',10,12,'pending',''),
('s1','socios','Apresentar case piloto + Agent First',3,4,'done','Agent First apresentado em 07/abr. Recepção muito positiva.'),
('s2','socios','Negociar alocação de tempo',3,4,'pending',''),
('s3','socios','Relatório consolidado 90 dias',11,12,'pending',''),
('v1','pipeline','Mapear pipeline pessoal',1,2,'in-progress','Proposta Conar preparada. Apresentação na segunda (13/abr).'),
('v2','pipeline','Retomar conversas com prospects',3,5,'pending',''),
('v3','pipeline','2 propostas em negociação',5,8,'pending',''),
('v4','pipeline','Fechar 1º projeto próprio',8,12,'pending',''),
('c1','cx','Adaptar templates diagnóstico p/ Ivoire',5,7,'pending',''),
('c2','cx','Primeiro diagnóstico Agent First entregue',9,11,'pending',''),
('c3','cx','Implantar métricas CX (NPS, CSAT)',9,12,'pending',''),
('i1','ia','Biblioteca de prompts v1',5,8,'pending',''),
('i2','ia','Contratação ferramentas prioritárias',6,8,'pending',''),
('i3','ia','Time autônomo com IA nos projetos',9,12,'pending','');

-- Ad-hoc tasks
INSERT INTO adhoc_tasks VALUES
('ah_1','piloto','Integração RH — onboarding administrativo','done','reativa','Onboarding coletivo. Burocracia + plano de saúde + acessos.','2026-04-06','2026-04-06'),
('ah_2','piloto','Pedir organograma + mapa de equipe ao RH','done','proativa','Organograma formal não existe. Mapear por outros meios.','2026-04-06','2026-04-08'),
('ah_3','educacao','Conhecer equipe — conversas individuais iniciais','pending','proativa','Serve tripla função: relacionamento, diagnóstico IA, mapeamento de processos.','2026-04-06','2026-04-17'),
('ah_4','socios','Conversa de boas-vindas com Danilo (CEO)','done','proativa','Papo solto. Saíram dois projetos piloto: Newtrade e Meta.','2026-04-06','2026-04-06'),
('ah_5','piloto','Newtrade Capital — imersão + baseline de custo','done','proativa','Confirmado como piloto. Baseline em definição.','2026-04-06','2026-04-08'),
('ah_6','piloto','Meta — acompanhar aprovação da proposta','done','reativa','Confirmado como segundo piloto. Inicia semana 2.','2026-04-06','2026-04-11'),
('ah_7','socios','Conversa com Mariana Ueno (COO)','done','proativa','Boa recepção ao Agent First. Aliada estratégica.','2026-04-06','2026-04-06'),
('ah_8','piloto','Conversa com Mayline — líder do núcleo','done','proativa','Primeiro contato feito.','2026-04-06','2026-04-06'),
('ah_9','piloto','Reunião Mariana + Mayline — baseline de custo','done','proativa','Baseline em definição para ambos os projetos.','2026-04-06','2026-04-08'),
('ah_10','socios','Primeira reunião semanal com todos os sócios','done','proativa','Agent First recebido com entusiasmo. Vai virar filosofia da empresa.','2026-04-07','2026-04-07'),
('ah_11','socios','Revisar plano estratégico Ivoire — Agent First como filosofia','in-progress','proativa','Agent First vira identidade estratégica da Ivoire.','2026-04-08','2026-04-10'),
('ah_12','piloto','Onboarding RH — pendências administrativas','blocked','reativa','App de reserva, contrato, documentação plano de saúde. Aguardando RH.','2026-04-08','2026-04-17'),
('ah_13','pipeline','Proposta Conar — preparar e apresentar','done','proativa','Apresentação na segunda-feira (13/abr).','2026-04-08','2026-04-13');
