import { ValueTransformer } from 'typeorm';

export const ArrayStringTransformer: ValueTransformer = {
  // Cuando se guarda en la base de datos (Array -> String)
  to: (value: string[] | null | undefined): string | null => {
    if (!value || !Array.isArray(value)) return null;
    return value.join(',');
  },

  // Cuando se lee de la base de datos (String -> Array)
  from: (value: string | null | undefined): string[] => {
    if (!value) return [];
    return value.split(',').map((item) => item.trim());
  },
};
