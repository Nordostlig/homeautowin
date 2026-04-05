# 🏠 HomeAuto

O **HomeAuto** é um hub de automação pessoal desenvolvido em Node.js seguindo o padrão **MVC (Model-View-Controller)**. Conta com automação de envio de e-mails e um diário de pressão arterial com geração de relatórios em PDF.

## 🚀 Funcionalidades Atuais

- **Automação de E-mail**: Envio de 2 arquivos PDF com assunto e corpo de texto gerados dinamicamente com base no mês e ano atuais.
- **Limpeza Inteligente**: A pasta de uploads é limpa automaticamente, removendo arquivos com mais de 60 dias (2 meses).
- **Diário de Pressão Arterial**: Registro, edição e exclusão de medições de pressão sistólica e diastólica, com campo de observações, classificação automática conforme a Diretriz Brasileira de Hipertensão Arterial (SBC, 2025), geração de relatório PDF e envio por e-mail.
- **Interface Moderna**: Dashboard responsivo construído com Bootstrap 5.3 e Bootstrap Icons, com suporte a modo escuro.
- **Segurança**: Variáveis sensíveis isoladas em arquivo `.env`.

## 📁 Estrutura do Projeto

```text
HomeAuto/
├── public/                  # View - Interface do usuário (HTML, CSS, JS)
│   ├── css/style.css        # Estilos customizados
│   ├── js/main.js           # Lógica do front-end (Fetch API)
│   ├── index.html           # Dashboard principal
│   ├── sendmail.html        # Serviço de envio de e-mail
│   └── pressao.html         # Diário de Pressão Arterial
├── src/                     # Backend - Lógica do servidor
│   ├── controllers/
│   │   ├── emailController.js    # Envio de e-mails com boletos/comprovantes
│   │   └── pressaoController.js  # CRUD do diário de pressão + envio de relatório
│   ├── routes/
│   │   ├── emailRoutes.js
│   │   └── pressaoRoutes.js
│   └── services/
│       └── pressaoStore.js       # Camada de acesso ao banco SQLite
├── dados/
│   └── homeauto.db          # Banco de dados SQLite (gerado automaticamente)
├── uploads/                 # Armazenamento temporário de arquivos
├── .env                     # Variáveis de ambiente (não rastreado pelo Git)
├── server.js                # Ponto de entrada da aplicação
└── package.json             # Dependências do projeto
```

## 🩺 Diário de Pressão Arterial

O módulo de pressão permite registrar, consultar, editar, excluir e exportar as medições diárias de pressão arterial.

### Funcionalidades

- **Registro de medições** — Entrada de PAS (sistólica), PAD (diastólica) e observações opcionais (máx. 150 caracteres), com carimbo de data e hora automático.
- **Edição retroativa** — Ícone de lápis em cada registro abre um modal para corrigir data/hora, PAS, PAD e observações. A classificação é recalculada automaticamente ao salvar.
- **Exclusão** — Ícone X em cada registro exibe uma confirmação via SweetAlert2 antes de remover.
- **Histórico mensal** — Navegação entre meses via seletor; registros exibidos do mais recente para o mais antigo. Clicar em uma linha expande as observações.
- **Classificação automática** — Cada medição recebe um badge colorido de acordo com a Diretriz Brasileira de Hipertensão Arterial (SBC, 2025):

| Classificação         | PAS (mmHg) | PAD (mmHg) |
|-----------------------|-----------|-----------|
| Normal                | < 120     | < 80      |
| Pré-hipertensão       | 120–139   | 80–89     |
| Hipertensão estágio 1 | 140–159   | 90–99     |
| Hipertensão estágio 2 | 160–179   | 100–109   |
| Hipertensão estágio 3 | ≥ 180     | ≥ 110     |

- **Relatório PDF** — Gerado no navegador via jsPDF + jspdf-autotable, com tabela completa do mês incluindo a coluna de observações e referência à diretriz.
- **Envio por e-mail** — O PDF é enviado diretamente para o e-mail da médica configurado em `.env`.

### Armazenamento

Os registros são salvos em banco de dados **SQLite** (`dados/homeauto.db`), criado automaticamente na primeira execução. O schema da tabela principal é:

```sql
CREATE TABLE pressao_registros (
    id          INTEGER PRIMARY KEY,
    measured_at TEXT NOT NULL,      -- formato: YYYY-MM-DD HH:MM
    pas         INTEGER NOT NULL,
    pad         INTEGER NOT NULL,
    observacao  TEXT,               -- máx. 150 caracteres, opcional
    created_at  TEXT NOT NULL,
    source      TEXT NOT NULL DEFAULT 'manual'
);
```

> Registros importados de arquivos CSV legados (`dados/pressao/`) são migrados automaticamente na inicialização do servidor.

### API REST (módulo de pressão)

| Método   | Rota                        | Descrição                          |
|----------|-----------------------------|------------------------------------|
| GET      | `/pressao/meses`            | Lista meses com registros          |
| GET      | `/pressao/registros?mes=`   | Lista registros de um mês          |
| POST     | `/pressao/registros`        | Cria novo registro                 |
| PUT      | `/pressao/registros/:id`    | Atualiza registro existente        |
| DELETE   | `/pressao/registros/:id`    | Remove registro                    |
| POST     | `/pressao/enviar-email`     | Envia PDF por e-mail               |

### Variáveis de Ambiente (módulo de pressão)

Adicione ao `.env`:

```text
EMAIL_FROM_MEDICA=seu-email@gmail.com
EMAIL_TO_MEDICA=email-da-medica@provedor.com
```

## 🛠️ Pré-requisitos

- Node.js instalado.
- Uma conta Gmail e uma Senha de App gerada nas configurações de segurança do Google.

## 📦 Instalação e Configuração

1. Clone o repositório:

```bash
git clone https://github.com/Nordostlig/homeautowin.git
cd HomeAuto
```

2. Instale as dependências:

```bash
npm install
```

3. Configure as variáveis de ambiente — crie `.env` na raiz:

```text
# Envio de boletos / comprovantes
EMAIL_USER=seu-email@gmail.com
EMAIL_PASS=sua-senha-de-app-de-16-digitos
EMAIL_TO=email-do-destinatario@provedor.com

# Diário de pressão arterial
EMAIL_FROM_MEDICA=seu-email@gmail.com
EMAIL_TO_MEDICA=email-da-medica@provedor.com

PORT=3000
```

4. Inicie o servidor:

```bash
node server.js
```

Acesse: http://localhost:3000

## 🛠️ Tecnologias Utilizadas

- **Backend**: Node.js, Express, SQLite (`node:sqlite`), Nodemailer, Multer, Dotenv
- **Frontend**: Bootstrap 5.3, Bootstrap Icons, SweetAlert2, CSS3, JavaScript (Fetch API)
- **PDF**: jsPDF, jspdf-autotable

## 📝 Licença

Este projeto é para uso pessoal. Sinta-se à vontade para expandir!

Desenvolvido por Cristhiano Mello em 2026.

---

> **Ao subir o projeto**, lembre-se de que `uploads/`, `dados/` e `.env` **não devem ir para o GitHub**. Seu `.gitignore` deve conter:
>
> ```text
> node_modules/
> .env
> uploads/
> dados/
> ```
