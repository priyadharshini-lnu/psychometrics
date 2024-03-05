import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  Row, Col, Form, Checkbox, Input, Select, Button, InputNumber,
} from 'antd'
import _, { find } from 'lodash'
import {
  ProjectGeneralSettings as GeneralSettingsType,
} from '~/modules/admin/modules/client/core/projectGeneralSettings'
import ResourceForm from '~/components/ResourceForm'
import { useResources } from '~/hooks/useResources/useResources'
import Editor from '~/components/Editor'

const { Option } = Select
const { I18n } = window

export const General: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>()
  const [form] = Form.useForm()
  const [privacyChecked, setPrivacyChecked] = useState(false)
  // eslint-disable-next-line max-len
  const [customPrivacyConsentTexts, setCustomPrivacyConsentTexts] = useState<{ locale: string, text: string | null}[]>([])
  const [enableLiveChatChecked, setEnableLiveChatChecked] = useState(false)
  const [selectedLocale, setSelectedLocale] = useState('en')

  const locales = Form.useWatch('locales', form)
  const enableCustomPolicy = Form.useWatch('customPrivacyConsent', form)

  const {
    data, fetchSingle,
  } = useResources<GeneralSettingsType>('projects')

  const [project] = data

  const { updateResource } = useResources<GeneralSettingsType>(
    'projects',
    {
      basePath: `clients/${project?.clientId}`,
    },
  )

  const transformValues = values => ({
    ...values,
    liveChatToken: values.enableLiveChat ? values.liveChatToken : null,
    customPrivacyConsentTexts,
  })


  useEffect(() => {
    fetchSingle({
      id: projectId,
    })
  }, [projectId])

  useEffect(() => {
    if (project) {
      form.setFieldsValue(project)
      const privacyDetailsPresent = !_.isNull(project.text || project.link)
      setPrivacyChecked(privacyDetailsPresent)
      setEnableLiveChatChecked(project.enableLiveChat)
      setCustomPrivacyConsentTexts(project.customPrivacyConsentTexts)
    }
  }, [project])

  const updateSelectedLocale = (locale) => {
    const consentLocaleText = find(customPrivacyConsentTexts, { locale })
    if (!consentLocaleText) {
      setCustomPrivacyConsentTexts([...customPrivacyConsentTexts, { locale, text: '' }])
    }
    setSelectedLocale(locale)
  }

  const updateCustomConsentText = (value, locale) => {
    const updatedCustomPrivacyConsentTexts = customPrivacyConsentTexts.map((customPrivacyConsentText) => {
      if (customPrivacyConsentText.locale === locale) {
        return {
          ...customPrivacyConsentText,
          text: value,
        }
      }
      return customPrivacyConsentText
    })
    setCustomPrivacyConsentTexts(updatedCustomPrivacyConsentTexts)
  }

  const selectedLocaleConsentText = find(customPrivacyConsentTexts, { locale: selectedLocale })

  const localesForConsent = locales?.length ? locales : ['en']

  return (
    <Row justify="space-between" className="pl">
      <Col sm={24} md={16} xl={12} xxl={10}>
        <ResourceForm
          resourceName="projects"
          resource={project}
          showSuccessMessages
          storeManager={{ form }}
          formProps={{
            labelAlign: 'left',
            id: 'edit_project_general_settings',
            preserve: false,
          }}
          request={{
            updateResource,
          }}
          transformValues={transformValues}
          scrollToFirstError
        >
          {() => (
            <>
              <Form.Item name="name" label={I18n.t('administration.projects.general_settings.name_label')} required>
                <Input name="general_settings_name" />
              </Form.Item>
              <Form.Item name="subdomain" label={I18n.t('administration.projects.general_settings.sub_domain_label')}>
                <Input name="general_settings_subdomain" />
              </Form.Item>
              <Form.Item
                name="number"
                label={I18n.t('administration.projects.general_settings.project_number_label')}
                required
              >
                <Input name="general_settings_number" />
              </Form.Item>

              <Form.Item name="locales" label={I18n.t('administration.projects.general_settings.locales_label')}>
                <Select mode="multiple">
                  <Option value="en">
                    {I18n.t('languages.en')}
                  </Option>
                  <Option value="ar">
                    {I18n.t('languages.ar')}
                  </Option>
                  <Option value="de">
                    {I18n.t('languages.de')}
                  </Option>
                  <Option value="pl">
                    {I18n.t('languages.pl')}
                  </Option>
                </Select>
              </Form.Item>

              <Form.Item name="privacyConsent" valuePropName="checked">
                <Checkbox>
                  {I18n.t('administration.projects.general_settings.dp_consent')}
                </Checkbox>
              </Form.Item>
              <Form.Item name="customPrivacyConsent" valuePropName="checked">
                <Checkbox>
                  {I18n.t('administration.projects.general_settings.dp_consent_custom')}
                </Checkbox>
              </Form.Item>
              {enableCustomPolicy && (
              <Row>
                <Col span={24}>
                  <Select defaultValue="en" className="mb8 width150px" onChange={value => updateSelectedLocale(value)}>
                    {localesForConsent.map(locale => (
                      <Select.Option key={locale} value={locale}>
                        {I18n.t(`languages.${locale}`)}
                      </Select.Option>
                    ))}
                  </Select>
                </Col>
                <Col span={24} className="mbl">
                  <Editor
                    type={null}
                    details={null}
                    className="flex1"
                    content={selectedLocaleConsentText?.text}
                    handleContentChange={(value) => { updateCustomConsentText(value, selectedLocale) }}
                  />
                </Col>
                <Col span={24}>
                  <Form.Item
                    name="customPrivacyPolicyVersion"
                    label={I18n.t('administration.projects.general_settings.dp_consent_version')}
                    rules={[
                      { required: true },
                      {
                        pattern: new RegExp(/^[0-9]+$/),
                        message: I18n.t('administration.projects.general_settings.errors.policy_version_format'),
                      },
                    ]}
                  >
                    <InputNumber min={1} step={1} />
                  </Form.Item>
                </Col>
              </Row>
              )}
              <Form.Item name="enablePrivacyLink" valuePropName="checked">
                <Checkbox
                  checked={privacyChecked}
                  onChange={(e) => {
                    setPrivacyChecked(e.target.checked)
                  }}
                >
                  {I18n.t('administration.projects.general_settings.privacy_link')}
                </Checkbox>
              </Form.Item>
              <Form.Item name="text" label="Privacy Text" hidden={!privacyChecked}>
                <Input />
              </Form.Item>
              <Form.Item name="link" label="Privacy Link" hidden={!privacyChecked}>
                <Input />
              </Form.Item>
              <Form.Item name="enableLiveChat" valuePropName="checked">
                <Checkbox
                  checked={enableLiveChatChecked}
                  onChange={(e) => {
                    setEnableLiveChatChecked(e.target.checked)
                  }}
                >
                  {I18n.t('administration.projects.general_settings.live_chat')}
                </Checkbox>
              </Form.Item>
              <Form.Item name="liveChatToken" label="Live Chat Token" hidden={!enableLiveChatChecked}>
                <Input />
              </Form.Item>
              <Button type="primary" htmlType="submit" className="mb-16">
                {I18n.t('administration.projects.general_settings.save_changes')}
              </Button>
            </>
          )}
        </ResourceForm>
      </Col>
    </Row>
  )
}
