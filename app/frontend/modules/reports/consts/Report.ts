export const DATA_SHEET_COLUMN_TYPES = ['Text', 'Markdown', 'HTML', 'Number']
export enum GRAPH_CONDITION_TYPES {
  DEFAULT = 'default',
  GRAPH_VALUE = 'graph_value',
}
export const CUSTOM_FACTOR_VALUE_FIELDS = [
  'percentage', 'questions_attempted', 'questions_not_attempted', 'questions_partial_correct', 'questions_correct',
  'questions_incorrect', 'total_questions',
]
export const GRAPH_TYPES_SUPPORTING_CUSTOM_FACTOR_FIELDS = {
  Bar: true,
  Pie: true,
}
