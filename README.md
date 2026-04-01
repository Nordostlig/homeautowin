# 🏠 HomeAuto

O **HomeAuto** é um hub de automação pessoal desenvolvido em Node.js seguindo o padrão **MVC (Model-View-Controller)**. Conta com automação de envio de e-mails e um diário de pressão arterial com geração de relatórios em PDF.

## 🚀 Funcionalidades Atuais

- **Automação de E-mail**: Envio de 2 arquivos PDF com assunto e corpo de texto gerados dinamicamente com base no mês e ano atuais.
- **Limpeza Inteligente**: A pasta de uploads é limpa automaticamente, removendo arquivos com mais de 60 dias (2 meses).
- **Diário de Pressão Arterial**: Registro diário de pressão sistólica e diastólica, com classificação automática conforme a Diretriz Brasileira de Hipertensão Arterial (SBC, 2025), geração de relatório PDF e envio por e-mail.
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
│   └── routes/
│       ├── emailRoutes.js
│       └── pressaoRoutes.js
├── dados/
│   └── pressao/             # CSVs mensais (YYYY-MM-diariodepressao.csv)
├── uploads/                 # Armazenamento temporário de arquivos
├── .env                     # Variáveis de ambiente (não rastreado pelo Git)
├── server.js                # Ponto de entrada da aplicação
└── package.json             # Dependências do projeto
```

## 🩺 Diário de Pressão Arterial

O módulo de pressão permite registrar, consultar e exportar as medições diárias de pressão arterial.

### Funcionalidades

- **Registro de medições** — Entrada de PAS (sistólica) e PAD (diastólica) com carimbo de data e hora automático.
- **Histórico mensal** — Navegação entre meses via seletor; registros exibidos do mais recente para o mais antigo.
- **Classificação automática** — Cada medição recebe um badge colorido de acordo com a Diretriz Brasileira de Hipertensão Arterial (SBC, 2025):

| Classificação         | PAS (mmHg) | PAD (mmHg) |
|-----------------------|-----------|-----------|
| Normal                | < 120     | < 80      |
| Pré-hipertensão       | 120–139   | 80–89     |
| Hipertensão estágio 1 | 140–159   | 90–99     |
| Hipertensão estágio 2 | 160–179   | 100–109   |
| Hipertensão estágio 3 | ≥ 180     | ≥ 110     |

- **Relatório PDF** — Gerado no navegador via jsPDF + jspdf-autotable, com tabela completa do mês e referência à diretriz.
- **Envio por e-mail** — O PDF é enviado diretamente para o e-mail da médica configurado em `.env`.

### Armazenamento

Os registros são salvos em CSVs mensais em `dados/pressao/`, com o formato:

```text
dados/pressao/
├── 2026-01-diariodepressao.csv
├── 2026-02-diariodepressao.csv
└── 2026-03-diariodepressao.csv
```

Cada arquivo segue o esquema:

```csv
data_hora,PAS,PAD
2026-03-15 08:30,120,80
2026-03-15 20:00,118,76
```

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
git clone https://github.com/cfmello/HomeAuto.git
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

- **Backend**: Node.js, Express, Nodemailer, Multer, Dotenv
- **Frontend**: Bootstrap 5.3, Bootstrap Icons, CSS3, JavaScript (Fetch API)
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