import React, { useEffect } from 'react'
import {
  Table, Row, Col, message, MenuProps, App,
  Switch,
} from 'antd'
import { useParams } from 'react-router-dom'
import { connect, ConnectedProps } from 'react-redux'
import { MenuItem } from '~/interfaces/Antd'
import { useResources } from '~/hooks/useResources'
import { openModal } from '~/modules/admin/core/ui/modals'
import {
  CampaignAssessorAssessments, useCampaignAssessorAssessmentsStore,
} from '~/modules/admin/modules/client/core/campaignAssessorAssessments'

import ConditionalDropdown from '~/components/ConditionalDropdown'

const connecter = connect(() => ({}), { openModal })

type PropsFromRedux = ConnectedProps<typeof connecter>

const { Column } = Table
const { I18n } = window

type Props = PropsFromRedux

const AssessmentList: React.FC<Props> = ({ openModal }) => {
  const { campaignId } = useParams() as { campaignId: string }
  const { modal } = App.useApp()

  const stateManager = useCampaignAssessorAssessmentsStore()

  const {
    data, fetch, removeResource, updateResource,
  } = useResources<CampaignAssessorAssessments>(
    'campaign_assessor_assessments',
    {
      stateManager,
      basePath: `campaigns/${campaignId}/`,
    },
  )

  useEffect(() => {
    fetch()
  }, [])

  const chagneAllowMultipleResponses = (resource, value) => {
    updateResource({ id: resource.id, allowMultipleResponses: value })
  }

  const removeAssessorAssessment = (assessorAssessment) => {
    modal.confirm({
      title: I18n.t('administration.project_tabs.webhooks.remove_webhook.title'),
      content: I18n.t(
        'administration.project_tabs.webhooks.remove_webhook.content',
        {
          description: assessorAssessment.assessmentName,
        },
      ),
      okText: I18n.t('administration.administrators.modals.delete.okText'),
      cancelText: I18n.t(
        'administration.administrators.modals.delete.cancelText',
      ),
      onOk: async () => {
        removeResource(`${assessorAssessment.id}`).then(() => {
          message.info('Success')
          close()
        }).catch((error) => {
          message.error(error)
        })
      },
    })
  }

  return (
    <>
      <Row>
        <Col span={24}>
          <Table className="mtm" rowKey="id" dataSource={data} pagination={false}>
            <Column
              title={I18n.t('common.column.id')}
              dataIndex="assessmentId"
              key="id"
            />
            <Column
              title={I18n.t('common.column.assessment_name')}
              key="name"
              dataIndex="assessmentName"
            />
            <Column
              title={I18n.t('common.column.linked_assessment')}
              key="linkedAssessment"
              render={({ linkedAssessmentName }) => linkedAssessmentName || I18n.t('common.text.na')}
            />
            <Column
              title={I18n.t('common.column.allow_multiple_responses')}
              key="allowMultipleResponses"
              render={resource => (
                <Switch
                  checked={resource.allowMultipleResponses}
                  onChange={(value) => {
                    chagneAllowMultipleResponses(resource, value)
                  }}
                />
              )}
            />
            <Column
              title={I18n.t('administration.scheduling.assessment_center_form.assessment_center_group')}
              key="assessmentCenterGroups"
              render={resource => (
                <a
                  onClick={() => openModal('AssessorCampaignAssessmentGroupModal', {
                    campaignId: resource.campaignId,
                    campaignAssessorAssessmentId: resource.id,
                    campaignAssessmentGroupName: resource.campaignAssessmentGroupName,
                  })
                  }
                >
                  {resource.campaignAssessmentGroupName || I18n.t('frontend.manage')}
                </a>
              )}
            />
            <Column
              key="manage"
              title={I18n.t('administration.projects.webhook_settings.column_manage')}
              render={assessorAssessment => (
                <ConditionalDropdown
                  menu={
                    getActionsMenuProps({
                      assessorAssessment,
                      removeAssessorAssessment,
                    })
                  }
                />
              )}
            />
          </Table>
        </Col>
      </Row>
    </>
  )
}

interface ActionMenuData {
  assessorAssessment: CampaignAssessorAssessments
  removeAssessorAssessment(assessorAssessment: CampaignAssessorAssessments): void
}

const getActionsMenuProps = ({
  assessorAssessment, removeAssessorAssessment,
}: ActionMenuData): MenuProps => {
  const menuItems: MenuItem[] = [
    {
      key: I18n.t('administration.project_tabs.webhooks.actions.delete.key'),
      label: I18n.t('administration.project_tabs.webhooks.actions.delete.label'),
    },
  ]

  const handleMenuClick = ({ key }) => {
    if (key === 'delete') {
      removeAssessorAssessment(assessorAssessment)
    }
  }

  return ({ items: menuItems, onClick: handleMenuClick })
}

export default connecter(AssessmentList)
