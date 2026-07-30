import React, { useState } from 'react'
import {
  App, Button, Form, Input, Modal,
} from 'antd'
import * as t from 'io-ts'
import SpreadSheet from '~/components/SpreadSheet'
import ErrorAlertBox from '~/components/ErrorAlertBox'
import {
  ApplicationIpWhitelistEntry,
  ApplicationIpWhitelistEntryTR,
} from '~/modules/admin/modules/client/core/applicationIpWhitelistEntries'
import { useResourceContext } from '~/modules/admin/components/Resource'

const { I18n } = window

// IP and CIDR validation regex (IPv4 and IPv6)
// eslint-disable-next-line max-len
const IP_CIDR_PATTERN = /^((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])){3}(\/(3[0-2]|[1-2][0-9]|[0-9]))?|(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:(:[0-9a-fA-F]{1,4}){1,6}|:(:[0-9a-fA-F]{1,4}){1,7}|::)(\/(12[0-8]|1[01][0-9]|[1-9][0-9]|[0-9]))?)$/

interface Props {
  close(): void
}

type QueueForm = {
  ipOrCidr: string
  description?: string
}

type SpreadSheetEntry = {
  ipOrCidr: string
  description: string
}

interface SpreadSheetErrors {
  [key: string]: string[]
}

const BulkCreateIpWhitelistResponseTR = t.union([
  ApplicationIpWhitelistEntryTR,
  t.array(ApplicationIpWhitelistEntryTR),
])

const spreadSheetFields = [
  {
    name: I18n.t('admin.application_settings_ip_or_cidr'),
    key: 'ipOrCidr',
  },
  {
    name: I18n.t('shared.description'),
    key: 'description',
  },
]

export const IpWhiteListFormModal: React.FC<Props> = ({ close }) => {
  const { resource } = useResourceContext<ApplicationIpWhitelistEntry>()
  const [form] = Form.useForm<QueueForm>()
  const [queuedEntries, setQueuedEntries] = useState<SpreadSheetEntry[]>([])
  const [spreadSheetErrors, setSpreadSheetErrors] = useState<SpreadSheetErrors | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { message } = App.useApp()

  const handleAddToQueue = async () => {
    const values = await form.validateFields()
    const ipOrCidr = values.ipOrCidr.trim()
    const description = values.description?.trim() || ''

    setQueuedEntries(previous => [
      ...previous,
      { ipOrCidr, description },
    ])

    form.resetFields()
  }

  const handleIpOrCidrChange = () => {
    form.setFields([{ name: 'ipOrCidr', errors: [] }])
  }

  const handleUpdateEntries = (entries: SpreadSheetEntry[]) => {
    setQueuedEntries(entries)
    setSpreadSheetErrors(null)
  }

  const handleSubmit = async () => {
    const nonEmptyEntries = queuedEntries.filter(entry => entry.ipOrCidr?.trim())

    if (nonEmptyEntries.length === 0) {
      message.error(I18n.t('admin.application_settings_ip_required'))
      return
    }

    const invalidEntries = nonEmptyEntries.filter(
      entry => !IP_CIDR_PATTERN.test(entry.ipOrCidr.trim()),
    )

    if (invalidEntries.length > 0) {
      setSpreadSheetErrors({
        ipOrCidr: invalidEntries.map(entry => (
          `${entry.ipOrCidr} — ${I18n.t('admin.application_settings_invalid_ip_format')}`
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
        responseType: BulkCreateIpWhitelistResponseTR,
        body: {
          entries: nonEmptyEntries.map(entry => ({
            ipOrCidr: entry.ipOrCidr,
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
      title={I18n.t('admin.application_settings_ip_addresses')}
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
            name="ipOrCidr"
            label={I18n.t('admin.application_settings_ip_or_cidr')}
            validateTrigger={[]}
            rules={[
              { required: true, message: I18n.t('admin.application_settings_ip_required') },
              {
                pattern: IP_CIDR_PATTERN,
                message: I18n.t('admin.application_settings_invalid_ip_format'),
              },
            ]}
          >
            <Input
              placeholder={I18n.t('admin.application_settings_ip_input_placeholder')}
              onChange={handleIpOrCidrChange}
            />
          </Form.Item>

          <Form.Item
            name="description"
            label={I18n.t('shared.description')}
          >
            <Input.TextArea
              rows={3}
              placeholder={I18n.t('admin.application_settings_ip_description_placeholder')}
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
