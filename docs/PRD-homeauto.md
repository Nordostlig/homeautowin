# PRD HomeAuto

Versao: 0.1
Status: Draft inicial
Data: 2026-04-01
Baseado em: leitura do codigo, README e interface atual

## 1. Resumo Executivo

O HomeAuto e um hub de automacao pessoal para centralizar tarefas recorrentes do dia a dia em uma interface web simples, local e de baixo atrito.

Hoje o produto resolve dois problemas concretos:

1. Envio recorrente de documentos em PDF por e-mail para terceiros.
2. Registro mensal de pressao arterial com historico, classificacao, exportacao em PDF e envio por e-mail.

Este PRD propoe um ponto de partida para transformar o projeto atual em um produto pessoal mais consistente, priorizando confiabilidade, simplicidade operacional e expansao modular de novos servicos.

## 2. Contexto e Problema

Muitas tarefas pessoais repetitivas ainda sao feitas manualmente, com risco de esquecimento, retrabalho e falta de padronizacao. No contexto atual do HomeAuto, os principais problemas sao:

- Enviar mensalmente documentos de condominio exige abrir e-mail, anexar arquivos, escrever assunto e texto manualmente.
- Registrar pressao arterial em papeis, anotações soltas ou apps genericos dificulta consolidacao mensal e compartilhamento com a medica.
- Pequenas automacoes pessoais normalmente ficam espalhadas em scripts isolados, sem uma interface unica.

## 3. Visao do Produto

Ser um painel pessoal de automacoes domesticas e administrativas, no qual o usuario acessa servicos pontuais com poucos cliques, sem depender de processos manuais repetitivos.

## 4. Objetivos

### Objetivos de negocio/pessoa usuaria

- Reduzir o tempo gasto em rotinas pessoais repetitivas.
- Diminuir o risco de erro humano em envios de e-mail e registros de saude.
- Consolidar automacoes pessoais em um unico painel.

### Objetivos do produto

- Oferecer uma experiencia web simples, clara e responsiva.
- Permitir operacao local com setup minimo.
- Servir como base modular para novos servicos no futuro.

## 5. Nao Objetivos

Itens fora do escopo deste ciclo inicial:

- Multiusuario.
- Autenticacao e perfis complexos.
- Hospedagem cloud e sincronizacao entre dispositivos.
- Integracoes com APIs bancarias, prontuarios ou dispositivos IoT reais.
- Edicao e exclusao de registros de pressao.
- Workflow medico completo ou interpretacao clinica avancada.

## 6. Personas

### Persona principal: usuario proprietario

- Pessoa que usa o sistema para suas proprias rotinas.
- Valoriza rapidez, previsibilidade e baixo esforço.
- Nao quer depender de varios apps diferentes para tarefas simples.

### Persona secundaria: profissional de saude destinatario

- Recebe o relatorio mensal de pressao por e-mail.
- Precisa de um anexo legivel, organizado e facil de consultar.

## 7. Escopo Atual do Produto

Com base na implementacao atual, o HomeAuto possui:

### 7.1 Dashboard

- Pagina inicial com navegacao para modulos.
- Card de "SendMail Condominio".
- Card de "Diario de Pressao".
- Placeholder visual para futuros servicos.

### 7.2 Modulo de envio de documentos

- Upload de ate 2 arquivos PDF.
- Envio por e-mail com assunto dinamico baseado em mes e ano atuais.
- Corpo do e-mail padronizado para contexto de condominio.
- Limpeza automatica de arquivos antigos em `uploads/`.

### 7.3 Modulo de diario de pressao

- Registro de PAS e PAD com validacao basica.
- Persistencia em CSV mensal em `dados/pressao/`.
- Consulta de historico por mes.
- Classificacao visual da pressao arterial por faixa.
- Geracao de PDF no navegador.
- Envio do PDF por e-mail para destinatario configurado.

## 8. Principais Jornadas

### Jornada 1: enviar documentos do condominio

1. Usuario acessa o dashboard.
2. Entra no modulo de envio.
3. Seleciona dois PDFs.
4. Clica em enviar.
5. Sistema envia e-mail para destinatario preconfigurado.
6. Usuario recebe feedback de sucesso ou erro.

### Jornada 2: registrar pressao arterial

1. Usuario acessa o modulo de pressao.
2. Informa PAS e PAD.
3. Sistema valida os valores.
4. Registro e salvo no CSV do mes atual com data e hora automaticas.
5. Historico e atualizado na tela.

### Jornada 3: compartilhar relatorio mensal

1. Usuario seleciona um mes no historico.
2. Sistema exibe registros do periodo.
3. Usuario baixa o PDF ou envia por e-mail.
4. Sistema gera o relatorio com classificacao e metadados do periodo.

## 9. Requisitos Funcionais

### RF-01 Dashboard central

- O sistema deve exibir um painel inicial com acesso aos servicos disponiveis.
- O sistema deve permitir adicionar novos servicos futuramente sem alterar a logica dos modulos existentes.

### RF-02 Envio de documentos por e-mail

- O sistema deve aceitar upload de arquivos PDF.
- O sistema deve limitar o envio a no maximo 2 arquivos no fluxo atual.
- O sistema deve enviar o e-mail para um destinatario configurado em variavel de ambiente.
- O sistema deve gerar assunto e texto automaticamente conforme mes/ano atual.
- O sistema deve retornar feedback visual de sucesso ou erro.

### RF-03 Diario de pressao

