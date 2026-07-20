import { type Completion } from '@codemirror/autocomplete'

const assessmentFunctions: Completion[] = [
  {
    label: 'assessment.raw_score',
    type: 'function',
    detail: '(assessment_id: integer, factor_id: integer) → number',
    apply: 'assessment.raw_score(assessment_id, factor_id)',
  },
  {
    label: 'assessment.norm_score',
    type: 'function',
    detail: '(assessment_id: integer, factor_id: integer) → number',
    apply: 'assessment.norm_score(assessment_id, factor_id)',
  },
  {
    label: 'assessment.zscore',
    type: 'function',
    detail: '(assessment_id: integer, factor_id: integer) → number',
    apply: 'assessment.zscore(assessment_id, factor_id)',
  },
  {
    label: 'assessment.percentage_answered',
    type: 'function',
    detail: '(assessment_id: integer, factor_id: integer) → number',
    apply: 'assessment.percentage_answered(assessment_id, factor_id)',
  },
  {
    label: 'assessment.answer',
    type: 'function',
    detail: '(assessment_id: integer, json_path: string, relationship: string) → value',
    apply: 'assessment.answer(assessment_id, json_path, relationship)',
  },
  {
    label: 'assessment.form_answer',
    type: 'function',
    detail: '(assessment_id: integer, question_id: integer, form_index: integer, relationship: string) → value',
    apply: 'assessment.form_answer(assessment_id, question_id, form_index, relationship)',
  },
  {
    label: 'assessment.campaign_feedback_answer',
    type: 'function',
    detail: '(assessment_id: integer, question_id: integer, code: string, relationship: string) → value',
    apply: 'assessment.campaign_feedback_answer(assessment_id, question_id, code, relationship)',
  },
  {
    label: 'assessment.status',
    type: 'function',
    detail: '(assessment_id: integer) → string',
    apply: 'assessment.status(assessment_id)',
  },
]

const helperFunctions: Completion[] = [
  {
    label: 'helpers.round',
    type: 'function',
    detail: '(value: number, precision?: number) → number',
    apply: 'helpers.round(value, precision)',
  },
  {
    label: 'helpers.percentile',
    type: 'function',
    detail: '(zscore: number) → number',
    apply: 'helpers.percentile(zscore)',
  },
  {
    label: 'helpers.average',
    type: 'function',
    detail: '(values: number[], precision?: number) → number',
    apply: 'helpers.average(values, precision)',
  },
]

const userFunctions: Completion[] = [
  {
    label: 'user.fixed_field_value',
    type: 'function',
    detail: '(field: string) → value',
    apply: 'user.fixed_field_value(field)',
  },
  {
    label: 'user.custom_profile_field_value',
    type: 'function',
    detail: '(profile_id: string) → value',
    apply: 'user.custom_profile_field_value(profile_id)',
  },
]

const datasheetFunctions: Completion[] = [
  {
    label: 'datasheet.value',
    type: 'function',
    detail: '(column_name: string) → value',
    apply: 'datasheet.value(column_name)',
  },
]

export const allScoringCompletions: Completion[] = [
  ...assessmentFunctions,
  ...helperFunctions,
  ...userFunctions,
  ...datasheetFunctions,
]
