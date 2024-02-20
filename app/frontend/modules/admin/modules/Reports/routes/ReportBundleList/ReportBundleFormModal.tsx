import React from 'react'
import { Form, Input } from 'antd'
import ResourceFormModal from '~/components/ResourceFormModal'
import { useResourceContext } from '~/modules/admin/components/Resource'
import { ReportBundle } from '~/modules/admin/modules/client/core/reports'

interface Props {
  close(): void
  currentReportBundle?: ReportBundle
}

const { I18n } = window

export const ReportBundleFormModal: React.FC<Props> = ({ currentReportBundle, close }) => {
  const { resource } = useResourceContext()
  const [form] = Form.useForm()
  return (
    <ResourceFormModal
      resourceName="report_families"
      readableResourceName={I18n.t('report_bundles.report_bundle')}
      showSuccessMessages
      close={close}
      resource={currentReportBundle}
      storeManager={{ form }}
      scrollToFirstError
      modalProps={{ width: 720 }}
      request={{ createResource: resource.createResource, updateResource: resource.updateResource }}
    >
      {() => (
        <>
          <Form.Item
            name="name"
            label={I18n.t('common.column.name')}
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
        </>
      )}
    </ResourceFormModal>
  )
}
