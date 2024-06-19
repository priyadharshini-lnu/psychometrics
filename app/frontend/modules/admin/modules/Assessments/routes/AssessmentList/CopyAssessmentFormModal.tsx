import React from 'react'
import {
  Form, Input, App,
} from 'antd'

import { useResourceContext } from '~/modules/admin/components/Resource'
import { Assessment, AssessmentTR } from '~/modules/admin/modules/client/core/assessments'

import ResourceFormModal from '~/components/ResourceFormModal'

const { I18n } = window

interface Props {
  assessment: Assessment
  close(): void
}

type RequestFileds = {
  name: string
}

const CopyAssessmentFormModal: React.FC<Props> = ({
  assessment, close,
}) => {
  const { message } = App.useApp()
  const { resource } = useResourceContext<Assessment>()

  const copy = (values: RequestFileds) => resource.memberAction({
    id: assessment.id,
    action: 'copy',
    method: 'post',
    updateStore: true,
    responseType: AssessmentTR,
    body: values,
  }).then((response: Assessment) => {
    resource.setMeta({ ...resource.meta, recordCount: resource.meta?.recordCount ? resource.meta?.recordCount + 1 : 0 })
    message.success(I18n.t('assessments.actions.copy.success_message', { name: response.name }))
  })

  return (
    <ResourceFormModal
      resourceName="assessments"
      title={I18n.t('administration.assessments.copy.copy_assessment')}
      readableResourceName={I18n.t('administration.assessments.copy.copy_assessment')}
      close={close}
      scrollToFirstError
      request={{ createResource: copy }}
      modalProps={{ width: 550 }}
      formProps={{ initialValues: { name: `${assessment.name} - ${I18n.t('administration.assessments.copy.copy')}` } }}
    >
      {() => (
        <>
          <Form.Item
            name="name"
            label={I18n.t('administration.assessments.copy.name')}
            rules={[{ required: true }]}
          >
            <Input name="assessment_name" />
          </Form.Item>
        </>
      )}
    </ResourceFormModal>
  )
}

export default CopyAssessmentFormModal
