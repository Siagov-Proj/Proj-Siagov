'use server';

import { revalidatePath } from 'next/cache';
import { documentosServerService } from '@/services/api/documentosServerService';

function getStringValue(formData: FormData, field: string): string {
    const value = formData.get(field);
    return typeof value === 'string' ? value : '';
}

export async function criarDocumentoComAnexosAction(formData: FormData) {
    try {
        const anexos = formData
            .getAll('anexos')
            .filter((item): item is File => item instanceof File && item.size > 0);

        const resultado = await documentosServerService.criarDocumentoComAnexos({
            payload: {
                titulo: getStringValue(formData, 'titulo'),
                tipo: getStringValue(formData, 'tipo'),
                formato: getStringValue(formData, 'formato') || undefined,
                categoria_id: getStringValue(formData, 'categoriaId'),
                subcategoria_id: getStringValue(formData, 'subcategoriaId'),
                processo_id: getStringValue(formData, 'processoId') || undefined,
                status: getStringValue(formData, 'status'),
            },
            anexos,
        });

        revalidatePath('/cadastros/normativos');
        revalidatePath('/documentos');

        return { success: true, ...resultado };
    } catch (error) {
        console.error('Erro na server action de documento:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Nao foi possivel salvar o documento com anexos.',
        };
    }
}
