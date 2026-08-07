import React from 'react'
import { Form, Input } from 'antd'
import ResourceFormModal from '~/components/ResourceFormModal'
import { ApplicationUrlWhitelistEntry } from '~/modules/admin/modules/client/core/applicationUrlWhitelistEntries'
import { useResourceContext } from '~/modules/admin/components/Resource'

const { I18n } = window

// Supports wildcard patterns e.g. https://example.com/*, https://*.example.com/api/*
// eslint-disable-next-line max-len
const URL_PATTERN = /^https?:\/\/(\*\.)?([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}(:\d{1,5})?((\/[a-zA-Z0-9\-._~:@!$&'()+,;=%*]*)*)\/?$/

interface Props {
  entry: ApplicationUrlWhitelistEntry
  close(): void
}

export const EditUrlWhiteListModal: React.FC<Props> = ({ entry, close }) => {
  const { resource } = useResourceContext<ApplicationUrlWhitelistEntry>()
  const [form] = Form.useForm()

  return (
    <ResourceFormModal
      resourceName="application_url_whitelist_entry"
      readableResourceName={I18n.t('admin.application_settings_url')}
      resource={entry}
      showSuccessMessages
      close={close}
      storeManager={{ form }}
      scrollToFirstError
      modalProps={{ width: 520 }}
      request={{ updateResource: resource.updateResource }}
    >
      {() => (
        <>
          <Form.Item
            name="url"
            label={I18n.t('admin.application_settings_url')}
            rules={[
              { required: true, message: I18n.t('admin.application_settings_url_required') },
              {
                pattern: URL_PATTERN,
                message: I18n.t('admin.application_settings_invalid_url_format'),
              },
            ]}
          >
            <Input placeholder={I18n.t('admin.application_settings_url_input_placeholder')} />
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
        </>
      )}
    </ResourceFormModal>
  )
}
