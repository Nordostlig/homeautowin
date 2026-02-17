# 🏠 HomeAuto

O **HomeAuto** é um hub de automação pessoal desenvolvido em Node.js seguindo o padrão **MVC (Model-View-Controller)**. Atualmente, conta com um serviço de automação de envio de e-mails para boletos e comprovantes mensais, com tratamento dinâmico de datas e limpeza automática de arquivos.

## 🚀 Funcionalidades Atuais

- **Automação de E-mail**: Envio de 2 arquivos PDF com assunto e corpo de texto gerados dinamicamente com base no mês e ano atuais.
- **Limpeza Inteligente**: A pasta de uploads é limpa automaticamente, removendo arquivos com mais de 60 dias (2 meses).
- **Interface Moderna**: Dashboard responsivo construído com Bootstrap 5.3.3 e Bootstrap Icons.
- **Segurança**: Variáveis sensíveis isoladas em arquivo `.env`.

## 📁 Estrutura do Projeto



```text
HomeAuto/
├── public/              # View - Interface do usuário (HTML, CSS, JS)
│   ├── css/style.css    # Estilos customizados
│   ├── js/main.js       # Lógica do front-end (Fetch API)
│   ├── index.html       # Dashboard principal
│   └── sendmail.html    # Serviço de envio de e-mail
├── src/                 # Backend - Lógica do servidor
│   ├── controllers/     # Lógica de negócio (Regras de data e envio)
│   └── routes/          # Definição de rotas da aplicação
├── uploads/             # Armazenamento temporário de arquivos
├── .env                 # Variáveis de ambiente (não rastreado pelo Git)
├── server.js            # Ponto de entrada da aplicação
└── package.json         # Dependências do projeto
```

##🛠️ Pré-requisitos
Node.js instalado.

Uma conta Gmail e uma Senha de App gerada nas configurações de segurança do Google.

##📦 Instalação e Configuração
Clone o repositório:

Bash
git clone [https://github.com/seu-usuario/HomeAuto.git](https://github.com/seu-usuario/HomeAuto.git)
cd HomeAuto
Instale as dependências:

Bash
npm install
Configure as variáveis de ambiente:
Crie um arquivo .env na raiz do projeto e preencha com seus dados:

Code snippet
EMAIL_USER=seu-email@gmail.com
EMAIL_PASS=sua-senha-de-app-de-16-digitos
EMAIL_TO=email-do-destinatario@provedor.com
PORT=3000
Inicie o servidor:

Bash
node server.js
Acesse: http://localhost:3000

##🛠️ Tecnologias Utilizadas
Backend: Node.js, Express, Nodemailer, Multer, Dotenv.

Frontend: Bootstrap 5.3.3, Bootstrap Icons, CSS3, JavaScript (Fetch API).

##📝 Licença
Este projeto é para uso pessoal. Sinta-se à vontade para expandir!

Desenvolvido por Cristhiano Mello em 2026.


---

### Dica para o GitHub:
Ao subir o projeto, lembre-se de que a pasta `uploads` e o arquivo `.env` **não devem ir para o GitHub**. Seu `.gitignore` deve estar assim:

```text
node_modules/
.env
uploads/