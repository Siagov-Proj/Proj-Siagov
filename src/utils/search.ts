export function sanitizeSearchTerm(term: string): string {
    return term
        .trim()
        .replace(/[,%_()]/g, '')
        .replace(/\s+/g, ' ');
}
