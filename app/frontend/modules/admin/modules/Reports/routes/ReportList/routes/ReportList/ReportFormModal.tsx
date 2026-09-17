import React from 'react'
import { Form } from 'antd'
import ResourceFormModal from '~/components/ResourceFormModal'
import { useResourceContext } from '~/modules/admin/components/Resource'
import { BaseFormFields } from './BaseFormFields'

interface Props {
  close(): void
}

const { I18n } = window

type OwnerFormValues = Record<string, unknown> & {
  ownerId?: string | null
}

export const ReportFormModal: React.FC<Props> = ({ close }) => {
  const { resource } = useResourceContext()
  const [form] = Form.useForm()

  const createNewResource = data => resource.createResource(data)

  const normalizeOwnerValue = (values: OwnerFormValues = {}): OwnerFormValues => ({
    ...values,
    ownerId: values.ownerId === '' ? null : values.ownerId,
  })

  return (
    <ResourceFormModal
      resourceName="reports"
      readableResourceName={I18n.t('reports.report')}
      showSuccessMessages
      close={close}
      storeManager={{ form }}
      scrollToFirstError
      modalProps={{ width: 720 }}
      request={{ createResource: createNewResource, updateResource: resource.updateResource }}
      transformValues={normalizeOwnerValue}
      formProps={{
        initialValues: { defaultLanguage: 'en' },
      }}
    >
      {() => (
        <>
          <BaseFormFields form={form} />
        </>
      )}
    </ResourceFormModal>
  )
}
