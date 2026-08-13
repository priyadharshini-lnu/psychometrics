import { FormInstance } from 'antd/es/form'

export type TranslationItem = {
  name: string | null
  locale: string
}

export type FetchNameTranslationsResponse = {
  list: TranslationItem[]
  availableLocales: string[]
}

export type NameTranslationsMap = Record<string, string>

export type UseCampaignNameTranslationsProps = {
  form: FormInstance
  projectId: number
  campaignId?: number
  fieldName?: string
}

export type CampaignNameTranslationsState = {
  availableLocales: string[]
  editingLocale: string
  referenceLocale?: string
  availableReferenceLocales: string[]
  referenceValue: string
  isLoading: boolean
  handleEditingLocaleChange: (locale: string) => void
  handleReferenceLocaleChange: (locale?: string) => void
}
