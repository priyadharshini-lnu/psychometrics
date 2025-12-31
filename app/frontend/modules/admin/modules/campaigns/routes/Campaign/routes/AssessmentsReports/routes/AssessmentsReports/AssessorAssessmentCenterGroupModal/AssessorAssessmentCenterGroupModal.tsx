import React, { useEffect, useState } from 'react'
import {
  Modal, Button, Form,
  Select,
  App,
} from 'antd'
import { connect, ConnectedProps } from 'react-redux'
import { LoadingOutlined, CheckOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { CampaignAssessorAssessments, useCampaignAssessorAssessmentsStore } from
  '~/modules/admin/modules/client/core/campaignAssessorAssessments'
import {
  FETCH,
} from '~/modules/admin/modules/campaigns/core/assessmentGroups'
import { RootState } from '~/modules/admin/core/rootReducers'
import { isRequestInProgress } from '~/core/request'
import { useResources } from '~/hooks/useResources'

const { I18n } = window

const connecter = connect(
  (state: RootState) => ({
    loading: isRequestInProgress(state, FETCH),
  }),
  {
  },
)

export type PropsFromRedux = ConnectedProps<typeof connecter>

interface AssessmentCenterGroup {
  id: string
  name: string
}

export interface OwnProps {
  close(): void
  campaignId: number
  campaignAssessorAssessmentId: number
  campaignAssessmentGroupName: string
}

export type Props = OwnProps & PropsFromRedux

const AssessorAssessmentCenterGroupModal: React.FC<Props> = ({
  close, campaignId, campaignAssessorAssessmentId, campaignAssessmentGroupName, loading,
}) => {
  const [assessmentCenterGroups, setAssessmentCenterGroups] = useState<AssessmentCenterGroup[]>([])

  const [form] = Form.useForm()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_fields, setFields] = useState({})
  const { message } = App.useApp()

  const stateManager = useCampaignAssessorAssessmentsStore()

  const {
    updateResource,
  } = useResources<CampaignAssessorAssessments>(
    'campaign_assessor_assessments',
    {
      stateManager,
      basePath: `campaigns/${campaignId}`,
    },
  )

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
        if (assessment_center_group.length === 1) {
          // show pre selected option if only one group exist
          form.setFieldsValue({ campaignAssessmentGroupId: assessment_center_group[0].id })
        }
      })
  }, [])

  const handleUpdate = () => {
    const values = form.getFieldsValue().campaignAssessmentGroupId
    updateResource({
      id: campaignAssessorAssessmentId as unknown as string,
      campaignAssessmentGroupId: values || null,
    }).then(() => {
      message.success(I18n.t('campaign_assessment.modals.assessor_campaign_assessment_group.success_message'))
      close()
    }).catch(() => {
      message.error(I18n.t('campaign_assessment.modals.assessor_campaign_assessment_group.error_message'))
    })
  }

  return (
    <Modal
      width={650}
      title={I18n.t('campaign_assessment.modals.assessor_campaign_assessment_group.title')}
      open
      onCancel={close}
      footer={[
        <Button key="back" onClick={close}>{I18n.t('common.actions.cancel')}</Button>,
        <Button
          key="submit"
          type={campaignAssessmentGroupName ? 'default' : 'primary'}
          onClick={() => {
            form.submit()
          }}
        >
          {loading ? <LoadingOutlined /> : <CheckOutlined />}
          {campaignAssessmentGroupName ? I18n.t('common.actions.update') : I18n.t('common.actions.add')}
        </Button>,
      ]}
    >
      <Form
        name="basic"
        form={form}
        onFinish={handleUpdate}
        onFieldsChange={(_, allFields) => {
          setFields(allFields)
        }}
      >
        <Form.Item
          name="campaignAssessmentGroupId"
        >
          <Select defaultValue={campaignAssessmentGroupName} allowClear>
            {assessmentCenterGroups.map((assessmentCenterGroup: AssessmentCenterGroup) => (
              <Select.Option key={assessmentCenterGroup.id} value={assessmentCenterGroup.id}>
                {assessmentCenterGroup.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default connecter(AssessorAssessmentCenterGroupModal)
