import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import {
  CampaignAssessmentGroup,
  FetchNameTranslationsResponse,
} from '~/modules/admin/modules/campaigns/core/assessmentGroups'

const { I18n } = window

type GroupState = {
  currentValue: string
  initialValue: string
  referenceValue: string
  error: string
}

type SaveSuccess = { ok: true; groupId: number; response: CampaignAssessmentGroup }
type SaveFailure = { ok: false; groupId: number; error: unknown }
type SaveResult = SaveSuccess | SaveFailure

type Props = {
  groups: CampaignAssessmentGroup[]
  campaignId: number
  availableLocales: string[]
  fetchNameTranslations: (
    campaignId: number,
    groupId: number,
    locales: Array<string | null>,
  ) => Promise<{ response: FetchNameTranslationsResponse }>
  updateGroup: (
    campaignId: number,
    id: number,
    data: Partial<CampaignAssessmentGroup>,
    locale?: string,
  ) => Promise<{ response: CampaignAssessmentGroup }>
  onSaveSuccess: (groups: CampaignAssessmentGroup[]) => void
  onSaveError: () => void
}

export const useGroupNameTranslations = ({
  groups,
  campaignId,
  availableLocales,
  fetchNameTranslations,
  updateGroup,
  onSaveSuccess,
  onSaveError,
}: Props) => {
  const currentLocale = I18n.locale || 'en'
  const defaultEditingLocale = availableLocales.includes(currentLocale)
    ? currentLocale
    : (availableLocales[0] ?? 'en')

  const [editingLocale, setEditingLocale] = useState(defaultEditingLocale)
  const [referenceLocale, setReferenceLocale] = useState<string | undefined>(undefined)
  const [groupStates, setGroupStates] = useState<Record<number, GroupState>>({})
  const [availableNameLocales, setAvailableNameLocales] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const isSavingRef = useRef(false)

  const sortedGroups = useMemo(
    () => [...groups].sort((a, b) => a.position - b.position),
    [groups],
  )

  const changedGroups = useMemo(
    () => sortedGroups.filter(
      group => (groupStates[group.id]?.currentValue ?? '') !== (groupStates[group.id]?.initialValue ?? ''),
    ),
    [sortedGroups, groupStates],
  )

  useEffect(() => {
    if (!sortedGroups.length) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)

    Promise.all(
      sortedGroups.map(group => fetchNameTranslations(campaignId, group.id, [editingLocale, referenceLocale ?? null])
        .then(({ response }) => ({ group, response }))),
    ).then((groupResponses) => {
      const nextStates: Record<number, GroupState> = {}
      const locales = new Set<string>()

      groupResponses.forEach(({ group, response }) => {
        response.availableLocales.forEach(locale => locales.add(locale))

        const currentValue = response.list.find(item => item.locale === editingLocale)?.name ?? ''
        const referenceValue = referenceLocale
          ? (response.list.find(item => item.locale === referenceLocale)?.name ?? '')
          : ''

        nextStates[group.id] = {
          currentValue,
          initialValue: currentValue,
          referenceValue,
          error: '',
        }
      })

      setGroupStates(nextStates)
      setAvailableNameLocales([...locales].sort())
    }).finally(() => {
      setIsLoading(false)
    })
  }, [sortedGroups, editingLocale, referenceLocale, campaignId, fetchNameTranslations])

  const handleEditingLocaleChange = (locale: string) => {
    setEditingLocale(locale)
  }

  const handleReferenceLocaleChange = (locale: string | undefined) => {
    setReferenceLocale(locale || undefined)
  }

  const handleNameChange = (groupId: number, value: string) => {
    setGroupStates(prev => ({
      ...prev,
      [groupId]: { ...prev[groupId], currentValue: value, error: '' },
    }))
  }

  const saveGroupChange = async (group: CampaignAssessmentGroup): Promise<SaveResult> => {
    try {
      const { response } = await updateGroup(
        campaignId,
        group.id,
        { name: groupStates[group.id].currentValue.trim() },
        editingLocale,
      )

      return {
        ok: true,
        groupId: group.id,
        response,
      }
    } catch (error) {
      return {
        ok: false,
        groupId: group.id,
        error,
      }
    }
  }

  const applySaveErrors = (failures: SaveFailure[]) => {
    setGroupStates((prev) => {
      const next = { ...prev }

      failures.forEach((failure) => {
        const errorMsg = failure.error instanceof Error
          ? failure.error.message
          : I18n.t('errors.something_went_wrong')

        next[failure.groupId] = {
          ...next[failure.groupId],
          error: errorMsg,
        }
      })

      return next
    })
  }

  const handleSave = async () => {
    if (isSavingRef.current || !changedGroups.length) return

    isSavingRef.current = true

    try {
      const results = await Promise.all(
        changedGroups.map(saveGroupChange),
      )

      const failures = results.filter((result): result is SaveFailure => !result.ok)

      if (failures.length) {
        applySaveErrors(failures)
        return
      }

      const successes = results as SaveSuccess[]
      onSaveSuccess(successes.map(result => result.response))
    } catch {
      onSaveError()
    } finally {
      isSavingRef.current = false
    }
  }

  return {
    editingLocale,
    referenceLocale,
    sortedGroups,
    groupStates,
    availableNameLocales,
    isLoading,
    hasChanges: changedGroups.length > 0,
    handleEditingLocaleChange,
    handleReferenceLocaleChange,
    handleNameChange,
    handleSave,
  }
}
