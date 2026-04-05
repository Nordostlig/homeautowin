const nodemailer = require('nodemailer');
const pressaoStore = require('../services/pressaoStore');

const MES_REGEX = /^\d{4}-\d{2}$/;
const DATA_HORA_REGEX = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/;

exports.listarMeses = (req, res) => {
    try {
        res.json(pressaoStore.listMonths());
    } catch (error) {
        console.error('Erro ao listar meses de pressao:', error.message);
        res.status(500).json({ erro: 'Erro ao listar meses' });
    }
};

exports.lerRegistros = (req, res) => {
    const { mes } = req.query;

    if (!MES_REGEX.test(mes || '')) {
        return res.status(400).json({ erro: 'Mes invalido. Use o formato YYYY-MM.' });
    }

    try {
        res.json(pressaoStore.listRecordsByMonth(mes));
    } catch (error) {
        console.error('Erro ao ler registros de pressao:', error.message);
        res.status(500).json({ erro: 'Erro ao ler registros' });
    }
};

exports.adicionarRegistro = (req, res) => {
    const { PAS, PAD, observacao } = req.body;

    if (!PAS || !PAD) {
        return res.status(400).json({ erro: 'PAS e PAD sao obrigatorios' });
    }

    const pas = Number.parseInt(PAS, 10);
    const pad = Number.parseInt(PAD, 10);

    if (Number.isNaN(pas) || Number.isNaN(pad) || pas < 50 || pas > 300 || pad < 30 || pad > 200) {
        return res.status(400).json({ erro: 'Valores de pressao invalidos' });
    }

    const obs = typeof observacao === 'string' ? observacao.trim().slice(0, 150) : null;

    try {
        const registro = pressaoStore.addRecord({ pas, pad, observacao: obs || null });
        res.json({ sucesso: true, ...registro });
    } catch (error) {
        console.error('Erro ao adicionar registro de pressao:', error.message);
        res.status(500).json({ erro: 'Erro ao salvar registro' });
    }
};

exports.atualizarRegistro = (req, res) => {
    const id = Number.parseInt(req.params.id, 10);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ erro: 'ID invalido' });
    }

    const { PAS, PAD, observacao, data_hora } = req.body;

    if (!PAS || !PAD || !data_hora) {
        return res.status(400).json({ erro: 'PAS, PAD e data_hora sao obrigatorios' });
    }

    if (!DATA_HORA_REGEX.test(data_hora)) {
        return res.status(400).json({ erro: 'Formato de data_hora invalido. Use YYYY-MM-DD HH:MM' });
    }

    const pas = Number.parseInt(PAS, 10);
    const pad = Number.parseInt(PAD, 10);

    if (Number.isNaN(pas) || Number.isNaN(pad) || pas < 50 || pas > 300 || pad < 30 || pad > 200) {
        return res.status(400).json({ erro: 'Valores de pressao invalidos' });
    }

    const obs = typeof observacao === 'string' ? observacao.trim().slice(0, 150) : null;

    try {
        const registro = pressaoStore.updateRecord(id, { pas, pad, observacao: obs || null, measuredAt: data_hora });

        if (!registro) {
            return res.status(404).json({ erro: 'Registro nao encontrado' });
        }

        res.json({ sucesso: true, ...registro });
    } catch (error) {
        console.error('Erro ao atualizar registro de pressao:', error.message);
        res.status(500).json({ erro: 'Erro ao atualizar registro' });
    }
};

exports.excluirRegistro = (req, res) => {
    const id = Number.parseInt(req.params.id, 10);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ erro: 'ID invalido' });
    }

    try {
        const removido = pressaoStore.deleteRecord(id);

        if (!removido) {
            return res.status(404).json({ erro: 'Registro nao encontrado' });
        }

        res.json({ sucesso: true });
    } catch (error) {
        console.error('Erro ao excluir registro de pressao:', error.message);
        res.status(500).json({ erro: 'Erro ao excluir registro' });
    }
};

exports.migrarLegado = (req, res) => {
    try {
        const summary = pressaoStore.importLegacyCsvFiles();
        res.json({
            sucesso: true,
            ...summary
        });
    } catch (error) {
        console.error('Erro ao migrar arquivos legados de pressao:', error.message);
        res.status(500).json({ erro: 'Erro ao migrar planilhas legadas' });
    }
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
            subject: `Diario de Pressao Arterial - ${periodo}`,
            text: `Ola,\n\nSegue em anexo o diario de pressao arterial do periodo ${periodo}.\n\nAtt.\nCristhiano Mello`,
            attachments: [{
                filename: nomeArquivo,
                content: pdfBuffer,
                contentType: 'application/pdf'
            }]
        });

        res.json({ sucesso: true });
    } catch (error) {
        console.error('Erro ao enviar email de pressao:', error.message);
        res.status(500).json({ erro: 'Falha no envio do email.' });
    }
};
