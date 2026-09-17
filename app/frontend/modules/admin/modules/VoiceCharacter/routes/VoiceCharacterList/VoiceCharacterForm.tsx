import React, { useEffect, useMemo, useState } from 'react'
import {
  Form, Input, Button, Flex, Spin, Card, Typography, useApp,
} from '@thetalententerprise/glint'
import { Select } from 'antd'
import { Campaign } from '@thetalententerprise/glint/icons'
import { useNavigate } from 'react-router-dom'
import { isSuperAdmin } from '~/core/currentUser'
import { useCurrentUser } from '~/hooks/useCurrentUser'
import { useResources } from '~/hooks/useResources'
import { Client } from '~/modules/admin/modules/client/core/clients'
import { RATE_OPTIONS, PITCH_OPTIONS } from '../../core/constants'
import { VoiceCharacter, AzureVoice } from '../../core/voiceCharacter'

type Props = {
  voiceCharacter?: VoiceCharacter
}

const { I18n } = window

const VoiceCharacterForm: React.FC<Props> = ({ voiceCharacter }: Props) => {
  const config = {
    basePath: '/ai',
  }
  const resource = useResources<VoiceCharacter>('voice_characters', config)
  const [form] = Form.useForm()
  const { message } = useApp()
  const navigate = useNavigate()
  const { currentUser } = useCurrentUser()

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [voices, setVoices] = useState<AzureVoice[]>([])
  const [voicesLoading, setVoicesLoading] = useState<boolean>(false)
  const [previewText, setPreviewText] = useState<string>(I18n.t('admin.tts_sample_text'))
  const [previewLoading, setPreviewLoading] = useState<boolean>(false)
  const [audioUrl, setAudioUrl] = useState<string>('')

  const {
    data: clients, fetch: fetchClients, isLoading: isClientsLoading,
  } = useResources<Client>('clients')

  const selectedLocale = Form.useWatch('locale', form)
  const selectedVoiceId = Form.useWatch('externalVoiceId', form)

  useEffect(() => {
    setVoicesLoading(true)
    resource.collectionAction({ action: 'voices', method: 'get' })
      .then((response: { attributes: { voices: AzureVoice[] } }) => {
        setVoices(response.attributes.voices || [])
      })
      .catch(() => message.error(I18n.t('admin.tts_voices_load_failed')))
      .finally(() => setVoicesLoading(false))
  }, [])

  const localeOptions = useMemo(() => {
    const locales = [...new Set(voices.map(voice => voice.locale))].sort()
    return locales.map(locale => ({
      value: locale,
      label: voices.find(voice => voice.locale === locale)?.localeName || locale,
    }))
  }, [voices])

  const voiceOptions = useMemo(() => voices
    .filter(voice => !selectedLocale || voice.locale === selectedLocale)
    .map(voice => ({ value: voice.externalVoiceId, label: voice.displayName })), [voices, selectedLocale])

  const styleOptions = useMemo(() => {
    const styles = voices.find(voice => voice.externalVoiceId === selectedVoiceId)?.styles || []
    return styles.map(style => ({ value: style, label: style }))
  }, [voices, selectedVoiceId])

  const getClientOptions = () => {
    const options = clients.map(({ id, name }) => ({ label: name, value: id as string | null }))
    if (isSuperAdmin(currentUser)) {
      options.unshift({ label: I18n.t('admin.platform_owner'), value: null })
    }
    return options
  }

  const handlePreview = () => {
    if (!selectedVoiceId) {
      message.warning(I18n.t('admin.tts_voice_required'))
      return
    }
    setPreviewLoading(true)
    setAudioUrl('')
    resource.collectionAction({
      action: 'preview',
      method: 'post',
      body: {
        externalVoiceId: selectedVoiceId,
        locale: form.getFieldValue('locale'),
        style: form.getFieldValue('style'),
        rate: form.getFieldValue('rate'),
        pitch: form.getFieldValue('pitch'),
        text: previewText,
      },
    })
      .then((response: { attributes: { audio: string } }) => setAudioUrl(response.attributes.audio))
      .catch(() => message.error(I18n.t('admin.tts_preview_failed')))
      .finally(() => setPreviewLoading(false))
  }

  const submitForm = () => {
    setIsLoading(true)
    const {
      tenantId, rate, pitch, ...attributes
    } = form.getFieldsValue()
    const data = {
      ...attributes,
      rate: rate === 'medium' ? null : rate,
      pitch: pitch === 'medium' ? null : pitch,
      tenant: tenantId ? { id: tenantId } : null,
    }

    const request = voiceCharacter?.id
      ? resource.updateResource({ id: voiceCharacter.id, ...data })
      : resource.createResource(data)

    request
      .then(() => {
        message.success(voiceCharacter?.id
          ? I18n.t('admin.voice_character_updated_successfully')
          : I18n.t('admin.voice_character_created_successfully'))
        navigate('/admin/ai_voice_characters')
      })
      .catch(() => message.error(I18n.t('admin.something_went_wrong')))
      .finally(() => setIsLoading(false))
  }

  const handleSubmit = () => {
    form.validateFields().then(submitForm).catch(() => null)
  }

  if (isLoading) {
    return <Spin size="large" />
  }

  return (
    <Flex vertical style={{ padding: '24px' }} gap={24}>
      <div style={{ width: '70%' }}>
        <Form
          style={{ width: '100%' }}
          scrollToFirstError
          form={form}
          layout="vertical"
          className="resourceForm"
          initialValues={voiceCharacter ? {
            ...voiceCharacter,
            tenantId: voiceCharacter.tenant?.id || null,
            rate: voiceCharacter.rate || 'medium',
            pitch: voiceCharacter.pitch || 'medium',
          } : { provider: 'azure', rate: 'medium', pitch: 'medium' }}
        >
          <Form.Item name="provider" hidden><Input /></Form.Item>

          <Form.Item name="name" label={I18n.t('shared.name')} rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item
            name="tenantId"
            label={I18n.t('shared.owner')}
            initialValue={voiceCharacter?.tenant?.id || null}
            tooltip={I18n.t('admin.tts_owner_tooltip')}
          >
            <Select
              showSearch
              onSearch={value => fetchClients({
                apiConfig: { filter: { filterable_fields: value }, fields: { clients: ['name'] } },
              })}
              notFoundContent={isClientsLoading('fetch') ? <Spin size="small" /> : null}
              filterOption={false}
              options={getClientOptions()}
            />
          </Form.Item>

          <Form.Item name="locale" label={I18n.t('admin.tts_locale')}>
            <Select
              showSearch
              optionFilterProp="label"
              loading={voicesLoading}
              options={localeOptions}
              onChange={() => form.setFieldsValue({ externalVoiceId: undefined, style: undefined })}
              allowClear
            />
          </Form.Item>

          <Form.Item name="externalVoiceId" label={I18n.t('admin.tts_voice')} rules={[{ required: true }]}>
            <Select
              showSearch
              optionFilterProp="label"
              loading={voicesLoading}
              options={voiceOptions}
              onChange={(value) => {
                const voice = voices.find(candidate => candidate.externalVoiceId === value)
                form.setFieldsValue({ style: undefined, locale: voice?.locale || form.getFieldValue('locale') })
              }}
            />
          </Form.Item>

          <Form.Item name="style" label={I18n.t('admin.tts_style')}>
            <Select options={styleOptions} allowClear disabled={styleOptions.length === 0} />
          </Form.Item>

          <Flex gap={16}>
            <Form.Item name="rate" label={I18n.t('admin.tts_rate')} style={{ flex: 1 }}>
              <Select options={RATE_OPTIONS} allowClear />
            </Form.Item>
            <Form.Item name="pitch" label={I18n.t('admin.tts_pitch')} style={{ flex: 1 }}>
              <Select options={PITCH_OPTIONS} allowClear />
            </Form.Item>
          </Flex>
        </Form>
      </div>

      <Card title={I18n.t('admin.tts_preview')} style={{ width: '70%' }}>
        <Flex vertical gap={12}>
          <Input.TextArea
            rows={2}
            value={previewText}
            onChange={(event) => {
              setPreviewText(event.target.value)
              setAudioUrl('')
            }}
            placeholder={I18n.t('admin.tts_sample_text')}
          />
          <Flex gap={12} align="center">
            <Button
              icon={<Campaign />}
              loading={previewLoading}
              onClick={handlePreview}
            >
              {I18n.t('admin.tts_generate')}
            </Button>
            {audioUrl && (
              <audio controls src={audioUrl} style={{ height: 32 }}>
                <track kind="captions" />
              </audio>
            )}
          </Flex>
          <Typography.Text type="secondary">{I18n.t('admin.tts_preview_hint')}</Typography.Text>
        </Flex>
      </Card>

      <Flex gap={12}>
        <Button type="primary" loading={isLoading} onClick={handleSubmit}>
          {I18n.t('shared.save')}
        </Button>
        <Button onClick={() => navigate('/admin/ai_voice_characters')}>
          {I18n.t('shared.cancel')}
        </Button>
      </Flex>
    </Flex>
  )
}

export default VoiceCharacterForm
