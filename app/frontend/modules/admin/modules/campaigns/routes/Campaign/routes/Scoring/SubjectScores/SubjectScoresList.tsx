import React, { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  Table, Input, Skeleton, App, Flex, theme,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  DataTableDisplayDrawer, DataTableDisplaySider, DataTableDisplaySiderButton,
  DATA_TABLE_DISPLAY_TABS, useBreakpoint, visibleColumns,
} from '@thetalententerprise/glint'
import * as t from 'io-ts'
import { connect, ConnectedProps } from 'react-redux'
import { RootState } from '~/modules/admin/core/rootReducers'
import { useResources } from '~/hooks/useResources'
import { getErrorMsgFromJsonApiRequests } from '~/hooks/useResources/utils'
import { ToolsDropdown } from './ToolsDropdown'
import { Tools } from './Tools'
import {
  createSortedTableColumns, leafKeysOf, toColumnNodes, type CampaignFactorGroupType,
} from './subjectScoresColumns'
import { processData, type DataType } from './subjectScoresRows'
import { actionDetails, bulkActionDetails } from './actionConfirmations'
import { CampaignScores, CampaignScoresTR } from '~/modules/admin/modules/campaigns/core/combinedScoring'
import { TableLayout } from '~/modules/admin/components/TableLayout'
import { get as getCurrentCampaign, fetch } from '~/modules/admin/modules/campaigns/core/current'
import { ImportExternalScoringModal } from './ImportExternalScoringModal'
import { ExportScoringsModal } from './ExportScoringsModal'
import PushWebhookModal from '~/modules/admin/components/PushWebhookModal/PushWebhookModal'
import { ParentResourceType } from '~/modules/admin/components/PushWebhookModal/constants'
import Modals from '~/modules/admin/components/Modals/'
import { openModal } from '~/modules/admin/core/ui/modals'
import { useSelectAll } from '~/hooks/useSelectAll'
import { useDeepCompareEffect } from '~/hooks/useDeepCompareEffect'
import { useTableSettings } from '~/components/AdminShell/useTableSettings'

const MODALS = {
  PushWebhookModal,
}
const { I18n } = window
const { Search } = Input

const SCORING_CONFIG_KEY = 'campaign_subject_scores'

const SCORING_RESOURCE_TYPE = 'Campaign'

interface OwnProps {
  openModal(name: string, data?: object): void
}

const connector = connect(
  (state: RootState) => ({
    campaignPermissions: getCurrentCampaign(state).permissions,
  }),
  {
    fetch,
    openModal,
  },
)

type Props = ConnectedProps<typeof connector>

