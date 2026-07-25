export enum EValidationRuleType {
  // Números
  MIN = 'min',
  MAX = 'max',

  // Longitud de texto
  MIN_LENGTH = 'minlength',
  MAX_LENGTH = 'maxlength',

  // Expresiones regulares
  REGEX = 'regex',
  PATTERN = 'pattern',

  // Contenido de texto
  CONTAINS = 'contains',
  NOT_CONTAINS = 'notcontains',
  STARTS_WITH = 'startswith',
  ENDS_WITH = 'endswith',

  // Igualdad
  EQUALS = 'eq',
  NOT_EQUALS = 'neq',

  // Listas
  IN = 'in',
  NOT_IN = 'notin',

  // Fechas
  BEFORE = 'before',
  AFTER = 'after',

  BEFORE_OR_EQUAL = 'beforeorequal',
  AFTER_OR_EQUAL = 'afterorequal',
  PAST = 'past',
  FUTURE = 'future',
  TODAY = 'today',

  // Personalizado
  CUSTOM = 'custom',
}
