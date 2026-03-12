import { redirect } from 'next/navigation';

type INovoDocumentoRedirectPageProps = {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function NovoDocumentoRedirectPage({ searchParams }: INovoDocumentoRedirectPageProps) {
    const resolvedSearchParams = await searchParams;
    const query = new URLSearchParams();

    Object.entries(resolvedSearchParams).forEach(([key, value]) => {
        if (Array.isArray(value)) {
            value.forEach((item) => query.append(key, item));
            return;
        }

        if (typeof value === 'string') {
            query.set(key, value);
        }
    });

    const queryString = query.toString();
    redirect(`/cadastros/normativos/documentos/novo${queryString ? `?${queryString}` : ''}`);
}
