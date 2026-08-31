import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useDispatch } from 'react-redux'
import { Form, message } from 'antd'
import { ApiActionResponse } from 'interfaces/ApiActionResponse'
import { fetchNameTranslations } from '~/modules/admin/modules/campaigns/core/list'

import {
  CampaignNameTranslationsState,
  FetchNameTranslationsResponse,
  NameTranslationsMap,
  UseCampaignNameTranslationsProps,
} from './types'

const { I18n } = window

const DEFAULT_LOCALE = I18n.defaultLocale || 'en'
const EMPTY_TEXT = ''

const getNormalizedLocales = (locales: string[]) => {
  const uniqueLocales = [...new Set([DEFAULT_LOCALE, ...(locales || [])])]
  return uniqueLocales.filter(Boolean)
}

export const useCampaignNameTranslations = ({
  form,
  projectId,
  campaignId,
  fieldName = 'name',
}: UseCampaignNameTranslationsProps): CampaignNameTranslationsState => {
  const dispatch = useDispatch()
  const availableLocales = useMemo(
    () => getNormalizedLocales(I18n.availableLocales || ['en']),
    [],
  )
  const currentLocale = I18n.locale || DEFAULT_LOCALE
  const defaultEditingLocale = availableLocales.includes(currentLocale)
    ? currentLocale
    : DEFAULT_LOCALE

  const [editingLocale, setEditingLocale] = useState(defaultEditingLocale)
  const [referenceLocale, setReferenceLocale] = useState<string | undefined>(undefined)
  const [translations, setTranslations] = useState<NameTranslationsMap>({})
  const [availableNameLocales, setAvailableNameLocales] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const isProgrammaticFieldUpdate = useRef(false)
  const dirtyLocalesRef = useRef<Set<string>>(new Set())
  const previousEditingLocaleRef = useRef(editingLocale)

  const translationValue = Form.useWatch(fieldName, form)

  const syncFormFieldFromLocale = (locale: string, nextTranslations: NameTranslationsMap = translations) => {
    if (!Object.prototype.hasOwnProperty.call(nextTranslations, locale)) return

    const nextValue = nextTranslations[locale] ?? EMPTY_TEXT
    const currentValue = form.getFieldValue(fieldName) ?? EMPTY_TEXT
    if (currentValue === nextValue) return

    isProgrammaticFieldUpdate.current = true
    form.setFieldValue(fieldName, nextValue)
  }

  const fetchTranslations = async (locales: Array<string | undefined>) => {
    if (!campaignId) return

    const requestedLocales = locales.filter(Boolean) as string[]
    if (requestedLocales.length === 0) return

    setIsLoading(true)
    try {
      const { response } = await dispatch(
        fetchNameTranslations(projectId, campaignId, requestedLocales),
      ) as unknown as ApiActionResponse<FetchNameTranslationsResponse>

      setAvailableNameLocales(response.availableLocales)

      setTranslations((previous) => {
        const merged = { ...previous }
        response.list.forEach(({ locale, name }) => {
          if (!dirtyLocalesRef.current.has(locale)) {
            merged[locale] = name || EMPTY_TEXT
          }
        })

        syncFormFieldFromLocale(editingLocale, merged)
        return merged
      })
    } catch {
      message.error(I18n.t('admin.campaign_name_translations_fetch_error'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!campaignId) return

    fetchTranslations([editingLocale, referenceLocale])
  }, [campaignId, editingLocale, referenceLocale])

  useEffect(() => {
    // Locale switches should not mark the new locale as dirty using the old field value.
    if (previousEditingLocaleRef.current !== editingLocale) {
      previousEditingLocaleRef.current = editingLocale
      return
    }

    if (translationValue === undefined || translationValue === null) return

    if (isProgrammaticFieldUpdate.current) {
      isProgrammaticFieldUpdate.current = false
      return
    }

    const nextDirtyLocales = new Set(dirtyLocalesRef.current)
    nextDirtyLocales.add(editingLocale)
    dirtyLocalesRef.current = nextDirtyLocales
    setTranslations(previous => ({
      ...(previous || {}),
      [editingLocale]: String(translationValue),
    }))
  }, [translationValue, editingLocale])

  const handleEditingLocaleChange = (locale: string) => {
    setEditingLocale(locale)
    syncFormFieldFromLocale(locale)
  }

  const handleReferenceLocaleChange = (locale?: string) => {
    setReferenceLocale(locale || undefined)
  }

  const availableReferenceLocales = [...new Set(availableNameLocales)]
    .filter(Boolean)

  const referenceValue = referenceLocale ? (translations[referenceLocale] ?? EMPTY_TEXT) : EMPTY_TEXT

  return {
    availableLocales,
    editingLocale,
    referenceLocale,
    availableReferenceLocales,
    referenceValue,
    isLoading,
    handleEditingLocaleChange,
    handleReferenceLocaleChange,
  }
}
