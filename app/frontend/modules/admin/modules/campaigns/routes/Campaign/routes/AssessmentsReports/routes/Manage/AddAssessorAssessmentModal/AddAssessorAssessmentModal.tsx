import { debounce } from 'lodash'
import React, { useEffect } from 'react'
import { Form, Select, Spin } from 'antd'
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
    data: assessments, fetch: fetchAssessments, isLoading,
  } = useResources<Assessment>('assessments')
  const assessmentsLoading = isLoading('fetch')

  const fetchAssessmentsByValue = (value: string) => fetchAssessments({
    apiConfig: {
      filter: {
        category_in: ['assessor_form', 'lead_assessor_form'],
        filterable_fields: value,
      },
    },
  })

  const searchAvailableAssessments = debounce((value) => {
    fetchAssessmentsByValue(value)
  }, 50)

  useEffect(() => {
    fetchAssessmentsByValue('')
  }, [])

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
              placeholder={
                I18n.t('administration.assessor_assessment.modals.add_assessor_assessment.assessment_placeholder')
              }
              onSearch={searchAvailableAssessments}
              notFoundContent={assessmentsLoading ? <Spin size="small" /> : null}
            >
              {
                assessments.map(({ id, name }) => (
                  <Option key={id} value={id}>{name}</Option>
                ))
              }
            </Select>
          </Form.Item>
        </>
      )}
    </ResourceFormModal>
  )
}

export default AddAssessorAssessmentModal