- O sistema deve registrar PAS e PAD com validacao de faixa aceitavel.
- O sistema deve gravar os registros em arquivos CSV mensais.
- O sistema deve listar os meses disponiveis.
- O sistema deve exibir os registros do mais recente para o mais antigo.
- O sistema deve classificar cada medicao conforme regras predefinidas.

### RF-04 Relatorio e compartilhamento

- O sistema deve permitir gerar um PDF do mes selecionado.
- O sistema deve permitir enviar esse PDF por e-mail.
- O relatorio deve conter tabela com data/hora, PAS, PAD e classificacao.

## 10. Requisitos Nao Funcionais

- A aplicacao deve rodar localmente com Node.js e configuracao simples via `.env`.
- A interface deve ser utilizavel em desktop e mobile.
- O sistema deve continuar funcional mesmo sem banco de dados relacional.
- Variaveis sensiveis nao devem ficar hardcoded no repositorio.
- O sistema deve tolerar ausencia inicial das pastas de dados, criando-as quando necessario.
- O tempo de operacao dos fluxos principais deve ser curto e com feedback visual imediato.

## 11. Dados e Armazenamento

### Estrategia atual

- Arquivos temporarios do modulo de e-mail em `uploads/`.
- Registros de pressao em `dados/pressao/YYYY-MM-diariodepressao.csv`.
- Configuracoes sensiveis em `.env`.

### Estrutura atual do CSV

```csv
data_hora,PAS,PAD
2026-03-15 08:30,120,80
```

## 12. Dependencias e Arquitetura Atual

### Backend

- Node.js
- Express
- Multer
- Nodemailer
- Dotenv

### Frontend

- HTML estatico
- CSS customizado
- Bootstrap via CDN
- JavaScript vanilla
- jsPDF e jspdf-autotable via CDN no modulo de pressao

### Arquitetura

- Estrutura simples inspirada em MVC.
- Rotas separadas por modulo.
- Controllers responsaveis por regras de negocio.
- Frontend servido como arquivos estaticos.

## 13. Metricas de Sucesso

Como produto pessoal, as metricas devem ser simples e orientadas a utilidade:

- Taxa de sucesso de envio de e-mail maior que 95% em uso normal.
- Reducao perceptivel do tempo gasto em tarefas recorrentes.
- Zero perda de registros de pressao no uso cotidiano.
- Capacidade de um usuario operar cada fluxo sem instrucoes complexas.

## 14. Riscos e Gaps Encontrados

Durante a leitura do projeto, surgiram pontos importantes para o backlog:

### Produto e consistencia

- O README descreve o produto como mais completo do que parte da implementacao sugere.
- O nome do pacote (`sendmail`) nao representa o produto HomeAuto.
- O projeto ainda nao possui criterios de aceite formais nem testes automatizados.

### Configuracao

- O README cita `EMAIL_TO`, mas o codigo do envio de documentos usa `EMAIL_TO_IMOB`.
- O modulo de pressao usa `EMAIL_FROM_MEDICA` e `EMAIL_TO_MEDICA`, o que esta consistente no controller.

### Seguranca e privacidade

- Nao ha autenticacao; se a aplicacao for exposta para fora da rede local, ha risco imediato.
- O PDF de pressao contem nome e telefone fixos no front-end atual.
- Dados de saude estao em CSV local, sem criptografia ou controle de acesso.

### Evolucao tecnica

- Nao ha logs estruturados, monitoramento ou trilha de auditoria.
- Nao ha testes para controllers, validacao ou fluxos criticos.
- Nao ha funcionalidade de editar/remover registros incorretos.

## 15. Prioridades Recomendadas para o Proximo Ciclo

### P0

- Alinhar README, `.env.example` e implementacao real.
- Corrigir nomenclaturas de variaveis de ambiente.
- Remover dados pessoais hardcoded do PDF.
- Definir criterio de aceite minimo para os dois modulos atuais.

### P1

- Adicionar testes basicos de API e validacao.
- Criar tratamento de erro mais claro para falhas de e-mail.
- Extrair configuracoes do paciente e destinatarios para `.env` ou arquivo de configuracao local.

### P2

- Permitir editar ou excluir registros de pressao.
- Adicionar novos servicos ao dashboard.
- Avaliar migracao de CSV para armazenamento mais robusto, se o uso crescer.

## 16. Backlog Inicial Sugerido

1. Criar `.env.example` com todas as variaveis reais do sistema.
2. Padronizar nomenclaturas entre README e codigo.
3. Renomear o pacote para `homeauto`.
4. Externalizar dados do paciente usados no PDF.
5. Adicionar testes para `emailController` e `pressaoController`.
6. Registrar erros com mais contexto no servidor.
7. Definir um padrao para novos modulos do dashboard.

## 17. Questoes em Aberto

- O HomeAuto sera sempre um sistema de uso estritamente local ou deve ser preparado para deploy externo?
- O modulo de envio de documentos deve continuar fixo para condominio ou virar um fluxo generico de envio de anexos?
- O diario de pressao e pensado para uma unica pessoa ou deve suportar mais de um perfil no futuro?
- Existe necessidade de importar/exportar historico alem do PDF mensal?

## 18. Proposta de Posicionamento do MVP

O MVP do HomeAuto deve ser tratado como um painel local de automacoes pessoais com dois servicos altamente funcionais:

- envio de documentos recorrentes por e-mail;
- diario de pressao arterial com relatorio compartilhavel.

Esse recorte e pequeno o suficiente para ser mantido com simplicidade, mas util o bastante para justificar a evolucao do produto em modulos.