const SubjectScoresListComponent: React.FC<Props & OwnProps > = ({ openModal, campaignPermissions }) => {
  const { modal, message } = App.useApp()
  const { campaignId, projectId } = useParams() as { campaignId: string, projectId: string }
  const [isCampaignFactorsLoading, setIsCampaignFactorsLoading] = useState(true)
  const [isCampaignFactorValuesLoading, setIsCampaignFactorValuesLoading] = useState(true)
  const [openImportExternalScoringModal, setopenImportExternalScoringModal] = useState(false)
  const [openExportScoringsModal, setopenExportScoringsModal] = useState(false)
  const [openTab, setOpenTab] = useState<string | null>(null)
  const screens = useBreakpoint()
  const { token } = theme.useToken()
  const narrow = screens.lg === false
  const scope = useMemo(
    () => ({ resourceType: SCORING_RESOURCE_TYPE, resourceId: campaignId }), [campaignId],
  )
  const { initial: storedSettings, settings, save: saveSettings } = useTableSettings(SCORING_CONFIG_KEY, scope)
  const { hiddenColumns } = settings

  const {
    data: campaignFactorData,
    fetch: fetchCampaignFactors,
  } = useResources<CampaignFactorGroupType>('campaign_factor_groups', {
    basePath: `campaigns/${campaignId}`,
    apiConfig: {
      fields: {
        campaign_factor_groups: ['id', 'name', 'position', 'campaign_factors'],
        campaign_factors: ['name', 'position', 'id', 'ranked'],
      },
      include: ['campaign_factors'],
    },
  })

  const {
    data: CampaignFactorValuesData,
    fetch: fetchFinalScores,
    changePage,
    meta, currentPage, pageSize,
    memberAction,
    collectionAction,
    requests,
    getSortOrder,
    handleTableChange,
    changeFilter,
    getFilteredValue,
    getAppliedFiltersFromURL,
    isLoading,
  } = useResources<CampaignScores>(
    'campaign_user_scorings',
    {
      trackUrl: true,
      responseType: CampaignScoresTR,
      basePath: `campaigns/${campaignId}`,
      apiConfig: {
        fields: {
          users: ['id', 'email', 'first_name', 'last_name'],
          campaign_factor_values: ['value', 'campaign_factor_id'],
          campaign_user_scorings: [
            'campaign_scores_finalized',
            'campaign_scores_finalized_date',
            'campaign_scores_calculated_date',
            'campaign_scores_errors',
          ],
        },
        include: ['campaign_factor_values', 'user'],
        filter: {
          campaign_users_active_in: 'true',
        },
      },
      initialFilter: storedSettings.filters,
    },
  )

  const dataSource = useMemo(() => processData(CampaignFactorValuesData), [CampaignFactorValuesData])

  const {
    isAllSelected, excludedKeys, selectedKeys, onSelectionChange, onAllSelect,
  } = useSelectAll(false, dataSource)

  // A rejected initial fetch must still clear the flag, or the skeleton below hides the error the table renders.
  useEffect(() => {
    fetchCampaignFactors().finally(() => setIsCampaignFactorsLoading(false)).catch(() => null)
    fetchFinalScores().finally(() => setIsCampaignFactorValuesLoading(false)).catch(() => null)
  }, [])

  const rowSelection = {
    selectedRowKeys: selectedKeys,
    onChange: onSelectionChange,
    preserveSelectedRowKeys: true,
  }

  const handleIndividualAction = (action: string, subject: DataType) => {
    if (action === 'mark_finalized') {
      memberAction({
        id: subject?.id,
        action: 'change_finalized_campaign_score',
        method: 'post',
        updateStore: true,
        body: { finalized: true },
      }).then(() => {
        message.success(I18n.t('frontend.resource.update_success', { readableResourceName: subject.email }))
      })
    } else if (action === 'mark_not_finalized') {
      memberAction({
        id: subject?.id,
        action: 'change_finalized_campaign_score',
        method: 'post',
        updateStore: true,
        body: { finalized: false },
      }).then(() => {
        message.success(I18n.t('frontend.resource.update_success', { readableResourceName: subject.email }))
      })
    } else if (action === 'rescore') {
      memberAction({
        id: subject?.id,
        action: 'rescore',
        method: 'post',
        updateStore: true,
        body: {},
        responseType: {},
      }).then(() => {
        message.success(I18n.t('frontend.resource.update_success', { readableResourceName: subject.email }))
      })
    } else if (action === 'push_webhook') {
      openModal('PushWebhookModal', {
        campaignId,
        parentType: ParentResourceType.CampaignUser,
        parentId: subject.id,
        testMode: false,
        projectId,
      })
    }
  }

  const handleToolAction = (action: string) => {
    if (action === 'export') {
      setopenExportScoringsModal(true)
    } else if (action === 'import_external_scores') {
      setopenImportExternalScoringModal(true)
    }
  }

  const handleBulkAction = (action: string) => {
    if (action === 'mark_finalized') {
      collectionAction({
        action: 'change_finalized_campaign_score_bulk',
        method: 'post',
        body: {
          userIds: isAllSelected ? excludedKeys : selectedKeys,
          finalized: true,
          exclude: isAllSelected,
        },
        responseType: t.literal('ok'),
      }).then(() => {
        message.success(I18n.t('frontend.resource.update_success',
          { readableResourceName: I18n.t('admin.scoring_subject_list_bulk_mark_finalized') }))
      })
    } else if (action === 'mark_not_finalized') {
      collectionAction({
        action: 'change_finalized_campaign_score_bulk',
        method: 'post',
        body: {
          userIds: isAllSelected ? excludedKeys : selectedKeys,
          finalized: false,
          exclude: isAllSelected,
        },
        responseType: t.literal('ok'),
      }).then(() => {
        message.success(I18n.t('frontend.resource.update_success',
          { readableResourceName: I18n.t('admin.scoring_subject_list_bulk_mark_not_finalized') }))
      })
    } else if (action === 'rescore') {
      collectionAction({
        action: 'rescore_bulk',
        method: 'post',
        body: isAllSelected ? { excluded_user_ids: excludedKeys } : { userIds: selectedKeys },
        responseType: {},
      }).then(() => {
        message.success(I18n.t('frontend.resource.update_success',
          { readableResourceName: I18n.t('admin.scoring_subject_list_bulk_rescore') }))
      })
    }
  }

  const handleConfirmAction = (action: string, subject: DataType) => {
    if (action === 'push_webhook') {
      handleIndividualAction(action, subject)
    } else {
      const { title, content } = actionDetails(action, subject)
      modal.confirm({
        title,
        content,
        onOk: () => handleIndividualAction(action, subject),
      })
    }
  }

  const handleBulkConfirmAction = (action: string) => {
    const { title, content } = bulkActionDetails(action)
    modal.confirm({
      title,
      content,
      onOk: () => handleBulkAction(action),
    })
  }

  const tableColumns: ColumnsType<DataType> = useMemo(() => createSortedTableColumns(
    campaignFactorData,
    handleConfirmAction,
    getSortOrder, meta,
    getFilteredValue,
    token,
  ), [campaignFactorData, getSortOrder, getFilteredValue, token])

  const handleChange = (pagination, filters, sorter) => {
    handleTableChange(pagination, filters, sorter)
  }

  const columnNodes = useMemo(() => toColumnNodes(tableColumns), [tableColumns])
  const leafKeys = useMemo(() => leafKeysOf(columnNodes), [columnNodes])
  const shownColumns = useMemo(() => visibleColumns(tableColumns, hiddenColumns), [tableColumns, hiddenColumns])

  const appliedFilters = getAppliedFiltersFromURL() ?? {}
  // The factor columns arrive with their own fetch, so until it lands the set is incomplete and must not prune.
  const columnsPublished = !isCampaignFactorsLoading && leafKeys.length > 0

  const handleCheck = (checked: string[]) => {
    if (!columnsPublished) return
    saveSettings({ hiddenColumns: leafKeys.filter(key => !checked.includes(key)), filters: appliedFilters })
  }

  useDeepCompareEffect(() => {
    const hidden = columnsPublished ? hiddenColumns.filter(key => leafKeys.includes(key)) : hiddenColumns
    saveSettings({ hiddenColumns: hidden, filters: appliedFilters })
  }, [appliedFilters, leafKeys, hiddenColumns, columnsPublished])

  const togglePanel = (tab: string) => setOpenTab(current => (current === tab ? null : tab))

  useEffect(() => { setOpenTab(null) }, [narrow])

  const panel = {
    label: I18n.t('admin.table_display_title'),
    closeLabel: I18n.t('shared.close'),
    columnsLabel: I18n.t('admin.table_display_columns'),
    nodes: columnNodes,
    checkedKeys: leafKeys.filter(key => !hiddenColumns.includes(key)),
    onCheck: handleCheck,
    onClose: () => setOpenTab(null),
  }

  const toolbar = (
    <Flex align="center" gap="small">
      <Search
        placeholder={I18n.t('common.actions.search')}
        value={getFilteredValue('search_query')}
        onChange={({ target: { value } }) => { changeFilter('search_query', value) }}
      />
      <Flex align="center" gap="small" flex="none">
        <Tools
          permissions={{
            export: campaignPermissions.viewCampaignScoring,
            import: campaignPermissions.manageCampaignScoring,
          }}
          onClick={action => handleToolAction(action)}
        />
        <ToolsDropdown
          isBulk
          onClick={action => handleBulkConfirmAction(action)}
          isDisabled={selectedKeys.length === 0}
          persmission={
            {
              changeFinalizedCampaignScore: meta.permissions?.changeFinalizedCampaignScoreBulk,
              rescore: meta.permissions?.rescoreBulk,
            }
          }
        />
      </Flex>
    </Flex>
  )

  return (
    <div>
      {(isCampaignFactorsLoading || isCampaignFactorValuesLoading) ? (
        <Skeleton active />
      ) : (
        <>
          <TableLayout
            title={I18n.t('admin.scoring_tabs_subject_scores')}
            filters={toolbar}
            loading={isLoading('fetch')}
            table={(
              <Table
                rowSelection={rowSelection}
                size="small"
                dataSource={dataSource}
                columns={shownColumns}
                onChange={handleChange}
                bordered
                pagination={false}
                scroll={{ x: 'max-content' }}
                sticky
              />
              )}
            recordCount={meta.recordCount}
            requestStatus={requests.fetch?.status}
            failureMsg={getErrorMsgFromJsonApiRequests(requests)}
            selectionSetting={{
              selectionAllowed: CampaignFactorValuesData.length !== meta.recordCount,
              hasSelectInAllPages: isAllSelected,
              onSelectionChange: onAllSelect,
              label: I18n.t('admin.scoring_select_all', { n: meta.recordCount ?? 0 }),
            }}
            selectedCount={
              (isAllSelected && meta.recordCount) ? (meta.recordCount - excludedKeys.length) : selectedKeys.length
            }
            pagination={{
              page: currentPage, pageSize, total: meta.recordCount ?? 0, onChange: changePage,
            }}
            controls={(
              <DataTableDisplaySiderButton
                open={openTab === DATA_TABLE_DISPLAY_TABS.columns}
                filtered={leafKeys.some(key => hiddenColumns.includes(key))}
                onToggle={() => togglePanel(DATA_TABLE_DISPLAY_TABS.columns)}
                label={I18n.t('admin.table_display_columns')}
              />
            )}
            sider={narrow ? undefined : <DataTableDisplaySider {...panel} />}
            siderOpen={openTab !== null}
          />
          {narrow && <DataTableDisplayDrawer {...panel} open={openTab !== null} />}
        </>
      )}
      <ExportScoringsModal
        exportScorings={params => collectionAction({
          action: 'export_scorings',
          method: 'post',
          body: {
            filters: params.filters,
          },
          responseType: t.literal('ok'),
        }).then(() => { message.success(I18n.t('admin.scoring_subject_list_export_success')) })}
        open={openExportScoringsModal}
        close={() => setopenExportScoringsModal(false)}
      />
      <ImportExternalScoringModal
        open={openImportExternalScoringModal}
        close={() => setopenImportExternalScoringModal(false)}
      />
      <Modals modals={MODALS} />
    </div>
  )
}

export const SubjectScoresList = connector(SubjectScoresListComponent)
