import React from 'react'
import { Form, Input } from 'antd'
import ResourceFormModal from '~/components/ResourceFormModal'
import { ApplicationIpWhitelistEntry } from '~/modules/admin/modules/client/core/applicationIpWhitelistEntries'
import { useResourceContext } from '~/modules/admin/components/Resource'

const { I18n } = window

// IP and CIDR validation regex (IPv4 and IPv6)
// eslint-disable-next-line max-len
const IP_CIDR_PATTERN = /^((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])){3}(\/(3[0-2]|[1-2][0-9]|[0-9]))?|(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:(:[0-9a-fA-F]{1,4}){1,6}|:(:[0-9a-fA-F]{1,4}){1,7}|::)(\/(12[0-8]|1[01][0-9]|[1-9][0-9]|[0-9]))?)$/

interface Props {
  entry: ApplicationIpWhitelistEntry
  close(): void
}

export const EditIpWhiteListModal: React.FC<Props> = ({ entry, close }) => {
  const { resource } = useResourceContext<ApplicationIpWhitelistEntry>()
  const [form] = Form.useForm()

  return (
    <ResourceFormModal
      resourceName="application_ip_whitelist_entry"
      readableResourceName={I18n.t('admin.application_settings_ip_address')}
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
            name="ipOrCidr"
            label={I18n.t('admin.application_settings_ip_or_cidr')}
            rules={[
              { required: true, message: I18n.t('admin.application_settings_ip_required') },
              {
                pattern: IP_CIDR_PATTERN,
                message: I18n.t('admin.application_settings_invalid_ip_format'),
              },
            ]}
          >
            <Input placeholder={I18n.t('admin.application_settings_ip_input_placeholder')} />
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
        </>
      )}
    </ResourceFormModal>
  )
}
