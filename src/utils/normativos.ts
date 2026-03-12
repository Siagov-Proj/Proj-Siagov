export function extractNormativoCode(value: string): string | null {
    const match = value.trim().match(/^(\d+(?:\.\d+)*)\.\s+/);
    return match ? match[1] : null;
}

export function stripNormativoCode(value: string): string {
    return value.trim().replace(/^(\d+(?:\.\d+)*)\.\s+/, '');
}

export function buildNormativoLabel(code: string, value: string): string {
    const cleanValue = stripNormativoCode(value);
    return `${code}. ${cleanValue}`;
}

function codeToParts(code: string | null): number[] {
    if (!code) return [];
    return code.split('.').map((part) => Number(part));
}

export function compareNormativoLabels(a: string, b: string): number {
    const partsA = codeToParts(extractNormativoCode(a));
    const partsB = codeToParts(extractNormativoCode(b));
    const maxLength = Math.max(partsA.length, partsB.length);

    for (let index = 0; index < maxLength; index++) {
        const valueA = partsA[index] ?? -1;
        const valueB = partsB[index] ?? -1;

        if (valueA !== valueB) {
            return valueA - valueB;
        }
    }

    return stripNormativoCode(a).localeCompare(stripNormativoCode(b));
}
