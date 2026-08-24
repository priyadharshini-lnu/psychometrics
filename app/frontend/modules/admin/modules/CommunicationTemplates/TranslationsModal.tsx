import React, { useEffect, useState } from 'react'
import {
  App, Button, Col, Form, Input, Modal, Row, Select,
} from 'antd'
import EmailEditor from '~/components/EmailEditor'
import { useResources } from '~/hooks/useResources'
import { CommunicationTemplateTR, CommunicationTemplate } from './core/communicationTemplates'
import { CommunicationDeliveryTR, CommunicationDelivery } from './core/communicationDeliveries'

const { I18n } = window

type TranslatableResourceName = 'communication_templates' | 'communication_deliveries'
type TranslatableResource = CommunicationTemplate | CommunicationDelivery

interface Props {
  resourceName: TranslatableResourceName
  id: string
  close(): void
}

const responseTypeFor = (resourceName: TranslatableResourceName) => (
  resourceName === 'communication_templates' ? CommunicationTemplateTR : CommunicationDeliveryTR
)

const secondLocaleDefault = (first: string): string => (
  I18n.availableLocales.find((availableLocale: string) => availableLocale !== first) || first
)

interface PaneProps {
  resourceName: TranslatableResourceName
  id: string
  locale: string
  otherLocale: string
  bordered?: boolean
  onLocaleChange(locale: string): void
}

const TranslationPane: React.FC<PaneProps> = ({
  resourceName, id, locale, otherLocale, bordered, onLocaleChange,
}) => {
  const { message } = App.useApp()
  const [form] = Form.useForm()
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const { collectionAction, memberAction } = useResources<TranslatableResource>(resourceName, {
    responseType: responseTypeFor(resourceName),
  })

  const loadLocale = (nextLocale: string) => {
    setLoading(true)
    collectionAction({
      method: 'get',
      action: id,
      apiConfig: { query: { locale: nextLocale } },
    }).then((result) => {
      const loaded = result as unknown as TranslatableResource
      form.setFieldsValue({ subject: loaded.subject || '' })
      setBody(loaded.body || '')
    }).catch(() => {
      message.error(I18n.t('shared.error'))
    }).finally(() => {
      setLoading(false)
    })
  }

  useEffect(() => {
    loadLocale(locale)
  }, [locale])

  const handleBodyChange = (value: string) => {
    setBody(value)
    form.setFieldValue('body', value)
  }

  const handleSave = async () => {
    const values = await form.validateFields()
    setSaving(true)
    memberAction({
      id,
      action: 'update_translation',
      method: 'post',
      body: { subject: values.subject, body: values.body, locale },
    }).then(() => {
      message.success(I18n.t('admin.communication_center_translation_updated_success'))
    }).catch(() => {
      message.error(I18n.t('shared.error'))
    }).finally(() => {
      setSaving(false)
    })
  }

  return (
    <div style={bordered ? { borderLeft: '1px solid #f0f0f0', paddingLeft: 24 } : undefined}>
      <Form form={form} layout="vertical">
        <Form.Item label={I18n.t('admin.idp_locales')}>
          <Select
            style={{ width: 200 }}
            value={locale}
            loading={loading}
            onChange={onLocaleChange}
            options={I18n.availableLocales.map((availableLocale: string) => ({
              value: availableLocale,
              label: I18n.t(`languages.${availableLocale}`),
              disabled: availableLocale === otherLocale,
            }))}
          />
        </Form.Item>
        <Form.Item
          name="subject"
          label={I18n.t('admin.communication_template_subject_label')}
          rules={[{ required: true }]}
        >
          <Input disabled={loading} />
        </Form.Item>
        <Form.Item
          name="body"
          label={I18n.t('admin.communication_template_body_label')}
          rules={[{ required: true }]}
        >
          <EmailEditor content={body} handleContentChange={handleBodyChange} withPipedText />
        </Form.Item>
        <Button type="primary" onClick={handleSave} loading={saving} disabled={loading}>
          {I18n.t('shared.save')}
        </Button>
      </Form>
    </div>
  )
}

export const TranslationsModal: React.FC<Props> = ({ resourceName, id, close }) => {
  const [leftLocale, setLeftLocale] = useState<string>(I18n.currentLocale() || 'en')
  const [rightLocale, setRightLocale] = useState<string>(secondLocaleDefault(leftLocale))

  return (
    <Modal
      open
      title={I18n.t('admin.communication_center_translations_modal_title')}
      onCancel={close}
      footer={null}
      width={1200}
      maskClosable={false}
    >
      <Row gutter={32}>
        <Col span={12}>
          <TranslationPane
            resourceName={resourceName}
            id={id}
            locale={leftLocale}
            otherLocale={rightLocale}
            onLocaleChange={setLeftLocale}
          />
        </Col>
        <Col span={12}>
          <TranslationPane
            resourceName={resourceName}
            id={id}
            locale={rightLocale}
            otherLocale={leftLocale}
            bordered
            onLocaleChange={setRightLocale}
          />
        </Col>
      </Row>
    </Modal>
  )
}

export default TranslationsModal
