import React from 'react'
import { Form, Input, Select } from 'antd'
import { Question } from 'modules/admin/modules/QuestionCenter/core/questions'
import { FLATTENED_QUESTION_TYPES } from 'modules/admin/modules/QuestionCenter/core/questionTypes'
import { CreateResource, UpdateResource } from '~/hooks/useResources/interfaces'
import ResourceFormModal from '~/components/ResourceFormModal'
import { AdditionRelationshipAttribute } from '~/libs/jsonApi/interfaces'

const { I18n } = window
const { Option } = Select

export const ATTRIBUTE_TYPES = FLATTENED_QUESTION_TYPES
  .filter(t => t.group !== 'Static Content')
  .map(t => t.type)

interface Props {
    question: AdditionRelationshipAttribute<Question>
    addQuestion: CreateResource<Question>
    updateQuestion: UpdateResource<Question>
    close(): void
}

type QuestionFormValues = {
  name: string
  type: string
  props?: Record<string, unknown>
  validation?: Record<string, unknown>
  required_validation?: Record<string, unknown>
  display_logic?: Record<string, unknown>
  skip_logic?: Record<string, unknown>
  position?: number
  disabled?: boolean
  save_as_template?: boolean
}

export const QuestionFormModal: React.FC<Props> = ({
  question,
  addQuestion,
  updateQuestion,
  close,
}) => (
  <ResourceFormModal
    resourceName="questions"
    resource={question}
    readableResourceName={I18n.t('admin.questions_title')}
    showSuccessMessages
    close={close}
    scrollToFirstError
    modalProps={{ width: 620 }}
    request={{
      createResource: addQuestion,
      updateResource: updateQuestion,
    }}
    transformValues={(values: QuestionFormValues) => ({
      ...values,
      ...(question ? {} : {
        props: {},
        validation: {},
        required_validation: {},
        display_logic: {},
        skip_logic: {},
        position: 1, // Default position
        disabled: false,
        save_as_template: false,
      }),
    })}
  >
    {() => (
      <>
        <Form.Item
          name="name"
          label={I18n.t('shared.name')}
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="type"
          label={I18n.t('admin.questions_type')}
          rules={[{ required: true }]}
        >
          <Select showSearch>
            {ATTRIBUTE_TYPES.map(type => (
              <Option key={type} value={type}>{type}</Option>
            ))}
          </Select>
        </Form.Item>
      </>
    )}
  </ResourceFormModal>
)
