const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

const DADOS_DIR = path.join(__dirname, '../../dados/pressao');

function garantirDiretorio() {
    if (!fs.existsSync(DADOS_DIR)) {
        fs.mkdirSync(DADOS_DIR, { recursive: true });
    }
}

function nomeArquivoAtual() {
    const agora = new Date();
    const ano = agora.getFullYear();
    const mes = String(agora.getMonth() + 1).padStart(2, '0');
    return `${ano}-${mes}-diariodepressao.csv`;
}

function dataHoraAgora() {
    const agora = new Date();
    const pad = n => String(n).padStart(2, '0');
    return `${agora.getFullYear()}-${pad(agora.getMonth() + 1)}-${pad(agora.getDate())} ${pad(agora.getHours())}:${pad(agora.getMinutes())}`;
}

exports.listarArquivos = (req, res) => {
    garantirDiretorio();
    try {
        const arquivos = fs.readdirSync(DADOS_DIR)
            .filter(f => /^\d{4}-\d{2}-diariodepressao\.csv$/.test(f))
            .sort()
            .reverse();
        res.json(arquivos);
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao listar arquivos' });
    }
};

exports.lerRegistros = (req, res) => {
    garantirDiretorio();
    const arquivo = req.params.arquivo;

    if (!/^\d{4}-\d{2}-diariodepressao\.csv$/.test(arquivo)) {
        return res.status(400).json({ erro: 'Nome de arquivo inválido' });
    }

    const caminho = path.join(DADOS_DIR, arquivo);

    if (!fs.existsSync(caminho)) {
        return res.json([]);
    }

    try {
        const conteudo = fs.readFileSync(caminho, 'utf-8');
        const linhas = conteudo.trim().split('\n').filter(l => l.trim());

        // Pula o cabeçalho e retorna do mais novo para o mais antigo
        const registros = linhas.slice(1).map(linha => {
            const partes = linha.split(',');
            return {
                data_hora: partes[0],
                PAS: partes[1],
                PAD: partes[2]
            };
        }).reverse();

        res.json(registros);
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao ler arquivo' });
    }
};

exports.adicionarRegistro = (req, res) => {
    garantirDiretorio();
    const { PAS, PAD } = req.body;

    if (!PAS || !PAD) {
        return res.status(400).json({ erro: 'PAS e PAD são obrigatórios' });
    }

    const pas = parseInt(PAS);
    const pad = parseInt(PAD);

    if (isNaN(pas) || isNaN(pad) || pas < 50 || pas > 300 || pad < 30 || pad > 200) {
        return res.status(400).json({ erro: 'Valores de pressão inválidos' });
    }

    const dataHora = dataHoraAgora();
    const arquivo = nomeArquivoAtual();
    const caminho = path.join(DADOS_DIR, arquivo);

    if (!fs.existsSync(caminho)) {
        fs.writeFileSync(caminho, 'data_hora,PAS,PAD\n', 'utf-8');
    }

    fs.appendFileSync(caminho, `${dataHora},${pas},${pad}\n`, 'utf-8');

    res.json({ sucesso: true, arquivo, data_hora: dataHora, PAS: pas, PAD: pad });
};

exports.enviarRelatorioPressao = async (req, res) => {
    const { pdfBase64, periodo, nomeArquivo } = req.body;

    if (!pdfBase64 || !periodo || !nomeArquivo) {
        return res.status(400).json({ erro: 'Dados insuficientes para envio.' });
    }

    try {
        const pdfBuffer = Buffer.from(pdfBase64, 'base64');

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        await transporter.sendMail({
            from: process.env.EMAIL_FROM_MEDICA,
            to: process.env.EMAIL_TO_MEDICA,
            subject: `Diário de Pressão Arterial — ${periodo}`,
            text: `Olá,\n\nSegue em anexo o diário de pressão arterial do período ${periodo}.\n\nAtt.\nCristhiano Mello`,
            attachments: [{
                filename: nomeArquivo,
                content: pdfBuffer,
                contentType: 'application/pdf'
            }]
        });

        res.json({ sucesso: true });
    } catch (error) {
        console.error('Erro ao enviar email de pressão:', error.message);
        res.status(500).json({ erro: 'Falha no envio do email.' });
    }
};
