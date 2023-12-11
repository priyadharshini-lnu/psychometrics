import React from 'react'
import { Form, Select } from 'antd'
import debounce from 'lodash/debounce'
import ResourceFormModal from '~/components/ResourceFormModal'
import { CreateResource } from '~/hooks/useResources/interfaces'
import { CampaignAssessorAssessments } from '~/modules/admin/modules/client/core/campaignAssessorAssessments'
import { useResources } from '~/hooks/useResources'

const { Option } = Select
const { I18n } = window

interface OwnProps {
  close(): void
  addAssessorAssessment: CreateResource<CampaignAssessorAssessments>
}

export type Props = OwnProps

const AddAssessorAssessmentModal: React.FC<Props> = ({
  close, addAssessorAssessment,
}) => {
  interface Assessment {
    id: string,
    name: string,
  }

  const {
    data: assessments, fetch: fetchAssessments,
  } = useResources<Assessment>('assessments')

  const searchAvailableAssessments = debounce((value) => {
    fetchAssessments({
      apiConfig: {
        filter: {
          category_in: ['assessor_form', 'lead_assessor_form'],
          filterable_fields: value,
        },
      },
    })
  }, 50)

  return (
    <ResourceFormModal
      resourceName="campaignAssessorAssessments"
      readableResourceName={I18n.t('administration.assessor_assessment.name')}
      showSuccessMessages
      close={close}
      scrollToFirstError
      modalProps={{ width: 720 }}
      request={{ createResource: values => addAssessorAssessment({ ...values }) }}
    >
      {() => (
        <>
          <Form.Item name="assessmentId">
            <Select
              showSearch
              filterOption={false}
              onSearch={(value) => {
                searchAvailableAssessments(value)
              }}
              placeholder={
                I18n.t('administration.assessor_assessment.modals.add_assessor_assessment.assessment_placeholder')
              }
            >
              {assessments.map(({ id, name }) => (
                <Option key={id} value={id}>{name}</Option>
              ))}
            </Select>
          </Form.Item>
        </>
      )}
    </ResourceFormModal>
  )
}

export default AddAssessorAssessmentModal
