import React, { useEffect, useState } from 'react'
import {
  Row, Col, Form, Checkbox, Input, Select, Button, InputNumber,
  Skeleton,
} from 'antd'
import _ from 'lodash'
import { useParams } from 'react-router-dom'
import { useResources } from '~/hooks/useResources'
import ResourceForm from '~/components/ResourceForm'
import Editor from '~/components/Editor'
import {
  ProjectPrivacySettings as PrivacySettingsType, ProjectPrivacySettingsTR,
} from '~/modules/admin/modules/client/projectPrivacySettings'

const { I18n } = window

export const Privacy: React.FC = () => {
  const { projectId } = useParams() as { projectId: string }
  const [form] = Form.useForm()
  const [customPrivacyConsentTexts, setCustomPrivacyConsentTexts] = useState<{
    locale: string, text: string | null
  }[]>([])
  const [selectedLocale, setSelectedLocale] = useState('en')

  const enablePrivacyLink = Form.useWatch('enablePrivacyLink', form)
  const enableCustomPolicy = Form.useWatch('customPrivacyConsent', form)

  const {
    data, fetch, updateResource, isLoading,
  } = useResources<PrivacySettingsType>(
    'privacy_settings',
    {
      basePath: `projects/${projectId}`,
      trackUrl: true,
      apiConfig: {
        filter: { project_id_eq: projectId },
      },
      responseType: ProjectPrivacySettingsTR,
    },
  )

  const transformValues = values => ({
    ...values,
    customPrivacyConsentTexts,
  })

  const privacySetting = data[0]

  useEffect(() => {
    fetch()
  }, [projectId])

  useEffect(() => {
    form.setFieldsValue(privacySetting)
    setCustomPrivacyConsentTexts(privacySetting?.customPrivacyConsentTexts)
  }, [privacySetting])

  const updateSelectedLocale = (locale) => {
    const consentLocaleText = _.find(customPrivacyConsentTexts, { locale })
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

  const selectedLocaleConsentText = _.find(customPrivacyConsentTexts, { locale: selectedLocale })

  const localesForConsent = customPrivacyConsentTexts?.length ? customPrivacyConsentTexts : [{ locale: 'en' }]

  if (!privacySetting) return <Skeleton active />

  return (
    <Row justify="space-between" className="pl">
      <Col sm={24} md={16} xl={12} xxl={10}>
        <ResourceForm
          resourceName="privacy_settings"
          readableResourceName="Privacy Settings"
          resource={privacySetting}
          showSuccessMessages
          storeManager={{ form }}
          formProps={{
            labelAlign: 'left',
            id: 'privacy-settings-form',
            preserve: false,
            layout: 'horizontal',
          }}
          request={{
            updateResource,
          }}
          transformValues={transformValues}
        >
          {() => (
            <>
              <Form.Item name="privacyConsent" valuePropName="checked">
                <Checkbox>
                  {I18n.t('administration.projects.privacy_settings.dp_consent')}
                </Checkbox>
              </Form.Item>
              <Form.Item name="customPrivacyConsent" valuePropName="checked">
                <Checkbox>
                  {I18n.t('administration.projects.privacy_settings.dp_consent_custom')}
                </Checkbox>
              </Form.Item>
              {enableCustomPolicy && (
                <Row>
                  <Col span={24}>
                    <Select
                      defaultValue="en"
                      className="mb8 width150px"
                      onChange={value => updateSelectedLocale(value)}
                    >
                      {localesForConsent.map(({ locale }) => (
                        <Select.Option key={locale} value={locale}>
                          {I18n.t(`languages.${locale}`)}
                        </Select.Option>
                      ))}
                    </Select>
                  </Col>
                  <Col span={24} className="mbl">
                    <Editor
                      key={selectedLocaleConsentText?.locale}
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
                      label={I18n.t('administration.projects.privacy_settings.dp_consent_version')}
                      rules={[
                        { required: true },
                        {
                          pattern: new RegExp(/^[0-9]+$/),
                          message: I18n.t('administration.projects.privacy_settings.errors.policy_version_format'),
                        },
                      ]}
                    >
                      <InputNumber min={1} step={1} />
                    </Form.Item>
                  </Col>
                </Row>
              )}
              <Form.Item name="enablePrivacyLink" valuePropName="checked">
                <Checkbox>
                  {I18n.t('administration.projects.privacy_settings.privacy_link')}
                </Checkbox>
              </Form.Item>
              <Form.Item
                name="privacyLinkText"
                label={I18n.t('administration.projects.privacy_settings.privacy_text')}
                hidden={!enablePrivacyLink}
              >
                <Input
                  placeholder={
                    I18n.t('administration.projects.privacy_settings.privacy_text_placeholder')
                  }
                />
              </Form.Item>
              <Form.Item
                name="privacyLinkUrl"
                label={I18n.t('administration.projects.privacy_settings.privacy_link_label')}
                hidden={!enablePrivacyLink}
              >
                <Input
                  placeholder={
                    I18n.t('administration.projects.privacy_settings.privacy_link_placeholder')
                  }
                />
              </Form.Item>
              <Form.Item
                valuePropName="checked"
                name="maskIdentityForPearson"
                labelAlign="left"
              >
                <Checkbox>{I18n.t('administration.projects.privacy_settings.mask_identity_for_pearson')}</Checkbox>
              </Form.Item>
              <Form.Item
                valuePropName="checked"
                name="maskIdentityForSaville"
              >
                <Checkbox>{I18n.t('administration.projects.privacy_settings.mask_identity_for_saville')}</Checkbox>
              </Form.Item>
              <Form.Item
                valuePropName="checked"
                name="maskIdentityForHogan"
              >
                <Checkbox>{I18n.t('administration.projects.privacy_settings.mask_identity_for_hogan')}</Checkbox>
              </Form.Item>
              <Form.Item
                valuePropName="checked"
                name="maskIdentityForIiht"
              >
                <Checkbox>{I18n.t('administration.projects.privacy_settings.mask_identity_for_iiht')}</Checkbox>
              </Form.Item>
              <Form.Item
                valuePropName="checked"
                name="maskIdentityForExamus"
              >
                <Checkbox>{I18n.t('administration.projects.privacy_settings.mask_identity_for_examus')}</Checkbox>
              </Form.Item>
              <Form.Item
                valuePropName="checked"
                name="maskIdentityForMettl"
              >
                <Checkbox>{I18n.t('administration.projects.privacy_settings.mask_identity_for_mettl')}</Checkbox>
              </Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="mb-16"
                loading={isLoading(`update@${privacySetting.id}`)}
              >
                {I18n.t('administration.save')}
              </Button>
            </>
          )}
        </ResourceForm>
      </Col>
    </Row>
  )
}
