import React, { useEffect, useState } from 'react'
import {
  Button, Table, Row, Col, message, MenuProps, App,
  Switch,
} from 'antd'
import { useParams } from 'react-router-dom'
import { connect, ConnectedProps } from 'react-redux'
import { MenuItem } from '~/interfaces/Antd'
import { useResources } from '~/hooks/useResources'
import { getTenantRowAttributes } from '~/utils/tableRowTenantAttributes'
import {
  CampaignAssessorAssessments, useCampaignAssessorAssessmentsStore,
} from '~/modules/admin/modules/client/core/campaignAssessorAssessments'
import { BaseMeta } from '~/hooks/useResources/interfaces'

import ConditionalDropdown from '~/components/ConditionalDropdown'
import { openModal } from '~/modules/admin/core/ui/modals'
import { DetailsDrawer } from './DetailsDrawer'

const connecter = connect(() => ({}),
  { openModal })

type PropsFromRedux = ConnectedProps<typeof connecter>

const { Column } = Table
const { I18n } = window

type Props = PropsFromRedux

const AssessmentList: React.FC<Props> = ({ openModal }) => {
  const { campaignId } = useParams() as { campaignId: string }
  const { modal } = App.useApp()
  const [selectedAssessorAssessment, setSelectedAssessorAssessment] = useState<CampaignAssessorAssessments | undefined>(
    undefined,
  )

  const stateManager = useCampaignAssessorAssessmentsStore()

  const {
    data, fetch, removeResource, updateResource, meta, isLoading: isAssessorAssessmentLoading,
  } = useResources<CampaignAssessorAssessments>(
    'campaign_assessor_assessments',
    {
      stateManager,
      basePath: `campaigns/${campaignId}/`,
    },
  )

  useEffect(() => {
    fetch({ apiConfig: { include: ['tenant'], include_meta: ['permissions'] } })
  }, [])

  const chagneAllowMultipleResponses = (resource, value) => {
    updateResource({ id: resource.id, allowMultipleResponses: value })
  }

  const removeAssessorAssessment = (assessorAssessment) => {
    modal.confirm({
      title: I18n.t('shared.delete'),
      content: I18n.t(
        'admin.project_tabs_webhooks_remove_webhook_content',
        {
          description: assessorAssessment.assessmentName,
        },
      ),
      okText: I18n.t('shared.ok'),
      cancelText: I18n.t('shared.cancel'),
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
          <Table
            className="mtm"
            rowKey="id"
            loading={isAssessorAssessmentLoading('fetch')}
            dataSource={data}
            pagination={false}
            onRow={getTenantRowAttributes}
          >
            <Column
              title={I18n.t('shared.id')}
              dataIndex="assessmentId"
              key="id"
            />
            <Column
              title={I18n.t('shared.assessment_name')}
              key="name"
              render={resource => (
                <Button
                  type="link"
                  size="small"
                  className="p-0"
                  onClick={() => setSelectedAssessorAssessment(resource)}
                >
                  {resource.assessmentName}
                </Button>
              )}
            />
            <Column
              title={I18n.t('shared.linked_assessment')}
              key="linkedAssessment"
              render={({ linkedAssessmentName }) => linkedAssessmentName || I18n.t('common.text.na')}
            />
            <Column
              title={I18n.t('admin.allow_multiple_responses')}
              key="allowMultipleResponses"
              render={resource => (
                <Switch
                  disabled={!meta?.permissions?.update}
                  checked={resource.allowMultipleResponses}
                  onChange={(value) => {
                    chagneAllowMultipleResponses(resource, value)
                  }}
                />
              )}
            />
            <Column
              title={I18n.t('admin.assessment_center_group')}
              key="assessmentCenterGroups"
              render={resource => (
                <Button
                  type="link"
                  size="small"
                  className="p-0"
                  onClick={() => openModal('AssessorCampaignAssessmentGroupModal', {
                    campaignId: resource.campaignId,
                    campaignAssessorAssessmentId: resource.id,
                    campaignAssessmentGroupName: resource.campaignAssessmentGroupName,
                  })
                  }
                >
                  {resource.campaignAssessmentGroupName || I18n.t('frontend.manage')}
                </Button>
              )}
            />
            <Column
              key="manage"
              title={I18n.t('shared.manage')}
              render={assessorAssessment => (
                <ConditionalDropdown
                  menu={
                    getActionsMenuProps({
                      assessorAssessment,
                      removeAssessorAssessment,
                      permissions: meta?.permissions,
                    })
                  }
                />
              )}
            />
          </Table>
        </Col>
      </Row>
      {!!selectedAssessorAssessment && (
        <DetailsDrawer
          close={() => setSelectedAssessorAssessment(undefined)}
          assessorAssessment={selectedAssessorAssessment}
        />
      )}
    </>
  )
}

interface ActionMenuData {
  assessorAssessment: CampaignAssessorAssessments
  removeAssessorAssessment(assessorAssessment: CampaignAssessorAssessments): void,
  permissions: BaseMeta['permissions']
}

const getActionsMenuProps = ({
  assessorAssessment, removeAssessorAssessment, permissions,
}: ActionMenuData): MenuProps => {
  if (permissions === undefined) { return {} }

  const menuItems: MenuItem[] = []
  if (permissions.destroy) {
    menuItems.push({
      key: 'delete',
      label: I18n.t('common.actions.delete'),
    })
  }

  const handleMenuClick = ({ key }) => {
    if (key === 'delete') {
      removeAssessorAssessment(assessorAssessment)
    }
  }

  return ({ items: menuItems, onClick: handleMenuClick })
}

export default connecter(AssessmentList)
