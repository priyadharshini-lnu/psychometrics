import React, { useState, useEffect } from 'react'
import {
  Button, Col, Row, Select, Form, App, Spin,
  InputNumber,
} from 'antd'
import _ from 'lodash'
import { useResources } from '~/hooks/useResources/useResources'
import { Assessment } from '~/modules/admin/modules/client/core/assessments'
import {
  AssessmentConsentSetting,
  AssessmentConsentSettingTR,
} from '~/modules/admin/modules/client/core/assessmentConsentSetting'
import Editor from '~/components/Editor'

interface Props {
  assessment: Assessment
}

interface ValidationError {
  customConsentTexts?: { title: string }
}

const { I18n } = window

export const DataRole: React.FC<Props> = ({ assessment }) => {
  const { availableLocales } = I18n
  const [customConsentTexts, setCustomConsentTexts] = useState<{
      locale: string, text: string | null
    }[]>([])
  const [selectedLocale, setSelectedLocale] = useState('en')
  const [isUpdating, setIsUpdating] = useState(false)
  const { message } = App.useApp()

  const [form] = Form.useForm<AssessmentConsentSetting>()
  const dataRole = Form.useWatch('dataRole', form)

  const {
    fetchSingle: fetchAssessmentConsentSetting,
    updateResource: saveAssessmentConsentSetting,
    isLoading: isAssessmentConsentSettingLoading,
  } = useResources<AssessmentConsentSetting>('assessment_consent_settings', {
    responseType: AssessmentConsentSettingTR,
  })

  useEffect(() => {
    if (assessment?.id) {
      fetchConsentDetails()
    }
  }, [assessment?.id])

  const fetchConsentDetails = async () => {
    if (!assessment?.id) return
    try {
      const response = await fetchAssessmentConsentSetting({ id: assessment.id }) as AssessmentConsentSetting
      form.setFieldsValue(response)
      setCustomConsentTexts(response.customConsentTexts || [])
    } catch (error) {
      console.error('Error fetching consent setting:', error, typeof error)
    }
  }

  const updateSelectedLocale = (locale) => {
    const consentLocaleText = _.find(customConsentTexts, { locale })
    if (!consentLocaleText) {
      setCustomConsentTexts([...customConsentTexts, { locale, text: '' }])
    }
    setSelectedLocale(locale)
  }

  const updateCustomConsentText = (value, locale) => {
    const updatedCustomConsentTexts = customConsentTexts.map((customConsentText) => {
      if (customConsentText.locale === locale) {
        return {
          ...customConsentText,
          text: value,
        }
      }
      return customConsentText
    })
    setCustomConsentTexts(updatedCustomConsentTexts)
  }

  const onFinish = async (values: AssessmentConsentSetting) => {
    setIsUpdating(true)

    const payload = {
      id: assessment.id,
      policyVersion: values.policyVersion,
      dataRole: values.dataRole,
      customConsentTexts,
    }

    try {
      const result = await saveAssessmentConsentSetting(payload)
      form.setFieldsValue(result as AssessmentConsentSetting)
      message.success(I18n.t('shared.updated_successfully'))
    } catch (error: unknown) {
      const validationError = error as ValidationError
      if (validationError?.customConsentTexts?.title) {
        form.setFields([{ name: 'customConsentTexts', errors: [validationError.customConsentTexts.title] }])
      } else {
        message.error(I18n.t('shared.update_failed'))
      }
    } finally {
      setIsUpdating(false)
    }
  }

  const selectedLocaleConsentText = _.find(customConsentTexts, { locale: selectedLocale })

  if (isAssessmentConsentSettingLoading('fetch')) {
    return <Spin />
  }

  return (
    <Form
      layout="vertical"
      form={form}
      onFinish={onFinish}
    >
      <Row>
        <Col span={24}>
          <Form.Item name="dataRole" label={I18n.t('shared.data_role')}>
            <Select>
              <Select.Option value="processor">{I18n.t('shared.processor')}</Select.Option>
              <Select.Option value="controller">{I18n.t('shared.controller')}</Select.Option>
            </Select>
          </Form.Item>
          {dataRole === 'controller' && (
            <Row>
              <Col span={24}>
                <Select
                  defaultValue="en"
                  className="mb8 width150px"
                  onChange={value => updateSelectedLocale(value)}
                >
                  {availableLocales.map(locale => (
                    <Select.Option key={locale} value={locale}>
                      {I18n.t(`languages.${locale}`)}
                    </Select.Option>
                  ))}
                </Select>
              </Col>
              <Col span={24} className="mbl">
                <Form.Item
                  name="customConsentTexts"
                  label={I18n.t('shared.custom_consent_text')}
                  rules={[
                    {
                      validator: () => {
                        const hasConsentText = customConsentTexts.some(text => text.text && text.text.trim())
                        if (!hasConsentText) {
                          return Promise.reject(new Error(I18n.t('shared.custom_consent_text_required')))
                        }
                        return Promise.resolve()
                      },
                    },
                  ]}
                  required
                >
                  <Editor
                    key={selectedLocaleConsentText?.locale}
                    type={null}
                    details={null}
                    className="flex1"
                    content={selectedLocaleConsentText?.text}
                    handleContentChange={(value) => { updateCustomConsentText(value, selectedLocale) }}
                  />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  name="policyVersion"
                  label={I18n.t('shared.policy_version')}
                  rules={[
                    { required: true },
                    {
                      pattern: new RegExp(/^[0-9]+$/),
                      message: I18n.t('shared.policy_version_format'),
                    },
                  ]}
                >
                  <InputNumber min={1} step={1} />
                </Form.Item>
              </Col>
            </Row>
          )}
        </Col>
        <Col span={24}>
          <Button
            type="primary"
            htmlType="submit"
            className="mt8"
            loading={isUpdating}
          >
            {I18n.t('common.actions.update')}
          </Button>
        </Col>
      </Row>
    </Form>
  )
}
