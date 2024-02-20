import * as t from 'io-ts'
import React, { useState, useEffect } from 'react'
import {
  Button, Col, Row, Select, Input, Form, Divider, Alert as AntAlert, App,
} from 'antd'
import { MemberAction } from 'hooks/useResources/interfaces'
import { Assessment, AssessmentTR } from '~/modules/admin/modules/client/core/assessments'
import styles from './Translations.less'

interface Props {
  assessment: Assessment
  memberAction: MemberAction
}

const { I18n } = window

const FetchTransactionResponseTR = t.type({
  locale: t.string,
  name: t.union([t.string, t.null]),
  description: t.union([t.string, t.null]),
  timing: t.union([t.string, t.null]),
})

export type FetchTransactionResponse = t.TypeOf<typeof FetchTransactionResponseTR>
export type FormState = FetchTransactionResponse

const { TextArea } = Input

const DEFAULT_BASE_LOCALE = 'en'

export const Translations: React.FC<Props> = ({ assessment, memberAction }) => {
  const { availableLocales } = I18n
  const [isLoading, setIsLoading] = useState(false)
  const [refLocale, setRefLocale] = useState('')
  const [baseLocale, setBaseLocale] = useState('en')
  const [translations, setTranslations] = useState({})
  const { message } = App.useApp()

  const fetchTranslations = (locale: string) => memberAction({
    id: assessment.id,
    action: 'fetch_translations',
    body: {
      locale,
    },
    method: 'get',
    responseType: FetchTransactionResponseTR,
  }).then((response: FetchTransactionResponse) => {
    setTranslations(state => ({ ...state, [response.locale]: response }))
    return response
  })

  const updateTranslations = (body: FormState) => memberAction({
    id: assessment.id,
    action: 'update_translations',
    body,
    method: 'post',
    responseType: AssessmentTR,
  })

  useEffect(() => {
    updateBaseLocale(DEFAULT_BASE_LOCALE)
  }, [])

  const [form] = Form.useForm<FormState>()

  const updateRefLocale = (value: string) => {
    fetchTranslations(value)
    setRefLocale(value)
  }

  const updateBaseLocale = (value: string) => {
    fetchTranslations(value).then((response) => {
      form.setFieldsValue(response)
    })
    setBaseLocale(value)
  }

  const onFinish = () => {
    updateTranslations(form.getFieldsValue()).then(() => {
      setIsLoading(false)
      message.success(I18n.t('assessments.actions.translations.success_message'))
    })
    setIsLoading(true)
  }

  return (
    <Form layout="vertical" form={form} onFinish={onFinish}>
      <Row>
        <Col span={24}>
          <div className="display-flex justify-content-space-between mt8">
            <Select defaultValue={baseLocale} className="mb8 width90px" onChange={updateBaseLocale}>
              {availableLocales.map(locale => (
                <Select.Option key={locale} value={locale}>
                  {I18n.t(`languages.${locale}`)}
                </Select.Option>
              ))}
            </Select>
            <div>
              <span className="mr8">{I18n.t('common.text.reference_language')}</span>
              <Select
                className="mb8 width90px"
                placeholder={I18n.t('select')}
                onChange={updateRefLocale}
                defaultValue={refLocale}
              >
                <Select.Option value="">
                  {I18n.t('common.text.none')}
                </Select.Option>
                {availableLocales.map(locale => (
                  <Select.Option key={locale} value={locale}>{I18n.t(`languages.${locale}`)}</Select.Option>
                ))}
              </Select>
            </div>
          </div>
        </Col>
        <Divider />
        <Col span={24}>
          <Form.Item
            name="locale"
            initialValue={DEFAULT_BASE_LOCALE}
            className="hidden"
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="name"
            label={I18n.t('common.column.name')}
          >
            <Input />
          </Form.Item>
          {refLocale && translations[refLocale] && <Alert message={translations[refLocale].name} />}
          <Divider />
          <Form.Item
            name="description"
            label={I18n.t('common.column.description')}
          >
            <TextArea />
          </Form.Item>
          {refLocale && translations[refLocale] && <Alert message={translations[refLocale].description} />}
          <Divider />
          <Form.Item name="timing" label={I18n.t('common.column.timing')}>
            <TextArea />
          </Form.Item>
          {refLocale && translations[refLocale] && <Alert message={translations[refLocale].timing} />}
        </Col>
        <Col span={24}>
          <Button type="primary" htmlType="submit" className="mt-8" loading={isLoading}>
            {I18n.t('assessments.update')}
          </Button>
        </Col>
      </Row>
    </Form>
  )
}

const Alert = ({ message }) => <AntAlert message={<div className={styles.alert}>{message}</div>} type="info" />
