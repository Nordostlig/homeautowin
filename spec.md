# Especificação Técnica: Implementação de Observações e CRUD de Registros

## 1. Visão Geral

Adição de campo de observações aos registros de pressão arterial, funcionalidade de edição retroativa e exclusão de registros existentes. A interface deve manter a consistência visual atual, utilizando modais para interações de confirmação e edição.

---

## 2. Requisitos Funcionais

### 2.1 Campo de Observações

- **Input:** Campo de texto opcional no formulário principal.
- **Limite:** Máximo de 150 caracteres.
- **Persistência:**
  - Novos registros salvam o texto inserido.
  - Registros legados (anteriores a esta versão) devem ser tratados como `null` ou string vazia.
- **Exibição na Listagem:**
  - O campo deve permanecer oculto na visualização compacta do card/linha.
  - Ao expandir o registro, exibir o conteúdo.
  - Caso esteja vazio, exibir o placeholder: `"Sem observações"`.
- **PDF:** Incluir uma nova coluna ou linha de detalhe no relatório gerado com o conteúdo das observações.

---

### 2.2 Edição de Registros

- **Gatilho:** Ícone de edição (lápis) posicionado ao lado de cada registro na listagem.
- **Interface:** Abertura de Modal (ou SweetAlert2 customizado) contendo:
  - Data e Hora (ajuste de data/hora retroativa).
  - Pressão Arterial Sistólica (PAS).
  - Pressão Arterial Diastólica (PAD).
  - Campo de Observações.
- **Lógica de Negócio:**
  - A classificação (ex: Normal, Hipertensão Estágio 1, etc.) deve ser recalculada automaticamente no momento do salvamento com base nos novos valores de PAS/PAD.
  - Atualizar o estado global/banco de dados local imediatamente após a confirmação.

---

### 2.3 Exclusão de Registros

- **Gatilho:** Ícone "X" no canto superior direito de cada card/registro.
- **Confirmação:** Exibir alerta de confirmação (SweetAlert2) antes de efetivar a exclusão.
- **Ação:** Remover o registro do armazenamento e atualizar a lista em tempo real.

---

## 3. Especificações Técnicas e UI

### 3.1 Componentes e Bibliotecas

- **Feedback Visual:** SweetAlert2 para mensagens de sucesso, erro e confirmação de exclusão.
- **Modais:** Manter o padrão do framework atual (ex: Modais do Bootstrap ou componentes nativos do Flutter/React conforme o projeto original).

---

### 3.2 Estrutura de Dados (Update)

```json
{
  "id": "uuid",
  "data_hora": "ISO8601 String",
  "pas": "number",
  "pad": "number",
  "observacao": "string (max 150) || null",
  "classificacao": "string"
}
```

---

### 3.3 Regras de Interface

- **Preservação do Design:** Não alterar cores, fontes ou o layout do formulário principal, apenas inserir o novo campo de texto abaixo dos campos de pressão.
- **Comportamento de Expansão:** Utilizar um efeito de accordion ou collapse para mostrar as observações na lista, garantindo que a tela não fique poluída visualmente.

---

## 4. Fluxo de Experiência do Usuário (UX)

| Ação | Descrição |
|---|---|
| **Inserção** | O usuário preenche os valores, opcionalmente digita uma nota e salva. |
| **Consulta** | O usuário vê a lista compacta; se quiser ler a nota, clica para expandir. |
| **Correção** | O usuário percebe um erro, clica no ícone de edição, altera a data/hora para o momento real da medição e salva. O sistema confirma a alteração com um toast/modal de sucesso. |
| **Limpeza** | O usuário exclui um registro acidental clicando no X e confirmando no popup. |
