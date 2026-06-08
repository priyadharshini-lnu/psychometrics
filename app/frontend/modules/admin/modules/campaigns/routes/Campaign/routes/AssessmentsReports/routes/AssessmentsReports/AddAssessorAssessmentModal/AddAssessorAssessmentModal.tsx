import { debounce } from 'lodash'
import React, { useEffect, useState } from 'react'
import { Form, Select, Spin } from 'antd'
import ResourceFormModal from '~/components/ResourceFormModal'
import { CreateResource } from '~/hooks/useResources/interfaces'
import { CampaignAssessorAssessments } from '~/modules/admin/modules/client/core/campaignAssessorAssessments'
import { useResources } from '~/hooks/useResources'

const { Option } = Select
const { I18n } = window


interface AssessmentCenterGroup {
  id: string
  name: string
}
interface Assessment {
  id: string,
  name: string,
}

interface OwnProps {
  close(): void
  addAssessorAssessment: CreateResource<CampaignAssessorAssessments>
  campaignId: string
}

export type Props = OwnProps

const AddAssessorAssessmentModal: React.FC<Props> = ({
  close, addAssessorAssessment, campaignId,
}) => {
  const [assessmentCenterGroups, setAssessmentCenterGroups] = useState<AssessmentCenterGroup[]>([])

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


  const {
    collectionAction: assessmentGroupsAction,
  } = useResources<AssessmentCenterGroup>(
    'campaign_assessment_groups',
    {
      basePath: `campaigns/${campaignId}`,
    },
  )

  useEffect(() => {
    assessmentGroupsAction({
      action: '',
      method: 'get',
      apiConfig: {
        filter: { group_type_eq: '1' },
      },
    })
      .then((response) => {
        const assessment_center_group = response as AssessmentCenterGroup[]
        setAssessmentCenterGroups(assessment_center_group)
      })
  }, [])

  return (
    <ResourceFormModal
      resourceName="campaignAssessorAssessments"
      readableResourceName={I18n.t('admin.assessor_assessment_name')}
      showSuccessMessages
      close={close}
      scrollToFirstError
      modalProps={{ width: 720 }}
      request={{ createResource: values => addAssessorAssessment({ ...values }) }}
    >
      {() => (
        <>
          <Form.Item
            name="assessmentId"
            label={I18n.t('admin.assessor_assessment_name')}
          >
            <Select
              showSearch={{ filterOption: false, onSearch: searchAvailableAssessments }}
              placeholder={
                I18n.t('admin.assessor_assessment_modals_add_assessor_assessment_assessment_placeholder')
              }
              notFoundContent={assessmentsLoading ? <Spin size="small" /> : I18n.t('shared.no_results_found')}
            >
              {
                assessments.map(({ id, name }) => (
                  <Option key={id} value={id}>{name}</Option>
                ))
              }
            </Select>
          </Form.Item>

          <Form.Item
            name="campaignAssessmentGroupId"
            label={I18n.t('admin.assessment_center_group')}
          >
            <Select
              placeholder={
                I18n.t('campaign_assessment.modals.assessor_campaign_assessment_group.placeholder')
              }
              allowClear
            >
              {assessmentCenterGroups.map((assessmentCenterGroup: AssessmentCenterGroup) => (
                <Select.Option key={assessmentCenterGroup.id} value={assessmentCenterGroup.id}>
                  {assessmentCenterGroup.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </>
      )}
    </ResourceFormModal>
  )
}

export default AddAssessorAssessmentModal
