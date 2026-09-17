import React, { useEffect, useState } from 'react'
import { Form, Select } from 'antd'
import ResourceFormModal from '~/components/ResourceFormModal'
import { TYPES } from '~/modules/admin/modules/client/core/assessments'
import { useResourceContext } from '~/modules/admin/components/Resource'
import { BaseFormFields } from './BaseFormFields'
import { ExternalAssessmentFields } from './ExternalAssessmentFields'

interface Props {
  close(): void
}

const { I18n } = window

type OwnerFormValues = Record<string, unknown> & {
  ownerId?: string | null
}

export const AssessmentFormModal: React.FC<Props> = ({ close }) => {
  const [assessmentName, setAssessmentName] = useState('')

  const { resource } = useResourceContext()
  const [form] = Form.useForm()
  const type = Form.useWatch('type', form)

  useEffect(() => {
    form.setFieldValue(['externalSettings', 'assessmentId'], null)
    form.setFieldValue(['externalSettings', 'normId'], null)
    form.setFieldValue(['externalSettings', 'scheduleConfig'], null)
    form.setFieldValue('category', ExternalAssessmentFields[type] ? type : null)
  }, [type])

  const handleAssessmentSelect = (value: string) => {
    setAssessmentName(value)
  }

  useEffect(() => {
    form.setFieldsValue({ name: assessmentName })
  }, [assessmentName])

  const normalizeOwnerValue = (values: OwnerFormValues = {}): OwnerFormValues => ({
    ...values,
    ownerId: values.ownerId || null,
  })

  return (
    <ResourceFormModal
      resourceName="assessments"
      readableResourceName={I18n.t('assessments.assessment')}
      showSuccessMessages
      close={close}
      storeManager={{ form }}
      scrollToFirstError
      modalProps={{ width: 720 }}
      request={{ createResource: resource.createResource, updateResource: resource.updateResource }}
      transformValues={normalizeOwnerValue}
    >
      {() => (
        <>
          <Form.Item
            name="type"
            label={I18n.t('common.column.type')}
            rules={[{ required: true }]}
          >
            <Select>
              {TYPES.map(
                t => (
                  <Select.Option key={t} value={t}>
                    {I18n.t(`admin.${t}_assessment`)}
                  </Select.Option>
                ),
              )}
            </Select>
          </Form.Item>
          <BaseFormFields form={form} showTranslatableFields handleAssessmentSelect={handleAssessmentSelect} />
        </>
      )}
    </ResourceFormModal>
  )
}
