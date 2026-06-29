import {
  FC, useEffect, useMemo, useState,
} from 'react'
import {
  Col, Row, Form, Input, Radio, Checkbox, Button, Upload, Image, Flex, Card, Space, message,
} from 'antd'
import _ from 'lodash'
import { useParams } from 'react-router-dom'
import { UploadOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { LangDropdown } from '~/components/LangDropdown'
import {
  Idp, IdpTR,
} from '~/modules/admin/modules/client/core/idp'
import { useResources } from '~/hooks/useResources'
import {
  LOGO_TYPE, FIELDS, DEFAULT_PAGE_STYLES,
} from './constants'
import PageFontSettings from './PageFontSettings'

const { I18n } = window

interface AppearanceFormProps {
  idp: Idp,
  fetch: () => void,
}

export const AppearanceForm: FC<AppearanceFormProps> = ({ idp, fetch }) => {
  const { projectId } = useParams() as { projectId: string }
  const [lang, setLang] = useState(I18n.locale)
  const [translations, setTranslations] = useState(idp?.translations || {})
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()
  const background = Form.useWatch('background', form)
  const clientLogo = Form.useWatch('clientLogo', form)
  const allFormValues = Form.useWatch([], form)

  const baseApiConfig = {
    basePath: `projects/${projectId}`,
    trackUrl: true,
    responseType: IdpTR,
    apiConfig: {
      fields: {
        skills: ['id', 'name', 'skill_type', 'project_id'],
      },
      include: ['skills', 'report'],
    },
  }

  const {
    uploadFileAction, memberAction,
  } = useResources<Idp>('idp_templates', baseApiConfig)

  const submit = async () => {
    const values = await form.validateFields()

    const uploadedBackgroundFile = values.background?.file?.status !== 'removed'
      ? values.background?.file?.originFileObj || values.background?.file
      : null
    const uploadedClientLogoFile = values.clientLogo?.file?.status !== 'removed'
      ? values.clientLogo?.file?.originFileObj || values.clientLogo?.file
      : null

    const payload = {
      name: values.name,
      project: { id: projectId, type: 'projects' },
      titleText: values.titleText,
      subtitleText: values.subtitleText,
      logoType: values.logoType,
      fields: values.fields,
      showReflections: values.showReflections,
      translations: translations || {},
      guidelinePosition: values.guidelinePosition,
      showGuidelines: values.showGuidelines,
      flipBackground: values.flipBackground,
      pageStyles: values.pageStyles,
    }

    setLoading(true)
    await memberAction({
      action: 'update_appearance', id: idp.id, method: 'post', body: payload,
    })

    if (values.background || values.clientLogo || values.removeBackground || values.removeClientLogo) {
      const data = new FormData()
      if (uploadedBackgroundFile instanceof Blob) {
        data.append('background', uploadedBackgroundFile)
      }
      if (uploadedClientLogoFile instanceof Blob) {
        data.append('client_logo', uploadedClientLogoFile)
      }
      if (values.removeBackground && !uploadedBackgroundFile) {
        data.append('purge_background', 'true')
      }
      if (values.removeClientLogo && !uploadedClientLogoFile) {
        data.append('purge_client_logo', values.removeClientLogo)
      }

      try {
        await uploadFileAction(`idp_templates/${idp.id}/uploads`, data)
      } catch (e) {
        const errors = e && typeof e === 'object' ? e as Record<string, string[]> : {}
        form.setFields(
          Object.entries(errors).map(([key, messages]) => ({
            name: _.camelCase(key),
            errors: messages,
          })),
        )
        setLoading(false)
        return
      }
      form.setFieldsValue({
        background: null, clientLogo: null, removeBackground: null, removeClientLogo: null,
      })
    }
    message.success(I18n.t('admin.idp_appearance_success'))
    await fetch()
    setLoading(false)
  }

  const changeTitle = (e) => {
    setTranslations({
      ...translations,
      [lang]: {
        ...translations[lang],
        titleText: e.target.value,
      },
    })
  }
  const changeSubtitle = (e) => {
    setTranslations({
      ...translations,
      [lang]: {
        ...translations[lang],
        subtitleText: e.target.value,
      },
    })
  }

  useEffect(() => {
    setTranslations(idp?.translations || {})
  }, [idp])

  useEffect(() => {
    form.setFieldValue('translations', translations)
  }, [translations])

  const initialValues = useMemo(() => ({
    logoType: idp?.logoType || LOGO_TYPE.both,
    titleText: translations[lang]?.titleText || '',
    subtitleText: translations[lang]?.subtitleText || '',
    fields: idp?.fields || [],
    showReflections: idp?.showReflections || false,
    showGuidelines: idp?.showGuidelines ?? true,
    guidelinePosition: idp?.guidelinePosition || 'second',
    flipBackground: idp?.flipBackground || false,
    pageStyles: _.merge({}, DEFAULT_PAGE_STYLES, idp?.pageStyles),
  }), [idp])

  const currentLang = I18n.locale
  const currentTranslation = (translations || {})[currentLang] || {}

  const previewTemplate = useMemo(() => ({
    fields: (allFormValues?.fields as string[]) || idp?.fields || [],
    background: idp?.background || undefined,
    clientLogo: idp?.clientLogo || undefined,
    logoType: (allFormValues?.logoType as string) || idp?.logoType || 'both',
    titleText: (currentTranslation as Record<string, string>)?.titleText || '',
    subtitleText: (currentTranslation as Record<string, string>)?.subtitleText || '',
    guidelinePosition: (allFormValues?.guidelinePosition as string) || idp?.guidelinePosition || 'second',
    flipBackground: (allFormValues?.flipBackground as boolean) || false,
    pageStyles: allFormValues?.pageStyles || idp?.pageStyles || {},
  }), [allFormValues, idp, currentTranslation])

  return (
    <Form form={form} layout="vertical" initialValues={initialValues}>
      <Space orientation="vertical" className="w-100">
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Card title={I18n.t('admin.idp_template_details')}>
              <Form.Item name="logoType" label={I18n.t('admin.idp_logo_type_label')}>
                <Radio.Group>
                  <Flex vertical>
                    {_.map(LOGO_TYPE, (type, key) => (
                      <Radio key={key} value={type}>
                        {I18n.t(`admin.idp_logo_type_${key}`)}
                      </Radio>
                    ))}
                  </Flex>
                </Radio.Group>
              </Form.Item>
              <Card className="p-4" styles={{ body: { padding: 0 } }}>
                <Form.Item
                  name="background"
                  label={I18n.t('admin.idp_background_image')}
                >
                  <Upload
                    listType="picture"
                    maxCount={1}
                    accept=".jpeg, .jpg, .png, .svg, .gif, .bmp, image/jpeg, image/png, image/svg+xml"
                    beforeUpload={() => false}
                    showUploadList={!!background}
                  >
                    <Space orientation="vertical" className="mb-4">
                      <Button icon={<UploadOutlined />}>
                        {I18n.t('shared.upload')}
                      </Button>
                      {idp?.background && <Image className="mt-4" height={100} src={idp?.background} />}
                    </Space>
                  </Upload>
                </Form.Item>
                {idp?.background && (
                  <Form.Item
                    name="removeBackground"
                    valuePropName="checked"
                    noStyle
                  >
                    <Checkbox disabled={!idp?.background}>
                      {I18n.t('shared.remove')}
                    </Checkbox>
                  </Form.Item>
                )}
              </Card>
              <Card className="p-4" styles={{ body: { padding: 0 } }}>
                <Form.Item
                  name="clientLogo"
                  label={I18n.t('admin.idp_logo_image')}
                >
                  <Upload
                    listType="picture"
                    maxCount={1}
                    accept=".jpeg, .jpg, .png, .svg, .gif, .bmp, image/jpeg, image/png, image/svg+xml"
                    beforeUpload={() => false}
                    showUploadList={!!clientLogo}
                  >
                    <Space orientation="vertical" className="mb-4">
                      <Button icon={<UploadOutlined />}>
                        {I18n.t('shared.upload')}
                      </Button>
                      {idp?.clientLogo && <Image className="mt-4" height={100} src={idp?.clientLogo} />}
                    </Space>
                  </Upload>
                </Form.Item>
                {idp?.clientLogo && (
                  <Form.Item
                    name="removeClientLogo"
                    valuePropName="checked"
                    noStyle
                  >
                    <Checkbox disabled={!idp?.clientLogo}>
                      {I18n.t('shared.remove')}
                    </Checkbox>
                  </Form.Item>
                )}
              </Card>

              <Form.Item
                name="flipBackground"
                valuePropName="checked"
                style={{ marginTop: 16 }}
              >
                <Checkbox>
                  {I18n.t('admin.idp_appearance_flip_background')}
                </Checkbox>
              </Form.Item>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card title={I18n.t('admin.idp_appearance_dynamic_content')}>
              <Flex justify="flex-end">
                <LangDropdown
                  currentLocale={lang}
                  locales={I18n.availableLocales}
                  onChange={lang => setLang(lang)}
                  useLoading={false}
                />
              </Flex>
              <Form.Item label={I18n.t('admin.idp_title_text')}>
                <Input onChange={changeTitle} value={translations[lang]?.titleText || ''} />
              </Form.Item>
              <Form.Item label={I18n.t('admin.idp_subtitle_text')}>
                <Input onChange={changeSubtitle} value={translations[lang]?.subtitleText || ''} />
              </Form.Item>

              <Form.Item name="fields" label={I18n.t('admin.idp_fields_label')}>
                <Checkbox.Group>
                  <Row>
                    {FIELDS.map(field => (
                      <Col xs={12} key={field}>
                        <Checkbox value={field}>
                          {I18n.t(`admin.idp_fields_${field}`)}
                        </Checkbox>
                      </Col>
                    ))}
                  </Row>
                </Checkbox.Group>
              </Form.Item>
              <Form.Item name="showReflections" valuePropName="checked">
                <Checkbox>
                  {I18n.t('admin.idp_show_reflections')}
                </Checkbox>
              </Form.Item>

              <Form.Item name="showGuidelines" valuePropName="checked">
                <Checkbox>
                  {I18n.t('admin.idp_appearance_show_guidelines')}
                </Checkbox>
              </Form.Item>

              <Form.Item name="guidelinePosition" label={I18n.t('admin.idp_appearance_guideline_position')}>
                <Radio.Group>
                  <Radio value="second">{I18n.t('admin.idp_appearance_guideline_position_second')}</Radio>
                  <Radio value="second_last">{I18n.t('admin.idp_appearance_guideline_position_second_last')}</Radio>
                </Radio.Group>
              </Form.Item>
            </Card>
          </Col>
        </Row>

        <PageFontSettings form={form} previewTemplate={previewTemplate} />

      </Space>
      <div
        style={{
          position: 'sticky',
          bottom: 0,
          background: '#fff',
          padding: '12px 0',
          zIndex: 10,
          borderTop: '1px solid #f0f0f0',
        }}
      >
        <Button
          key="submit"
          type="primary"
          onClick={submit}
          loading={loading}
        >
          {I18n.t('shared.update')}
        </Button>
      </div>
    </Form>
  )
}

export default AppearanceForm
