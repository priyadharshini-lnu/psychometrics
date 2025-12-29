import {
  FC, useEffect, useMemo, useState,
} from 'react'
import {
  Col, Row, Form, Input, Radio, Checkbox, Button, Upload, Image, Flex, Card, Space, message,
} from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import _ from 'lodash'
import { useParams } from 'react-router-dom'
import { LangDropdown } from '~/components/LangDropdown'
import {
  Idp, IdpTR,
} from '~/modules/admin/modules/client/core/idp'
import { useResources } from '~/hooks/useResources'


const LOGO_TYPE = {
  both: 'both',
  mercer_only: 'mercer_only',
  client_only: 'client_only',
  none: 'none',
}

const FIELDS = [
  'name',
  'current_job_role',
  'target_job_role',
  'assigned_date',
  'division',
  'approval_date',
  'publish_date',
  'completion_date',
]

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

    const payload = {
      name: values.name,
      project: { id: projectId, type: 'projects' },
      titleText: values.titleText,
      subtitleText: values.subtitleText,
      logoType: values.logoType,
      fields: values.fields,
      showReflections: values.showReflections,
      translations: translations || {},
    }

    setLoading(true)
    await memberAction({
      action: 'update_appearance', id: idp.id, method: 'post', body: payload,
    })

    if (values.background || values.clientLogo || values.removeBackground || values.removeClientLogo) {
      const data = new FormData()
      if (values.background && values.background.file) {
        data.append('background', values.background.file)
      }
      if (values.clientLogo && values.clientLogo.file) {
        data.append('client_logo', values.clientLogo.file)
      }
      if (values.removeBackground && !background) {
        data.append('purge_background', 'true')
      }
      if (values.removeClientLogo && !clientLogo) {
        data.append('purge_client_logo', values.removeClientLogo)
      }

      try {
        await uploadFileAction(`idp_templates/${idp.id}/uploads`, data)
        setLoading(false)
      } catch (e) { /* empty */ }
      form.setFieldsValue({
        background: null, clientLogo: null, removeBackground: null, removeClientLogo: null,
      })
    }
    message.success(I18n.t('administration.idp.appearance_success'))
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
  }), [idp])

  return (
    <Form form={form} layout="vertical" initialValues={initialValues}>
      <Space direction="vertical" className="w-100">
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Card title={I18n.t('administration.idp.template_details')}>
              <Form.Item name="logoType" label={I18n.t('administration.idp.logo_type_label')}>
                <Radio.Group>
                  <Flex vertical>
                    {_.map(LOGO_TYPE, (type, key) => (
                      <Radio key={key} value={type}>
                        {I18n.t(`administration.idp.logo_type.${key}`)}
                      </Radio>
                    ))}
                  </Flex>
                </Radio.Group>
              </Form.Item>
              <Card className="p-4" styles={{ body: { padding: 0 } }}>
                <Form.Item
                  name="background"
                  label={I18n.t('administration.idp.background_image')}
                >
                  <Upload
                    listType="picture"
                    maxCount={1}
                    accept=".jpeg, .jpg, .png, .svg, .gif, .bmp, image/jpeg, image/png, image/svg+xml"
                    beforeUpload={() => false}
                    showUploadList={!!background}
                  >
                    <Space direction="vertical" className="mb-4">
                      <Button icon={<UploadOutlined />}>
                        {I18n.t('administration.projects.design_settings.logo_upload')}
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
                      {I18n.t('administration.idp.remove')}
                    </Checkbox>
                  </Form.Item>
                )}
              </Card>
              <Card className="p-4" styles={{ body: { padding: 0 } }}>
                <Form.Item
                  name="clientLogo"
                  label={I18n.t('administration.idp.logo_image')}
                >
                  <Upload
                    listType="picture"
                    maxCount={1}
                    accept=".jpeg, .jpg, .png, .svg, .gif, .bmp, image/jpeg, image/png, image/svg+xml"
                    beforeUpload={() => false}
                    showUploadList={!!clientLogo}
                  >
                    <Space direction="vertical" className="mb-4">
                      <Button icon={<UploadOutlined />}>
                        {I18n.t('administration.projects.design_settings.logo_upload')}
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
                      {I18n.t('administration.idp.remove')}
                    </Checkbox>
                  </Form.Item>
                )}
              </Card>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card title="Dynamic Content">
              <Flex justify="flex-end">
                <LangDropdown
                  currentLocale={lang}
                  locales={I18n.availableLocales}
                  onChange={lang => setLang(lang)}
                  useLoading={false}
                />
              </Flex>
              <Form.Item label={I18n.t('administration.idp.title_text')}>
                <Input onChange={changeTitle} value={translations[lang]?.titleText || ''} />
              </Form.Item>
              <Form.Item label={I18n.t('administration.idp.subtitle_text')}>
                <Input onChange={changeSubtitle} value={translations[lang]?.subtitleText || ''} />
              </Form.Item>

              <Form.Item name="fields" label={I18n.t('administration.idp.fields_label')}>
                <Checkbox.Group>
                  <Row>
                    {FIELDS.map(field => (
                      <Col xs={12} key={field}>
                        <Checkbox value={field}>
                          {I18n.t(`administration.idp.fields.${field}`)}
                        </Checkbox>
                      </Col>
                    ))}
                  </Row>
                </Checkbox.Group>
              </Form.Item>
              <Form.Item name="showReflections" valuePropName="checked">
                <Checkbox>
                  {I18n.t('administration.idp.show_reflections')}
                </Checkbox>
              </Form.Item>
            </Card>
          </Col>
        </Row>
        <Button
          key="submit"
          type="primary"
          onClick={submit}
          loading={loading}
        >
          {I18n.t('common.actions.update')}
        </Button>
      </Space>
    </Form>
  )
}

export default AppearanceForm
