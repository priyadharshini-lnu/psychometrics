import React, { useState, useEffect, useMemo } from 'react'
import {
  Button, Col, Row, Select, Input, Form, App, Spin,
} from 'antd'
import { useResources } from '~/hooks/useResources/useResources'
import { Assessment } from '~/modules/admin/modules/client/core/assessments'
import { AiAssistant, AiAssistantTR } from '~/modules/admin/modules/AiAssitant/core/aiAssistant'
import { AssessmentAssistant, AssessmentAssistantTR } from '~/modules/admin/modules/client/core/assessmentAssistant'

interface Props {
  assessment: Assessment
}

const { I18n } = window
const { TextArea } = Input

export const AIAssistant: React.FC<Props> = ({ assessment }) => {
  const [isUpdating, setIsUpdating] = useState(false)
  const { message } = App.useApp()
  const [form] = Form.useForm<AssessmentAssistant>()

  const {
    data: assistants,
    fetch: fetchAssistants,
    isLoading: isAssistantsLoading,
  } = useResources<AiAssistant>('assistants', {
    basePath: '/ai',
    responseType: AiAssistantTR,
  })

  const {
    fetchSingle: fetchAssessmentAssistant,
    updateResource: saveAssessmentAssistant,
    isLoading: isAssessmentAssistantLoading,
  } = useResources<AssessmentAssistant>('assessment_assistants', {
    responseType: AssessmentAssistantTR,
  })

  useEffect(() => {
    fetchAssistants({
      apiConfig: {
        filter: {
          assistant_type_eq: 'content_analysis_assistant',
        },
      },
    })
  }, [])

  useEffect(() => {
    fetchAssessmentAssistant({ id: assessment.id }).then((response) => {
      form.setFieldsValue(response as AssessmentAssistant)
    })
  }, [assessment.id])

  const assistantOptions = useMemo(
    () => assistants.map(a => ({
      value: a.id,
      label: a.name,
    })),
    [assistants],
  )

  const onFinish = (values: AssessmentAssistant) => {
    setIsUpdating(true)

    saveAssessmentAssistant({
      ...values,
      id: assessment.id,
    })
      .then((response) => {
        form.setFieldsValue(response as AssessmentAssistant)
        message.success(I18n.t('common.text.updated_successfully'))
      })
      .finally(() => setIsUpdating(false))
  }

  if (isAssessmentAssistantLoading('fetch')) {
    return <Spin />
  }

  return (
    <Form layout="vertical" form={form} onFinish={onFinish}>
      <Row>
        <Col span={24}>
          <Form.Item
            name="aiAssistantId"
            label={I18n.t('admin.ai_assistant')}
          >
            <Select
              loading={isAssistantsLoading('fetch')}
              placeholder={I18n.t('common.text.select')}
              allowClear
              showSearch
              onSearch={(value) => {
                fetchAssistants({
                  apiConfig: {
                    filter: {
                      filterable_fields: value,
                      assistant_type_eq: 'content_analysis_assistant',
                    },
                  },
                })
              }}
              options={assistantOptions}
            />
          </Form.Item>

          <Form.Item
            name="assessmentPrompt"
            label={I18n.t('admin.prompt')}
          >
            <TextArea rows={10} />
          </Form.Item>
        </Col>

        <Col span={24}>
          <Button
            type="primary"
            htmlType="submit"
            className="mt8"
            loading={isUpdating}
          >
            {I18n.t('common.actions.update')}
          </Button>
        </Col>
      </Row>
    </Form>
  )
}
