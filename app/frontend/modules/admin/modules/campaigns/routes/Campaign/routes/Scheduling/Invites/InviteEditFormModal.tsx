import {
  FC, useState, useEffect, useMemo,
} from 'react'
import {
  Form, Input, Switch, Select,
  Button,
  Collapse,
  Flex,
  Typography,
} from 'antd'
import _ from 'lodash'
import { useSelector } from 'react-redux'
import { RootState } from '~/modules/admin/core/rootReducers'
import ResourceFormModal from '~/components/ResourceFormModal'
import { WorkshopInvite } from '~/modules/admin/modules/campaigns/core/invites'
import { DeleteOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { useResourceContext } from '~/modules/admin/components/Resource'
import { UpdateResource } from '~/hooks/useResources/interfaces'

const { I18n } = window

type Props = {
  close: () => void
  workshopInvite: WorkshopInvite
  updateWorkshopInvite?: UpdateResource<WorkshopInvite>
}

type LanguageData = {
  locale: string
  name: string
  title: string
  description: string
}

const createLanguageData = (locale: string, title = '', description = ''): LanguageData => ({
  locale,
  name: I18n.t(`languages.${locale}`),
  title,
  description,
})

const buildInitialLanguages = (workshopInvite: WorkshopInvite): Record<string, LanguageData> => {
  const initialLanguages: Record<string, LanguageData> = {}

  if (workshopInvite.translations?.length > 0) {
    workshopInvite.translations.forEach((translation) => {
      initialLanguages[translation.locale] = createLanguageData(
        translation.locale,
        translation.title || '',
        translation.description || '',
      )
    })
  }

  if (!initialLanguages.en) {
    initialLanguages.en = createLanguageData(
      'en',
      workshopInvite.title || '',
      workshopInvite.description || '',
    )
  }

  if (workshopInvite.allowLanguagePreference && workshopInvite.allowedLanguages) {
    workshopInvite.allowedLanguages.forEach((locale) => {
      if (!initialLanguages[locale]) {
        const existingTranslation = workshopInvite.translations?.find(t => t.locale === locale)
        if (existingTranslation) {
          initialLanguages[locale] = createLanguageData(
            locale,
            existingTranslation.title || '',
            existingTranslation.description || '',
          )
        }
      }
    })
  }

  return initialLanguages
}

export const InviteEditFormModal: FC<Props> = ({
  close,
  workshopInvite,
  updateWorkshopInvite,
}) => {
  const [form] = Form.useForm()
  const availableLocales = useSelector((state: RootState) => state.config.availableLocales)
  const allowedLanguages = Form.useWatch('allowedLanguages', form)
  const [errors] = useState<Record<string, { title: string, description: string }>>({})
  const [selectedLang, setSelectedLang] = useState<string | null>(null)
  const [languages, setLanguages] = useState<Record<string, LanguageData>>(() => buildInitialLanguages(workshopInvite))
  const [activeKey, setActiveKey] = useState<string[]>(() => _.keys(buildInitialLanguages(workshopInvite)))

  const preferredLang = Form.useWatch('allowLanguagePreference', form)

  useEffect(() => {
    form.setFieldValue('translations', _.map(languages, v => v))
  }, [languages, form])

  useEffect(() => {
    if (allowedLanguages && Array.isArray(allowedLanguages)) {
      const currentLanguageCodes = _.keys(languages)
      const languagesToRemove = _.filter(
        currentLanguageCodes,
        langCode => langCode !== 'en' && !allowedLanguages.includes(langCode),
      )

      if (languagesToRemove.length > 0) {
        const newLanguages = { ...languages }
        _.forEach(languagesToRemove, (langCode) => {
          delete newLanguages[langCode]
        })
        setLanguages(newLanguages)
      }
    }
  }, [allowedLanguages, languages])

  const { resource } = useResourceContext<WorkshopInvite>()
  const addLang = () => {
    if (!selectedLang) return

    const existingTranslation = workshopInvite.translations?.find(t => t.locale === selectedLang)
    const locale = selectedLang

    setLanguages({
      ...languages,
      [selectedLang]: createLanguageData(
        locale,
        existingTranslation?.title || '',
        existingTranslation?.description || '',
      ),
    })
    setActiveKey(_.concat(activeKey, selectedLang))
    setSelectedLang(null)
  }

  const removeLang = (langCode: string) => {
    if (langCode === 'en') return
    const newLanguages = { ...languages }
    delete newLanguages[langCode]
    setLanguages(newLanguages)
  }


  const transformValues = (values: Record<string, unknown>) => {
    const allowLanguagePreference = values.allowLanguagePreference as boolean

    let translations: Omit<LanguageData, 'name'>[] = []
    if (allowLanguagePreference) {
      // If language preference is allowed, include all translations
      translations = _.map(languages, v => ({
        locale: v.locale,
        title: v.title,
        description: v.description,
      }))
    } else {
      // If language preference is not allowed, only include English
      const englishLang = languages.en
      translations = englishLang ? [{
        locale: englishLang.locale,
        title: englishLang.title,
        description: englishLang.description,
      }] : []
    }

    return {
      ...values,
      allowedLanguages: allowLanguagePreference ? values.allowedLanguages : [],
      translations,
    }
  }

  const initialFormValues = useMemo(() => ({
    ...workshopInvite,
    translations: _.map(languages, v => v),
  }), [workshopInvite, languages])

  const availableLanguagesForSelection = useMemo(() => allowedLanguages
    ?.filter(lang => !languages[lang])
    .map(lang => ({
      value: lang,
      label: I18n.t(`languages.${lang}`),
    })) || [],
  [allowedLanguages, languages])

  const handleUpdate = async (data: WorkshopInvite) => {
    if (updateWorkshopInvite) {
      return updateWorkshopInvite(data)
    }
    return resource?.updateResource(data)
  }

  return (
    <ResourceFormModal
      resourceName="workshop_invite"
      resourceBaseUrl="workshop_invites"
      resource={initialFormValues}
      readableResourceName="Workshop Invite"
      showSuccessMessages
      close={close}
      storeManager={{ form }}
      scrollToFirstError
      modalProps={{ width: 768 }}
      transformValues={transformValues}
      formProps={{
        initialValues: {
          allowLanguagePreference: workshopInvite.allowLanguagePreference,
          allowedLanguages: workshopInvite.allowedLanguages,
          allowNeurodiversityOption: workshopInvite.allowNeurodiversityOption,
        },
      }}
      request={{
        updateResource: handleUpdate,
      }}
    >
      {() => (
        <Flex vertical gap={8} className="pt-4">
          <Flex vertical gap={16}>
            <Form.Item
              name="name"
              label={I18n.t('shared.name')}
              className="mb-4"
            >
              <Input
                placeholder={I18n.t('admin.invite_name_placeholder')}
              />
            </Form.Item>
            <Form.Item
              name="allowLanguagePreference"
              valuePropName="checked"
              className="mb-0"
              label={I18n.t('admin.invite_basic_info_allow_preferred_language')}
            >
              <Switch />
            </Form.Item>
            {preferredLang && (
              <Form.Item
                name="allowedLanguages"
                label={I18n.t('admin.invite_basic_info_preferred_language')}
                className="mb-0"
              >
                <Select
                  showSearch
                  mode="multiple"
                  optionFilterProp="children"
                  options={availableLocales.map(locale => ({
                    label: I18n.t(`languages.${locale}`),
                    value: locale,
                  })).filter(locale => locale.value !== 'en')}
                />
              </Form.Item>
            )}
            <Form.Item
              name="allowNeurodiversityOption"
              valuePropName="checked"
              className="mb-0"
              label={I18n.t('admin.invite_basic_info_neurodiversity')}
            >
              <Switch />
            </Form.Item>
          </Flex>

          {(() => {
            const collapseItems = _.map(languages, (lang, code) => {
              const index = Object.keys(languages).indexOf(code)
              const canRemove = code !== 'en' && Object.keys(languages).length > 1

              return {
                key: code,
                label: (
                  <Flex justify="space-between" align="center" style={{ width: '100%' }}>
                    <Typography.Title level={5} className="mb-0 mt-0">
                      {I18n.t('admin.invite_send_invites_title',
                        { lang: I18n.t(`languages.${lang.locale}`) })}
                    </Typography.Title>
                    {canRemove && (
                      <Button
                        type="text"
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation()
                          removeLang(code)
                        }}
                        icon={<DeleteOutlined />}
                      />
                    )}
                  </Flex>
                ),
                children: (
                  <Flex vertical gap={8}>
                    <Form.Item
                      label={I18n.t('admin.invite_send_invites_invitation_title')}
                      validateStatus={errors?.[`translations/${index}/title`] ? 'error' : undefined}
                      hasFeedback={!!errors?.[`translations/${index}/title`]}
                      help={errors?.[`translations/${index}/title`]?.title}
                      className="mb-4"
                    >
                      <Input
                        value={lang.title}
                        onChange={e => setLanguages({
                          ...languages,
                          [code]: {
                            ...languages[code],
                            title: e.currentTarget.value,
                          },
                        })}
                      />
                    </Form.Item>

                    <Form.Item
                      label={I18n.t('shared.description')}
                      validateStatus={errors?.[`translations/${index}/description`] ? 'error' : undefined}
                      hasFeedback={!!errors?.[`translations/${index}/description`]}
                      help={errors?.[`translations/${index}/description`]?.title}
                      className="mb-4"
                    >
                      <Input.TextArea
                        value={lang.description}
                        onChange={e => setLanguages({
                          ...languages,
                          [code]: {
                            ...languages[code],
                            description: e.currentTarget.value,
                          },
                        })}
                      />
                    </Form.Item>
                  </Flex>
                ),
              }
            })

            return (
              <Collapse
                defaultActiveKey={_.keys(languages)}
                onChange={setActiveKey}
                activeKey={activeKey}
                bordered
                className="mb-4 mt-4"
                items={collapseItems}
              />
            )
          })()}

          {allowedLanguages?.length > 0 ? (
            <Form.Item
              name="add_lang"
              label={I18n.t('admin.invite_send_invites_input_label')}
            >
              <Flex gap={8} align="center">
                <Select
                  placeholder={I18n.t(
                    'admin.invite_send_invites_input_placeholder',
                  )}
                  options={availableLanguagesForSelection}
                  onChange={setSelectedLang}
                  value={selectedLang}
                />
                <Button type="primary" onClick={addLang}>
                  {I18n.t('shared.add')}
                </Button>
              </Flex>
            </Form.Item>
          ) : null}
        </Flex>
      )}
    </ResourceFormModal>
  )
}
