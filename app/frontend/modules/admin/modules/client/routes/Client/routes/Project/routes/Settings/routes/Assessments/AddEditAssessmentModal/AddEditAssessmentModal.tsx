import React from 'react'
import {
  Form, Select, Switch,
} from 'antd'
import { useParams } from 'react-router-dom'
import { CreateResource, UpdateResource } from '~/hooks/useResources/interfaces'
import ResourceFormModal from '~/components/ResourceFormModal'
import { Assessment } from '~/modules/admin/modules/client/core/assessments'
import { ProjectAssessment } from '~/modules/admin/modules/client/core/projectAssessments'
import { useResources } from '~/hooks/useResources/useResources'

const { I18n } = window

interface Props {
  addAssessment: CreateResource<Assessment | {projectIdId: string }>
  updateAssessment: UpdateResource<ProjectAssessment>
  projectAssessment: ProjectAssessment
  clientId: number
  close(): void
}

export const AddEditAssessmentModal: React.FC<Props> = ({
  addAssessment,
  updateAssessment,
  projectAssessment,
  clientId,
  close,
}) => {
  const { projectId } = useParams()

  interface Assessment {
    id: string,
    name: string,
  }

  const {
    data: assessments, fetch: fetchAssessments,
  } = useResources<Assessment>('assessments')

  return (
    <>
      <ResourceFormModal
        resourceName="project_assessments"
        resource={projectAssessment}
        readableResourceName="Assessment"
        showSuccessMessages
        close={close}
        scrollToFirstError
        modalProps={{ width: 620 }}
        request={{
          createResource: values => addAssessment({ ...values, projectId }),
          updateResource: updateAssessment,
        }}
      >
        {() => (
          <>
            <Form.Item
              name="assessmentId"
              label="Assessment"
              rules={[{
                required: true,
                message: I18n.t('administration.project_tabs.assessments.form.assessment_required'),
              }]}
            >
              <Select
                placeholder={I18n.t('administration.project_tabs.assessments.form.assessment_placeholder')}
                showSearch
                filterOption={false}
                onSearch={(value) => {
                  fetchAssessments({
                    apiConfig: {
                      filter: {
                        filterable_fields: value,
                        owned_by_client_or_tte: `${clientId}`,
                      },
                      fields: {
                        assessments: ['name'],
                      },
                    },
                  })
                }}
              >
                {assessments.length ? assessments.map(({ id, name }) => (
                  <Select.Option key={id} value={parseInt(id, 10)}>
                    {name}
                  </Select.Option>
                ))
                  : projectAssessment?.assessment && (
                    <Select.Option
                      key={projectAssessment?.assessment.id}
                      value={parseInt(projectAssessment?.assessment.id, 10)}
                    >
                      {projectAssessment?.assessment.name}
                    </Select.Option>
                  )}
              </Select>
            </Form.Item>
            <Form.Item
              name="normalizeFactorScores"
              label={I18n.t('administration.project_tabs.assessments.form.normalize_factor_scores')}
              valuePropName="checked"
              initialValue={projectAssessment?.normalizeFactorScores || false}
            >
              <Switch />
            </Form.Item>
          </>
        )}
      </ResourceFormModal>
    </>
  )
}
