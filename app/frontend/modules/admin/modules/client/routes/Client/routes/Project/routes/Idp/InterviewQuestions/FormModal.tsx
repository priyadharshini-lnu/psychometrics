import React from 'react'
import {
  Form, Input, Checkbox, Radio,
} from 'antd'
import { useParams } from 'react-router'
import { useResourceContext } from '~/modules/admin/components/Resource'
import ResourceFormModal from '~/components/ResourceFormModal'
import { InterviewQuestion } from '~/modules/admin/modules/client/core/interviewQuestion'
import InputDuration from '~/components/InputDuration'

const { TextArea } = Input

type Props = {
  close(): void
  interviewQuestion?: InterviewQuestion
}

const { I18n } = window

export const FormModal: React.FC<Props> = ({ close, interviewQuestion }) => {
  const { resource } = useResourceContext<InterviewQuestion>()
  const { projectId } = useParams()
  const [form] = Form.useForm()

  const createInterviewQuestion = (data: Partial<InterviewQuestion>) => {
    data.project = { id: projectId } as { id: string }

    return resource.createResource(data as InterviewQuestion)
  }

  const updateInterviewQuestion = (data: Partial<InterviewQuestion>) => {
    // Add project information
    if (projectId) {
      data.project = { id: projectId } as { id: string }
    }

    return resource.updateResource(data as InterviewQuestion)
  }

  return (
    <ResourceFormModal
      resourceName="interview_questions"
      resource={interviewQuestion}
      readableResourceName={I18n.t('admin.interview_questions_form_title')}
      showSuccessMessages
      close={close}
      storeManager={{ form }}
      scrollToFirstError
      modalProps={{ width: 720 }}
      request={{ createResource: createInterviewQuestion, updateResource: updateInterviewQuestion }}
      formProps={{
        initialValues: {
          ...interviewQuestion,
          mandatory: interviewQuestion?.mandatory || false,
        },
      }}
    >
      {() => (
        <>
          <Form.Item
            name="question"
            label={I18n.t('admin.interview_questions_form_question')}
            rules={[
              {
                required: true,
              },
            ]}
          >
            <TextArea rows={4} />
          </Form.Item>
          <Form.Item
            name="description"
            label={I18n.t('shared.description')}
            rules={[
              {
                required: true,
              },
            ]}
          >
            <TextArea rows={4} />
          </Form.Item>
          <Form.Item
            name="questionType"
            label={I18n.t('admin.interview_questions_form_question_type')}
            rules={[
              {
                required: true,
              },
            ]}
          >
            <Radio.Group>
              <Radio value="audio">{I18n.t('admin.interview_questions_form_question_type_audio')}</Radio>
              <Radio value="video">{I18n.t('admin.interview_questions_form_question_type_video')}</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item
            name="timeLimit"
            label={I18n.t('admin.interview_questions_form_time_limit')}
            rules={[
              {
                required: true,
              },
            ]}
          >
            <InputDuration />
          </Form.Item>

          <Form.Item
            name="mandatory"
            valuePropName="checked"
          >
            <Checkbox>
              {I18n.t('admin.interview_questions_form_mandatory')}
            </Checkbox>
          </Form.Item>
        </>
      )}
    </ResourceFormModal>
  )
}
