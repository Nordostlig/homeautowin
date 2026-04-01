const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const DADOS_DIR = path.join(__dirname, '../../dados');
const LEGACY_DIR = path.join(DADOS_DIR, 'pressao');
const DB_PATH = path.join(DADOS_DIR, 'homeauto.db');
const LEGACY_FILE_REGEX = /^\d{4}-\d{2}-diariodepressao\.csv$/;
const DATA_HORA_REGEX = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/;

let db;
let initialized = false;

function pad(value) {
    return String(value).padStart(2, '0');
}

function nowTimestamp() {
    const now = new Date();
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

function ensureBaseDirs() {
    fs.mkdirSync(DADOS_DIR, { recursive: true });
}

function ensureDb() {
    if (!db) {
        ensureBaseDirs();
        db = new DatabaseSync(DB_PATH);
        db.exec('PRAGMA journal_mode = WAL;');
        db.exec('PRAGMA foreign_keys = ON;');
    }

    return db;
}

function createSchema() {
    const database = ensureDb();

    database.exec(`
        CREATE TABLE IF NOT EXISTS pressao_registros (
            id INTEGER PRIMARY KEY,
            measured_at TEXT NOT NULL,
            pas INTEGER NOT NULL,
            pad INTEGER NOT NULL,
            created_at TEXT NOT NULL,
            source TEXT NOT NULL DEFAULT 'manual'
        );

        CREATE TABLE IF NOT EXISTS pressao_imports (
            arquivo TEXT PRIMARY KEY,
            checksum TEXT NOT NULL,
            migrado_em TEXT NOT NULL
        );

        CREATE INDEX IF NOT EXISTS idx_pressao_registros_measured_at
            ON pressao_registros (measured_at DESC);
    `);
}

function fileChecksum(content) {
    return crypto.createHash('sha256').update(content, 'utf8').digest('hex');
}

function isValidMeasurement(pas, pad) {
    return Number.isInteger(pas) &&
        Number.isInteger(pad) &&
        pas >= 50 &&
        pas <= 300 &&
        pad >= 30 &&
        pad <= 200;
}

function parseLegacyCsvFile(fileName) {
    const filePath = path.join(LEGACY_DIR, fileName);
    const rawContent = fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '');
    const checksum = fileChecksum(rawContent);
    const lines = rawContent
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(Boolean);

    if (lines.length === 0) {
        throw new Error(`Arquivo legado vazio: ${fileName}`);
    }

    if (lines[0] !== 'data_hora,PAS,PAD') {
        throw new Error(`Cabecalho invalido em ${fileName}. Esperado: data_hora,PAS,PAD`);
    }

    const records = [];

    for (let index = 1; index < lines.length; index += 1) {
        const line = lines[index];
        const parts = line.split(',');

        if (parts.length !== 3) {
            console.warn(`[pressao] Linha ignorada em ${fileName}:${index + 1} - formato invalido.`);
            continue;
        }

        const measuredAt = parts[0].trim();
        const pas = Number.parseInt(parts[1], 10);
        const pad = Number.parseInt(parts[2], 10);

        if (!DATA_HORA_REGEX.test(measuredAt) || !isValidMeasurement(pas, pad)) {
            console.warn(`[pressao] Linha ignorada em ${fileName}:${index + 1} - dados invalidos.`);
            continue;
        }

        records.push({ measuredAt, pas, pad });
    }

    return { checksum, records };
}

