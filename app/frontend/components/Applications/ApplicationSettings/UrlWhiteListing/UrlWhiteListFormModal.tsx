import React, { useState } from 'react'
import {
  App, Button, Form, Input, Modal,
} from 'antd'
import * as t from 'io-ts'
import SpreadSheet from '~/components/SpreadSheet'
import ErrorAlertBox from '~/components/ErrorAlertBox'
import {
  ApplicationUrlWhitelistEntry,
  ApplicationUrlWhitelistEntryTR,
} from '~/modules/admin/modules/client/core/applicationUrlWhitelistEntries'
import { useResourceContext } from '~/modules/admin/components/Resource'

const { I18n } = window

// Supports wildcard patterns e.g. https://example.com/*, https://*.example.com/api/*
// eslint-disable-next-line max-len
const URL_PATTERN = /^https?:\/\/(\*\.)?([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}(:\d{1,5})?((\/[a-zA-Z0-9\-._~:@!$&'()+,;=%*]*)*)\/?$/

interface Props {
  close(): void
}

type QueueForm = {
  url: string
  description?: string
}

type SpreadSheetEntry = {
  url: string
  description: string
}

interface SpreadSheetErrors {
  [key: string]: string[]
}

const BulkCreateUrlWhitelistResponseTR = t.union([
  ApplicationUrlWhitelistEntryTR,
  t.array(ApplicationUrlWhitelistEntryTR),
])

const spreadSheetFields = [
  {
    name: I18n.t('admin.application_settings_url'),
    key: 'url',
  },
  {
    name: I18n.t('shared.description'),
    key: 'description',
  },
]

export const UrlWhiteListFormModal: React.FC<Props> = ({ close }) => {
  const { resource } = useResourceContext<ApplicationUrlWhitelistEntry>()
  const [form] = Form.useForm<QueueForm>()
  const [queuedEntries, setQueuedEntries] = useState<SpreadSheetEntry[]>([])
  const [spreadSheetErrors, setSpreadSheetErrors] = useState<SpreadSheetErrors | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { message } = App.useApp()

  const handleAddToQueue = async () => {
    const values = await form.validateFields()
    const url = values.url.trim()
    const description = values.description?.trim() || ''

    setQueuedEntries(previous => [
      ...previous,
      { url, description },
    ])

    form.resetFields()
  }

  const handleUrlChange = () => {
    form.setFields([{ name: 'url', errors: [] }])
  }

  const handleUpdateEntries = (entries: SpreadSheetEntry[]) => {
    setQueuedEntries(entries)
    setSpreadSheetErrors(null)
  }

  const handleSubmit = async () => {
    const nonEmptyEntries = queuedEntries.filter(entry => entry.url?.trim())

    if (nonEmptyEntries.length === 0) {
      message.error(I18n.t('admin.application_settings_url_required'))
      return
    }

    const invalidEntries = nonEmptyEntries.filter(
      entry => !URL_PATTERN.test(entry.url.trim()),
    )

    if (invalidEntries.length > 0) {
      setSpreadSheetErrors({
        url: invalidEntries.map(entry => (
          `${entry.url} — ${I18n.t('admin.application_settings_invalid_url_format')}`
        )),
      })
      return
    }

    setSpreadSheetErrors(null)
    setIsSubmitting(true)

    try {
      await resource.collectionAction({
        action: 'bulk_create',
        method: 'post',
        responseType: BulkCreateUrlWhitelistResponseTR,
        body: {
          entries: nonEmptyEntries.map(entry => ({
            url: entry.url,
            description: entry.description || null,
          })),
        },
      })

      await resource.fetch()
      close()
    } catch {
      message.error(I18n.t('common.errors.something_wrong'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      open
      title={I18n.t('admin.application_settings_url_addresses')}
      onCancel={close}
      width={900}
      footer={[
        <Button key="cancel" onClick={close}>
          {I18n.t('shared.cancel')}
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={handleSubmit}
          loading={isSubmitting}
        >
          {I18n.t('shared.add')}
        </Button>,
      ]}
    >
      <div style={{ padding: '16px 0' }}>
        <Form form={form} layout="vertical">
          <Form.Item
            name="url"
            label={I18n.t('admin.application_settings_url')}
            validateTrigger={[]}
            rules={[
              { required: true, message: I18n.t('admin.application_settings_url_required') },
              {
                pattern: URL_PATTERN,
                message: I18n.t('admin.application_settings_invalid_url_format'),
              },
            ]}
          >
            <Input
              placeholder={I18n.t('admin.application_settings_url_input_placeholder')}
              onChange={handleUrlChange}
            />
          </Form.Item>

          <Form.Item
            name="description"
            label={I18n.t('shared.description')}
          >
            <Input.TextArea
              rows={3}
              placeholder={I18n.t('admin.application_settings_url_description_placeholder')}
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" onClick={handleAddToQueue}>
              {I18n.t('shared.add')}
            </Button>
          </Form.Item>
        </Form>
        <SpreadSheet
          fields={spreadSheetFields}
          entities={queuedEntries}
          updateEntities={handleUpdateEntries}
          context={{}}
          className=""
        />
        <ErrorAlertBox
          errors={spreadSheetErrors}
          className="mtl mbl"
          scrollToError={false}
          scrollView={null}
        />
      </div>
    </Modal>
  )
}
