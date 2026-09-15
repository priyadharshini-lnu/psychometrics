import { TemplateLevel } from './constants'

export type TemplateAction = 'create' | 'copy' | 'override'

export const getTemplateActions = (level: TemplateLevel): TemplateAction[] => {
  if (level === 'platform' || level === 'client') return ['create', 'override']

  return ['create', 'copy', 'override']
}