function importLegacyCsvFile(fileName) {
    const database = ensureDb();
    const importedRow = database
        .prepare('SELECT checksum FROM pressao_imports WHERE arquivo = ?')
        .get(fileName);
    const { checksum, records } = parseLegacyCsvFile(fileName);

    if (importedRow && importedRow.checksum === checksum) {
        return {
            status: 'skipped',
            fileName,
            importedRecords: 0
        };
    }

    if (importedRow && importedRow.checksum !== checksum) {
        const message = `Divergencia detectada no CSV legado ${fileName}. O arquivo mudou apos a migracao; nenhuma reimportacao foi executada.`;
        console.error(`[pressao] ${message}`);
        return {
            status: 'conflict',
            fileName,
            importedRecords: 0,
            message
        };
    }

    const importedAt = nowTimestamp();
    const insertRecord = database.prepare(`
        INSERT INTO pressao_registros (measured_at, pas, pad, created_at, source)
        VALUES (?, ?, ?, ?, ?)
    `);
    const insertImport = database.prepare(`
        INSERT INTO pressao_imports (arquivo, checksum, migrado_em)
        VALUES (?, ?, ?)
    `);

    database.exec('BEGIN');

    try {
        for (const record of records) {
            insertRecord.run(record.measuredAt, record.pas, record.pad, importedAt, 'legacy_csv');
        }

        insertImport.run(fileName, checksum, importedAt);
        database.exec('COMMIT');

        return {
            status: 'imported',
            fileName,
            importedRecords: records.length
        };
    } catch (error) {
        database.exec('ROLLBACK');
        throw error;
    }
}

function importLegacyCsvFiles() {
    const summary = {
        filesFound: 0,
        importedFiles: 0,
        importedRecords: 0,
        skippedFiles: 0,
        conflictFiles: 0,
        errorFiles: 0,
        details: []
    };

    if (!fs.existsSync(LEGACY_DIR)) {
        return summary;
    }

    const files = fs.readdirSync(LEGACY_DIR)
        .filter(fileName => LEGACY_FILE_REGEX.test(fileName))
        .sort();

    summary.filesFound = files.length;

    for (const fileName of files) {
        try {
            const result = importLegacyCsvFile(fileName);

            if (!result) {
                continue;
            }

            summary.details.push(result);

            if (result.status === 'imported') {
                summary.importedFiles += 1;
                summary.importedRecords += result.importedRecords;
            } else if (result.status === 'skipped') {
                summary.skippedFiles += 1;
            } else if (result.status === 'conflict') {
                summary.conflictFiles += 1;
            }
        } catch (error) {
            summary.errorFiles += 1;
            summary.details.push({
                status: 'error',
                fileName,
                importedRecords: 0,
                message: error.message
            });
            console.error(`[pressao] Falha ao migrar ${fileName}: ${error.message}`);
        }
    }

    return summary;
}

function initializePressureStore() {
    if (initialized) {
        return;
    }

    createSchema();
    importLegacyCsvFiles();
    initialized = true;
}

function ensureInitialized() {
    if (!initialized) {
        initializePressureStore();
    }
}

function listMonths() {
    ensureInitialized();

    const rows = ensureDb().prepare(`
        SELECT substr(measured_at, 1, 7) AS mes, COUNT(*) AS total
        FROM pressao_registros
        GROUP BY substr(measured_at, 1, 7)
        ORDER BY mes DESC
    `).all();

    return rows.map(row => ({
        mes: row.mes,
        total: Number(row.total)
    }));
}

function listRecordsByMonth(month) {
    ensureInitialized();

    const rows = ensureDb().prepare(`
        SELECT id, measured_at AS data_hora, pas AS PAS, pad AS PAD
        FROM pressao_registros
        WHERE measured_at LIKE ?
        ORDER BY measured_at DESC, id DESC
    `).all(`${month}%`);

    return rows.map(row => ({
        id: Number(row.id),
        data_hora: row.data_hora,
        PAS: Number(row.PAS),
        PAD: Number(row.PAD)
    }));
}

function addRecord({ pas, pad }) {
    ensureInitialized();

    const measuredAt = nowTimestamp();
    const createdAt = nowTimestamp();
    const result = ensureDb().prepare(`
        INSERT INTO pressao_registros (measured_at, pas, pad, created_at, source)
        VALUES (?, ?, ?, ?, ?)
    `).run(measuredAt, pas, pad, createdAt, 'manual');

    return {
        id: Number(result.lastInsertRowid),
        data_hora: measuredAt,
        PAS: pas,
        PAD: pad
    };
}

module.exports = {
    DB_PATH,
    initializePressureStore,
    importLegacyCsvFiles,
    listMonths,
    listRecordsByMonth,
    addRecord
};
