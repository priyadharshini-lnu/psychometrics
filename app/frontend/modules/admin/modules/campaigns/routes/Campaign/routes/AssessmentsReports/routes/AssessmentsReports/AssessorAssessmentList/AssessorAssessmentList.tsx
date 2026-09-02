import React, { useEffect, useState } from 'react'
import {
  Button, Table, message, MenuProps, App, Space,
  Switch,
} from 'antd'
import { useBreakpoint } from '@thetalententerprise/glint'
import { useParams } from 'react-router-dom'
import { connect, ConnectedProps } from 'react-redux'
import { PlusOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { MenuItem } from '~/interfaces/Antd'
import { useResources } from '~/hooks/useResources'
import { getTenantRowAttributes } from '~/utils/tableRowTenantAttributes'
import {
  CampaignAssessorAssessments, useCampaignAssessorAssessmentsStore,
} from '~/modules/admin/modules/client/core/campaignAssessorAssessments'
import { BaseMeta } from '~/hooks/useResources/interfaces'

import ConditionalDropdown from '~/components/ConditionalDropdown'
import { openModal } from '~/modules/admin/core/ui/modals'
import { TableLayout } from '~/modules/admin/components/TableLayout'
import { get as getCurrentCampaign } from '~/modules/admin/modules/campaigns/core/current'
import { RootState } from '~/modules/admin/core/rootReducers'
import { DetailsDrawer } from './DetailsDrawer'

const connecter = connect(
  (state: RootState) => ({
    campaignTenantId: getCurrentCampaign(state).tenantId,
  }),
  { openModal },
)

type PropsFromRedux = ConnectedProps<typeof connecter>

const { Column } = Table
const { I18n } = window

type Props = PropsFromRedux

const AssessmentList: React.FC<Props> = ({ openModal, campaignTenantId }) => {
  const { campaignId } = useParams() as { campaignId: string }
  const parsedCampaignId = parseInt(campaignId, 10)
  const screens = useBreakpoint()
  const { modal } = App.useApp()
  const [selectedAssessorAssessment, setSelectedAssessorAssessment] = useState<CampaignAssessorAssessments | undefined>(
    undefined,
  )

  const stateManager = useCampaignAssessorAssessmentsStore()

  const {
    data, fetch, createResource, removeResource, updateResource, meta,
    isLoading: isAssessorAssessmentLoading,
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
      <TableLayout
        embedded
        title={I18n.t('admin.assessor_assessments')}
        recordCount={data.length}
        filters={(
          <Space wrap>
            {meta?.permissions?.create && (
              <Button
                type="primary"
                onClick={() => openModal('AddAssessorAssessmentModal', {
                  addAssessorAssessment: createResource,
                  campaignId: parsedCampaignId,
                  campaignTenantId,
                })}
              >
                <PlusOutlined />
                <span>{I18n.t('shared.add')}</span>
              </Button>
            )}
          </Space>
        )}
        table={(
          <Table
            rowKey="id"
            loading={isAssessorAssessmentLoading('fetch')}
            dataSource={data}
            pagination={false}
            scroll={{ x: 'max-content' }}
            sticky
            onRow={getTenantRowAttributes}
          >
            <Column
              title={I18n.t('shared.id')}
              dataIndex="assessmentId"
              key="id"
              fixed={screens.md ? 'left' : undefined}
            />
            <Column
              title={I18n.t('shared.assessment_name')}
              key="name"
              width={220}
              fixed={screens.md ? 'left' : undefined}
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
              width={200}
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
              width={200}
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
              fixed={screens.md ? 'right' : undefined}
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
        )}
      />
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
