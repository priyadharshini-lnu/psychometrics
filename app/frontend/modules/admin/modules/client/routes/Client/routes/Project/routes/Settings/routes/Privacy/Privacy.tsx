import React, { useEffect, useState } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import {
  Row, Col, Form, Checkbox, Input, Select, Button, InputNumber,
  Skeleton,
} from 'antd'
import _ from 'lodash'
import { useParams } from 'react-router-dom'
import { getFeatures } from '~/core/config'
import { RootState } from '~/modules/admin/core/rootReducers'
import { useResources } from '~/hooks/useResources'
import ResourceForm from '~/components/ResourceForm'
import Editor from '~/components/Editor'
import InputDuration from '~/components/InputDuration'
import {
  ProjectPrivacySettings as PrivacySettingsType, ProjectPrivacySettingsTR,
} from '~/modules/admin/modules/client/projectPrivacySettings'
import { durationValidator } from '~/components/DurationValidator'

const { I18n } = window
const { TextArea } = Input

const mapState = (state: RootState) => ({
  features: getFeatures(state),
})

const connector = connect(mapState)

type PropsFromRedux = ConnectedProps<typeof connector>

const PrivacyComponent: React.FC<PropsFromRedux> = ({ features }) => {
  const { projectId } = useParams() as { projectId: string }
  const [form] = Form.useForm()
  const [customPrivacyConsentTexts, setCustomPrivacyConsentTexts] = useState<{
    locale: string, text: string | null
  }[]>([])
  const [customPrivacyAcknowledgmentTexts, setCustomPrivacyAcknowledgmentTexts] = useState<{
    locale: string, text: string | null
  }[]>([])
  const [selectedLocale, setSelectedLocale] = useState('en')

  const enablePrivacyLink = Form.useWatch('enablePrivacyLink', form)
  const enableCustomPolicy = Form.useWatch('customPrivacyConsent', form)
  const allowVideoCallRecording = Form.useWatch('allowVideoCallRecording', form)

  const MIN_RETENTION_MINUTES = 24 * 60

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
    customPrivacyAcknowledgmentTexts,
  })

  const privacySetting = data[0]

  useEffect(() => {
    fetch()
  }, [projectId])

  useEffect(() => {
    form.setFieldsValue(privacySetting)
    setCustomPrivacyConsentTexts(privacySetting?.customPrivacyConsentTexts)
    setCustomPrivacyAcknowledgmentTexts(privacySetting?.customPrivacyAcknowledgmentTexts)
  }, [privacySetting])

  useEffect(() => {
    if (allowVideoCallRecording) {
      form.setFieldsValue({
        videoCallRecordingExpiryInSeconds: 2592000,
      })
    }
  }, [allowVideoCallRecording])

  const updateSelectedLocale = (locale) => {
    const consentLocaleText = _.find(customPrivacyConsentTexts, { locale })
    if (!consentLocaleText) {
      setCustomPrivacyConsentTexts([...customPrivacyConsentTexts, { locale, text: '' }])
    }
    const acknowledgmentLocaleText = _.find(customPrivacyAcknowledgmentTexts, { locale })
    if (!acknowledgmentLocaleText) {
      setCustomPrivacyAcknowledgmentTexts([...customPrivacyAcknowledgmentTexts, { locale, text: '' }])
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

  const updateCustomAcknowledgmentText = (value, locale) => {
    const updatedTexts = customPrivacyAcknowledgmentTexts.map((acknowledgmentText) => {
      if (acknowledgmentText.locale === locale) {
        return { ...acknowledgmentText, text: value }
      }
      return acknowledgmentText
    })
    setCustomPrivacyAcknowledgmentTexts(updatedTexts)
  }

  const selectedLocaleConsentText = _.find(customPrivacyConsentTexts, { locale: selectedLocale })
  const selectedLocaleAcknowledgmentText = _.find(customPrivacyAcknowledgmentTexts, { locale: selectedLocale })

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
                  {I18n.t('admin.dp_consent')}
                </Checkbox>
              </Form.Item>
              <Form.Item name="customPrivacyConsent" valuePropName="checked">
                <Checkbox>
                  {I18n.t('admin.dp_consent_custom')}
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
                  <Col span={24} className="mbl">
                    <Form.Item
                      label={I18n.t('shared.custom_acknowledgment_text')}
                      layout="vertical"
                    >
                      <TextArea
                        key={`ack-${selectedLocaleAcknowledgmentText?.locale}`}
                        value={selectedLocaleAcknowledgmentText?.text || ''}
                        onChange={e => updateCustomAcknowledgmentText(e.target.value, selectedLocale)}
                        rows={3}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item
                      name="customPrivacyPolicyVersion"
                      label={I18n.t('admin.dp_consent_version')}
                      rules={[
                        { required: true },
                        {
                          pattern: new RegExp(/^[0-9]+$/),
                          message: I18n.t('admin.errors_policy_version_format'),
                        },
                      ]}
                    >
                      <InputNumber min={1} step={1} />
                    </Form.Item>
                  </Col>
                </Row>
              )}
              <Form.Item name="disableDataProcessing" valuePropName="checked">
                <Checkbox>
                  {I18n.t('admin.disable_dp')}
                </Checkbox>
              </Form.Item>
              <Form.Item name="enablePrivacyLink" valuePropName="checked">
                <Checkbox>
                  {I18n.t('admin.privacy_link')}
                </Checkbox>
              </Form.Item>
              <Form.Item
                name="privacyLinkText"
                label={I18n.t('admin.privacy_text')}
                hidden={!enablePrivacyLink}
              >
                <Input
                  placeholder={
                    I18n.t('admin.privacy_text_placeholder')
                  }
                />
              </Form.Item>
              <Form.Item
                name="privacyLinkUrl"
                label={I18n.t('admin.privacy_link_label')}
                hidden={!enablePrivacyLink}
              >
                <Input
                  placeholder={
                    I18n.t('admin.privacy_link_placeholder')
                  }
                />
              </Form.Item>
              <Form.Item
                valuePropName="checked"
                name="maskIdentityForPearson"
                labelAlign="left"
              >
                <Checkbox>{I18n.t('admin.mask_identity_for_pearson')}</Checkbox>
              </Form.Item>
              <Form.Item
                valuePropName="checked"
                name="maskIdentityForSaville"
              >
                <Checkbox>{I18n.t('admin.mask_identity_for_saville')}</Checkbox>
              </Form.Item>
              <Form.Item
                valuePropName="checked"
                name="maskIdentityForHogan"
              >
                <Checkbox>{I18n.t('admin.mask_identity_for_hogan')}</Checkbox>
              </Form.Item>
              <Form.Item
                valuePropName="checked"
                name="maskIdentityForIiht"
              >
                <Checkbox>{I18n.t('admin.mask_identity_for_iiht')}</Checkbox>
              </Form.Item>
              <Form.Item
                valuePropName="checked"
                name="maskIdentityForExamus"
              >
                <Checkbox>{I18n.t('admin.mask_identity_for_examus')}</Checkbox>
              </Form.Item>
              <Form.Item
                valuePropName="checked"
                name="maskIdentityForMettl"
              >
                <Checkbox>{I18n.t('admin.mask_identity_for_mettl')}</Checkbox>
              </Form.Item>
              <Form.Item
                valuePropName="checked"
                name="maskIdentityForSkillvue"
              >
                <Checkbox>{I18n.t('admin.mask_identity_for_skillvue')}</Checkbox>
              </Form.Item>
              <Form.Item
                valuePropName="checked"
                name="maskIdentityForYoodli"
              >
                <Checkbox>{I18n.t('admin.mask_identity_for_yoodli')}</Checkbox>
              </Form.Item>
              <Form.Item
                valuePropName="checked"
                name="maskIdentityForExamus"
              >
                <Checkbox>{I18n.t('admin.mask_identity_for_examus')}</Checkbox>
              </Form.Item>
              <Form.Item
                valuePropName="checked"
                name="maskIdentityForMhs"
              >
                <Checkbox>{I18n.t('admin.mask_identity_for_mhs')}</Checkbox>
              </Form.Item>
              {!features?.disableMeetingRecording && (
                <>
                  <Form.Item
                    name="allowVideoCallRecording"
                    valuePropName="checked"
                  >
                    <Checkbox>
                      {I18n.t('admin.video_call_recording')}
                    </Checkbox>
                  </Form.Item>
                  {allowVideoCallRecording && (
                    <div style={{ marginLeft: 32 }}>
                      <Form.Item
                        name="enableVideoCallRecordingForAllNewCampaigns"
                        valuePropName="checked"
                      >
                        <Checkbox>
                          {I18n.t('admin.video_call_recording_scope')}
                        </Checkbox>
                      </Form.Item>
                      <Form.Item
                        name="videoCallRecordingExpiryInSeconds"
                        label={I18n.t('admin.video_call_recording_expiry_duration')}
                        rules={[
                          {
                            validator: durationValidator({
                              minMinutes: MIN_RETENTION_MINUTES,
                              maxMinutes: Number.MAX_SAFE_INTEGER,
                              minError: I18n.t(
                                'admin.errors_min_retention',
                              ),
                              maxError: '',
                              requiredError: I18n.t('admin.errors_required'),
                            }),
                          },
                        ]}
                      >
                        <InputDuration placeholder={I18n.t('admin.components_input_duration_placeholder')} />
                      </Form.Item>
                    </div>
                  )
                  }
                </>
              )}
              <Button
                type="primary"
                htmlType="submit"
                className="mb-16"
                loading={isLoading(`update@${privacySetting.id}`)}
              >
                {I18n.t('shared.save')}
              </Button>
            </>
          )}
        </ResourceForm>
      </Col>
    </Row>
  )
}

export const Privacy = connector(PrivacyComponent)
