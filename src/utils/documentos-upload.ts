export const MAX_DOCUMENT_UPLOAD_SIZE = 50 * 1024 * 1024;

export const ALLOWED_DOCUMENT_EXTENSIONS = [
    '.pdf',
    '.doc',
    '.docx',
    '.docm',
    '.dot',
    '.dotx',
    '.dotm',
    '.odt',
    '.rtf',
    '.txt',
    '.md',
    '.markdown',
] as const;

export const ALLOWED_DOCUMENT_MIME_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-word.document.macroenabled.12',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.template',
    'application/vnd.ms-word.template.macroenabled.12',
    'application/vnd.oasis.opendocument.text',
    'application/rtf',
    'text/rtf',
    'text/plain',
    'text/markdown',
    'text/x-markdown',
    'application/octet-stream',
] as const;

export const DOCUMENT_FILE_INPUT_ACCEPT = ALLOWED_DOCUMENT_EXTENSIONS.join(',');

export interface IDocumentUploadValidationResult {
    valido: boolean;
    mensagem?: string;
    extensao?: string;
}

export function getDocumentExtension(fileName: string): string {
    const normalized = fileName.trim().toLowerCase();
    const dotIndex = normalized.lastIndexOf('.');

    if (dotIndex < 0) {
        return '';
    }

    return normalized.slice(dotIndex);
}

export function sanitizeDocumentFileName(name: string): string {
    return name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9._-]/g, '_')
        .replace(/_+/g, '_');
}

export function validateDocumentFileMetadata(file: Pick<File, 'name' | 'size' | 'type'>): IDocumentUploadValidationResult {
    if (file.size > MAX_DOCUMENT_UPLOAD_SIZE) {
        return { valido: false, mensagem: `O arquivo "${file.name}" excede o limite de 50MB.` };
    }

    const extensao = getDocumentExtension(file.name);

    if (!extensao || !ALLOWED_DOCUMENT_EXTENSIONS.includes(extensao as (typeof ALLOWED_DOCUMENT_EXTENSIONS)[number])) {
        return {
            valido: false,
            mensagem: `O arquivo "${file.name}" tem um formato nao permitido.`,
        };
    }

    if (file.type && !ALLOWED_DOCUMENT_MIME_TYPES.includes(file.type.toLowerCase() as (typeof ALLOWED_DOCUMENT_MIME_TYPES)[number])) {
        return {
            valido: false,
            mensagem: `O arquivo "${file.name}" possui um tipo MIME nao permitido.`,
        };
    }

    return { valido: true, extensao };
}

function hasZipSignature(signature: string): boolean {
    return signature.startsWith('504b0304') || signature.startsWith('504b0506') || signature.startsWith('504b0708');
}

function hasCompoundFileSignature(signature: string): boolean {
    return signature.startsWith('d0cf11e0a1b11ae1');
}

function hasRtfSignature(bytes: Uint8Array): boolean {
    const text = new TextDecoder('utf-8', { fatal: false }).decode(bytes);
    return text.startsWith('{\\rtf');
}

function hasNoNullBytes(bytes: Uint8Array): boolean {
    return !bytes.some((byte) => byte === 0);
}

export async function validateDocumentFileSignature(file: File): Promise<IDocumentUploadValidationResult> {
    const metadata = validateDocumentFileMetadata(file);

    if (!metadata.valido || !metadata.extensao) {
        return metadata;
    }

    const header = new Uint8Array(await file.slice(0, 32).arrayBuffer());
    const signature = Array.from(header)
        .map((byte) => byte.toString(16).padStart(2, '0'))
        .join('');

    switch (metadata.extensao) {
        case '.pdf':
            return signature.startsWith('25504446')
                ? { valido: true, extensao: metadata.extensao }
                : { valido: false, mensagem: `O arquivo "${file.name}" nao corresponde a um PDF valido.` };
        case '.doc':
            return hasCompoundFileSignature(signature) || hasZipSignature(signature) || hasRtfSignature(header)
                ? { valido: true, extensao: metadata.extensao }
                : { valido: false, mensagem: `O arquivo "${file.name}" nao corresponde a um DOC valido.` };
        case '.docx':
        case '.docm':
        case '.dotx':
        case '.dotm':
        case '.odt':
            return hasZipSignature(signature)
                ? { valido: true, extensao: metadata.extensao }
                : { valido: false, mensagem: `O arquivo "${file.name}" nao corresponde a um documento compactado valido.` };
        case '.dot':
            return hasCompoundFileSignature(signature) || hasZipSignature(signature) || hasRtfSignature(header)
                ? { valido: true, extensao: metadata.extensao }
                : { valido: false, mensagem: `O arquivo "${file.name}" nao corresponde a um template DOC valido.` };
        case '.rtf': {
            return hasRtfSignature(header)
                ? { valido: true, extensao: metadata.extensao }
                : { valido: false, mensagem: `O arquivo "${file.name}" nao corresponde a um RTF valido.` };
        }
        case '.txt':
        case '.md':
        case '.markdown':
            return hasNoNullBytes(header)
                ? { valido: true, extensao: metadata.extensao }
                : { valido: false, mensagem: `O arquivo "${file.name}" nao corresponde a um arquivo de texto valido.` };
        default:
            return { valido: false, mensagem: `O arquivo "${file.name}" possui um formato nao suportado.` };
    }
}
