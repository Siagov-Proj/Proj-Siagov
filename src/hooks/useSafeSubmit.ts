import { useState, useRef, useCallback } from "react";

/**
 * Hook utilitário para prevenir duplo clique em submissões de formulários.
 * Mantém uma "guard clause" atômica usando useRef para evitar condições de corrida 
 * no Event Loop onde submets sucessivos ocorrem antes que o estado isFirstClick 
 * consiga sofrer re-render do React.
 */
export function useSafeSubmit<TArgs extends unknown[], TResult>(
  submitFn: (...args: TArgs) => Promise<TResult>,
  delayBetweenSubmitsMs: number = 1000
) {
  const [isSaving, setIsSaving] = useState(false);
  const isSubmittingRef = useRef(false);

  const safeSubmit = useCallback(
    async (...args: TArgs): Promise<TResult | undefined> => {
      // Guard Clause atômica contra race conditions
      if (isSubmittingRef.current) {
        console.warn("Bloqueado: Submissão paralela detectada.");
        return;
      }

      isSubmittingRef.current = true;
      setIsSaving(true);

      try {
        const result = await submitFn(...args);
        return result;
      } finally {
        setIsSaving(false);
        // Introduz um delay amigável (debounce natural) antes de desbloquear novamente
        setTimeout(() => {
          isSubmittingRef.current = false;
        }, delayBetweenSubmitsMs);
      }
    },
    [submitFn, delayBetweenSubmitsMs]
  );

  return {
    isSaving,
    safeSubmit,
  };
}
