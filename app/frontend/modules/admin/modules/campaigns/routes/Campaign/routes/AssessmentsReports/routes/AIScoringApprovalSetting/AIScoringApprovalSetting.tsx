import React, { useEffect } from 'react'
import {
  Table, Space, Button, MenuProps,
} from 'antd'
import { DataTablePagination } from '@thetalententerprise/glint'
import { connect, ConnectedProps } from 'react-redux'
import { useParams } from 'react-router-dom'
import { PlusOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { useResources } from '~/hooks/useResources'
import { getErrorMsgFromJsonApiRequests } from '~/hooks/useResources/utils'
import {
  ScoringApprovalSettings,
  ScoringApprovalSettingsTR,
} from '~/modules/admin/modules/campaigns/core/scoringApprovalSettings'
import Modals from '~/modules/admin/components/Modals'
import { openModal } from '~/modules/admin/core/ui/modals'
import { BaseMeta, RemoveResource, UpdateResource } from '~/hooks/useResources/interfaces'
import ConditionalDropdown from '~/components/ConditionalDropdown'
import { TableLayout } from '~/modules/admin/components/TableLayout'
import { RootState } from '~/modules/admin/core/rootReducers'
import { get as getCurrentUser, isSuperAdmin } from '~/core/currentUser'
import { RemoveScoringApprovalSettingModal } from './RemoveScoringApprovalModal'
import { ScoringApprovalFormModal } from './ScoringApprovalFormModal'

const { Column } = Table
const { I18n } = window

const MODALS = {
  ScoringApprovalFormModal,
  RemoveScoringApprovalSettingModal,
}

const connecter = connect(
  (state: RootState) => ({
    currentUser: getCurrentUser(state),
  }),
  {
    openModal,
  },
)
type PropsFromRedux = ConnectedProps<typeof connecter>
type Params = {
  campaignId: string
}
type Props = PropsFromRedux

const AIScoringApprovalSettingComponent: React.FC<Props> = ({
  openModal,
  currentUser,
}) => {
  const { campaignId } = useParams() as Params
  const {
    data, meta, createResource, fetch, isLoading, changePage,
    currentPage, pageSize, updateResource, removeResource, requests,
  } = useResources<ScoringApprovalSettings, BaseMeta>(
    'ai_scoring_approval_settings',
    {
      basePath: `campaigns/${campaignId}/`,
      responseType: ScoringApprovalSettingsTR,
      apiConfig: {
        include: ['assessment'],
        fields: {
          assessments: ['name'],
        },
      },
    },
  )
  useEffect(() => {
    fetch()
  }, [])
  const tableLoading = isLoading('fetch')

  const ApprovalSettingsTable = (
    <>
      <Table
        rowKey={row => row?.id ?? -1}
        dataSource={data}
        pagination={false}
        loading={tableLoading}
      >
        <Column
          title={I18n.t('shared.assessment_id')}
          key="id"
          render={({ assessment }) => assessment.id}
        />
        <Column
          title={I18n.t('shared.assessment_name')}
          key="assessment_name"
          render={({ assessment }) => (
            <>{assessment.name}</>
          )}
        />
        <Column
          key="assessors_list"
          title={I18n.t('shared.assessors_list')}
          render={({ assessors }) => (
            <Space
              direction="vertical"
            >
              {assessors.map(assessor => <div key={`assessors_${assessor.id}`}>{assessor.email}</div>)}
            </Space>
          )}
        />
        <Column
          key="approvers_list"
          title={I18n.t('shared.approvers_list')}
          render={({ approvers }) => (
            <Space direction="vertical">
              {approvers.map(approver => (
                <div key={`approvers_${approver.id}`}>
                  {approver.email}
                </div>
              ))}
            </Space>
          )}
        />
        {isSuperAdmin(currentUser)
          && (
            <Column
              title={I18n.t('shared.actions')}
              key="action"
              render={scoringApprovalSettings => (
                <ConditionalDropdown
                  menu={
                  getActionsMenuProps({
                    scoringApprovalSettings,
                    updateResource,
                    removeResource,
                    openModal,
                    campaignId,
                  })
                }
                />
              )}
            />
          )}
      </Table>
      <DataTablePagination
        page={currentPage}
        pageSize={pageSize}
        total={meta.recordCount ?? 0}
        onChange={changePage}
      />
    </>
  )

  const filter = (
    <Button
      type="primary"
      disabled={tableLoading}
      onClick={() => {
        openModal(
          'ScoringApprovalFormModal', {
            addScoringApprovalSetting: createResource,
            campaignId,
          },
        )
      }}
    >
      <PlusOutlined />
      {' '}
      {I18n.t('admin.scoring_approval_add_settings')}
    </Button>
  )

  return (
    <>
      <TableLayout
        table={ApprovalSettingsTable}
        filters={filter}
        title={I18n.t('admin.ai_scoring_approval_settings')}
        recordCount={meta.recordCount}
        requestStatus={requests.fetch?.status}
        failureMsg={getErrorMsgFromJsonApiRequests(requests)}
      />
      <Modals modals={MODALS} />
    </>
  )
}
interface ActionMenuData {
  scoringApprovalSettings: ScoringApprovalSettings
  updateResource: UpdateResource<ScoringApprovalSettings>
  removeResource: RemoveResource
  campaignId: string,
  openModal: (modalName: string, modalProps: unknown) => void
}

const getActionsMenuProps = ({
  scoringApprovalSettings, updateResource, removeResource, openModal, campaignId,
}: ActionMenuData): MenuProps => {
  const { id } = scoringApprovalSettings
  const assessmentId = scoringApprovalSettings.assessment.id
  const menuItems = [
    { key: 'edit', label: I18n.t('common.actions.edit') },
    { key: 'remove', label: I18n.t('common.actions.remove') },
  ]
  const handleMenuClick = ({ key }) => {
    if (key === 'edit') {
      return openModal(
        'ScoringApprovalFormModal', {
          scoringApprovalSettings,
          updateScoringApprovalSetting: updateResource,
          campaignId,
        },
      )
    }
    if (key === 'remove') {
      return openModal('RemoveScoringApprovalSettingModal', {
        id, assessmentId, removeResource,
      })
    }
  }

  return ({ items: menuItems, onClick: handleMenuClick })
}

export const AIScoringApprovalSetting = connecter(AIScoringApprovalSettingComponent)
