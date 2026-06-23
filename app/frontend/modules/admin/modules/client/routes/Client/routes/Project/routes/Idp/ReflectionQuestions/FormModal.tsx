import React from 'react'
import {
  Form, Input, InputNumber, Checkbox,
} from 'antd'
import { useParams } from 'react-router'
import { useResourceContext } from '~/modules/admin/components/Resource'
import ResourceFormModal from '~/components/ResourceFormModal'
import { ReflectionQuestion } from '~/modules/admin/modules/client/core/reflectionQuestion'

const { TextArea } = Input

type Props = {
  close(): void
  reflectionQuestion?: ReflectionQuestion
}

const { I18n } = window

export const FormModal: React.FC<Props> = ({ close, reflectionQuestion }) => {
  const { resource } = useResourceContext<ReflectionQuestion>()
  const { projectId } = useParams()
  const [form] = Form.useForm()

  const createReflectionQuestion = (data: Partial<ReflectionQuestion>) => {
    data.project = { id: projectId } as { id: string }

    return resource.createResource(data as ReflectionQuestion)
  }

  const updateReflectionQuestion = (data: Partial<ReflectionQuestion>) => {
    // Add project information
    if (projectId) {
      data.project = { id: projectId } as { id: string }
    }

    return resource.updateResource(data as ReflectionQuestion)
  }

  return (
    <ResourceFormModal
      resourceName="reflection_questions"
      resource={reflectionQuestion}
      readableResourceName={I18n.t('admin.reflection_questions_form_title')}
      showSuccessMessages
      close={close}
      storeManager={{ form }}
      scrollToFirstError
      modalProps={{ width: 720 }}
      request={{ createResource: createReflectionQuestion, updateResource: updateReflectionQuestion }}
      formProps={{
        initialValues: {
          ...reflectionQuestion,
          mandatory: reflectionQuestion?.mandatory || false,
        },
      }}
    >
      {() => (
        <>
          <Form.Item
            name="question"
            label={I18n.t('admin.reflection_questions_form_question')}
            rules={[
              {
                required: true,
              },
            ]}
          >
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item
            name="mandatory"
            valuePropName="checked"
          >
            <Checkbox>
              {I18n.t('admin.reflection_questions_form_mandatory')}
            </Checkbox>
          </Form.Item>

          <Form.Item
            name="minWords"
            label={I18n.t('admin.reflection_questions_form_min_words')}
          >
            <InputNumber />
          </Form.Item>

          <Form.Item
            name="maxWords"
            label={I18n.t('admin.reflection_questions_form_max_words')}
          >
            <InputNumber />
          </Form.Item>
        </>
      )}
    </ResourceFormModal>
  )
}
