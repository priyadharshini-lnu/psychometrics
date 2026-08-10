
export const PAGE_SIZES = [
  { width: 850, height: 1100, label: 'Letter - Portrait (850x1100)' },
  { width: 1100, height: 850, label: 'Letter - Landscape (1100x850)' },
  { width: 827, height: 1169, label: 'A4 - Portrait (827x1169)' },
  { width: 1169, height: 827, label: 'A4 - Landscape (1169x827)' },
  { width: 1355, height: 762, label: 'PowerPoint Presentation (1355x762)' },
]
export const BASE_FONT_SIZE = 14

const { I18n } = window

export const SKILL_TYPES = [
  { label: I18n.t('administration.report_builder.property_panel.skill_types.technical'), value: 'technical' },
  { label: I18n.t('administration.report_builder.property_panel.skill_types.behavioral'), value: 'behavioral' },
  { label: I18n.t('administration.report_builder.property_panel.skill_types.qualification'), value: 'qualification' },
  { label: I18n.t('administration.report_builder.property_panel.skill_types.other'), value: 'other' },
]

export const JOB_ROLE_OPTIONS = [
  { label: I18n.t('administration.report_builder.property_panel.job_roles.current'), value: 'currentJobFactors' },
  { label: I18n.t('administration.report_builder.property_panel.job_roles.target'), value: 'targetJobFactors' },
]
