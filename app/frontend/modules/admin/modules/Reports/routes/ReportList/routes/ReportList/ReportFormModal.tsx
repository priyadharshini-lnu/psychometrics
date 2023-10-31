import React from 'react'
import { Form } from 'antd'
import ResourceFormModal from '~/components/ResourceFormModal'
import { useResourceContext } from '~/modules/admin/components/Resource'
import { BaseFormFields } from './BaseFormFields'

interface Props {
  close(): void
}

const { I18n } = window

export const ReportFormModal: React.FC<Props> = ({ close }) => {
  const { resource } = useResourceContext()
  const [form] = Form.useForm()

  return (
    <ResourceFormModal
      resourceName="reports"
      readableResourceName={I18n.t('reports.report')}
      showSuccessMessages
      close={close}
      storeManager={{ form }}
      scrollToFirstError
      modalProps={{ width: 720 }}
      request={{ createResource: resource.createResource, updateResource: resource.updateResource }}
    >
      {() => (
        <>
          <BaseFormFields form={form} />
        </>
      )}
    </ResourceFormModal>
  )
}
