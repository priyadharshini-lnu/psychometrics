import React, { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  Table, Input, Skeleton, App, Popover, Pagination,
  Flex,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import _ from 'lodash'
import * as t from 'io-ts'
import cs from 'classnames'
import { connect, ConnectedProps } from 'react-redux'
import { TOP_BAR_STICKY_OFFSET } from '~/components/AdminShell'
import { CheckOutlined, AppstoreOutlined, WarningFilled } from '~/glint/icons/AccessibleIconsAntDesign'
import { RootState } from '~/modules/admin/core/rootReducers'
import { useResources } from '~/hooks/useResources'
import { getErrorMsgFromJsonApiRequests } from '~/hooks/useResources/utils'
import { CampaignFactorGroup } from '../ScoringGroups/GroupCard'
import { CampaignFactor } from '../ScoringGroups/Factor'
import { ToolsDropdown } from './ToolsDropdown'
import { Tools } from './Tools'
import styles from './styles.less'
import { CampaignScores, CampaignScoresTR, type Error } from '~/modules/admin/modules/campaigns/core/combinedScoring'
import { formatedDate } from '~/utils/time'
import { TableLayout } from '~/modules/admin/components/TableLayout'
import { get as getCurrentCampaign, fetch } from '~/modules/admin/modules/campaigns/core/current'
import { ImportExternalScoringModal } from './ImportExternalScoringModal'
import { ExportScoringsModal } from './ExportScoringsModal'
import PushWebhookModal from '~/modules/admin/components/PushWebhookModal/PushWebhookModal'
import { ParentResourceType } from '~/modules/admin/components/PushWebhookModal/constants'
import Modals from '~/modules/admin/components/Modals/'
import { openModal } from '~/modules/admin/core/ui/modals'
import { useSelectAll } from '~/hooks/useSelectAll'

const MODALS = {
  PushWebhookModal,
}
const { I18n } = window
const { Search } = Input

type CampaignFactorGroupType = CampaignFactorGroup & {campaignFactors: CampaignFactor[]}

enum StackRank {
  UNRANKED = '-',
}


type DataType = {
  id: string;
  email: string;
  active: string;
  campaignScoresFinalized: boolean | null;
  campaignScoresFinalizedDate: string | null;
  campaignScoresCalculatedDate: string | null;
  errors: Error[] | null;
  stackRank: number | StackRank ;
  [key: string]: string | number | boolean | null | Error[] | {[key: string]: boolean};
}

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
    },
  )

  const dataSource = useMemo(() => processData(CampaignFactorValuesData), [CampaignFactorValuesData])

  const {
    isAllSelected, excludedKeys, selectedKeys, onSelectionChange, onAllSelect,
  } = useSelectAll(false, dataSource)

  useEffect(() => {
    fetchCampaignFactors().then(() => setIsCampaignFactorsLoading(false))
    fetchFinalScores().then(() => setIsCampaignFactorValuesLoading(false))
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
  ), [campaignFactorData, getSortOrder, getFilteredValue])

  const handleChange = (pagination, filters, sorter) => {
    handleTableChange(pagination, filters, sorter)
  }

  return (
    <div>
      <Flex justify="space-between" className="pm">
        <Flex className="pls" justify="center" align="center">
          <AppstoreOutlined style={{ fontSize: '16px' }} />
          <span className="mlm">
            {`${I18n.t('common.text.total')}: ${meta.recordCount}`}
          </span>
        </Flex>
        <Flex gap={8}>
          <Search
            placeholder={I18n.t('common.actions.search')}
            value={getFilteredValue('search_query')}
            onChange={({ target: { value } }) => { changeFilter('search_query', value) }}
          />
          <Tools
            permissions={{
              export: campaignPermissions.viewCampaignScoring,
              import: campaignPermissions.manageCampaignScoring,
            }}
            onClick={action => handleToolAction(action)}
          />
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
      {(isCampaignFactorsLoading || isCampaignFactorValuesLoading) ? (
        <Skeleton active />
      ) : (
        <>
          <TableLayout
            table={(
              <Table
                rowSelection={rowSelection}
                size="small"
                dataSource={dataSource}
                columns={tableColumns}
                onChange={handleChange}
                bordered
                pagination={false}
                scroll={{ x: 'max-content' }}
                loading={isLoading('fetch')}
                sticky={{ offsetHeader: TOP_BAR_STICKY_OFFSET }}
              />
              )}
            disableHeader
            recordCount={meta.recordCount}
            loading={false}
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
          />
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={meta.recordCount}
            onChange={changePage}
            className="pl"
          />
        </>
      )}
      <Modals modals={MODALS} />
    </div>
  )
}

export const SubjectScoresList = connector(SubjectScoresListComponent)

function createSortedTableColumns (
  campaignFactorData: CampaignFactorGroupType[],
  handleAction: (actions: string, subject)=> void,
  getSortOrder, meta,
  getFilteredValue,
): ColumnsType<DataType> {
  let stackRankColumn: string | null = null
  const sortedGroupColumns: ColumnsType<DataType> = campaignFactorData?.map(group => ({
    ...group,
    campaignFactors: group.campaignFactors.sort((a, b) => a.position - b.position),
  })).sort((a, b) => a.position - b.position).map((group, index) => {
    const even = index % 2 === 0
    return ({
      title: group.name,
      children: group.campaignFactors.sort((a, b) => a.position - b.position).map((factor, factorIndex) => {
        stackRankColumn = factor.ranked ? `${factor.name}` : stackRankColumn
        return ({
          title: factor.name,
          dataIndex: `${factor.id}`,
          key: `${factor.id}`,
          width: getTextWidth(factor.name),
          sorter: true,
          sortOrder: getSortOrder(`${factor.id}`),
          className: cs(factorIndex === 0 ? styles.columnBorderStart : null,
            factorIndex === group.campaignFactors.length - 1 ? styles.columnBorderEnd : null,
            even ? styles.evenGroup : styles.oddGroup),
        })
      }),
      className: cs(styles.columnBorderEnd, styles.columnBorderStart, even ? styles.evenGroup : styles.oddGroup),
    })
  }) || []

  const staticBeforeColumns: ColumnsType<DataType> = [
    {
      title: I18n.t('shared.id'),
      dataIndex: 'id',
      key: 'id',
      width: 80,
      fixed: 'left',
      sorter: true,
      sortOrder: getSortOrder('id'),
    },
    {
      title: I18n.t('admin.scoring_active'),
      dataIndex: 'active',
      key: 'campaign_users_active',
      width: 80,
      fixed: 'left',
      filters: [
        { text: 'Active', value: true },
        { text: 'Inactive', value: false },
      ],
      filteredValue: (getFilteredValue('campaign_users_active_in') || [true]),
    },
    {
      title: I18n.t('admin.scoring_subject'),
      dataIndex: 'email',
      key: 'email',
      className: styles.columnBorderEnd,
      width: 200,
      fixed: 'left',
      sorter: true,
      sortOrder: getSortOrder('email'),
    },
  ]

  const staticAfterColumns: ColumnsType<DataType> = [
    {
      title: I18n.t('admin.scoring_subject_list_calculated_date'),
      dataIndex: 'campaignScoresCalculatedDate',
      key: 'campaignScoresCalculatedDate',
      className: styles.columnBorderStart,
      sorter: true,
      sortOrder: getSortOrder('campaignScoresCalculatedDate'),
      render: (calculatedDate) => {
        if (calculatedDate) {
          return formatedDate(calculatedDate)
        }
        return null
      },
      width: 200,
    },
    {
      title: I18n.t('admin.scoring_subject_list_finalized_date'),
      dataIndex: 'campaignScoresFinalizedDate',
      key: 'campaignScoresFinalizedDate',
      sorter: true,
      sortOrder: getSortOrder('campaignScoresFinalizedDate'),
      render: (finalizedDate) => {
        if (finalizedDate) {
          return formatedDate(finalizedDate)
        }
        return null
      },
      width: 200,
    },
    {
      title: I18n.t('admin.scoring_subject_list_finalized'),
      dataIndex: 'campaignScoresFinalized',
      key: 'campaignScoresFinalized',
      sorter: true,
      sortOrder: getSortOrder('campaignScoresFinalized'),
      render: (campaignScoresFinalized: boolean, subject) => {
        if (subject.errors) {
          const factors = _.chain(campaignFactorData).map('campaignFactors').flatten().value()
          const content = subject.errors.map((error) => {
            const factor = factors.find(factor => factor.id === error.factorId)
            return (
              <div style={{ maxWidth: 500 }}>
                <strong>
                  {factor?.name}
                  {': '}
                </strong>
                {error.message}
              </div>
            )
          })
          return (
            <Popover content={content} title={I18n.t('admin.scoring_subject_list_calculation_errors')}>
              <span><WarningFilled className={styles.warning} /></span>
            </Popover>
          )
        }
        return (campaignScoresFinalized ? <CheckOutlined className={styles.icon} /> : null)
      },
      width: 200,
    },
    {
      title: I18n.t('shared.actions'),
      key: 'actions',
      fixed: 'right',
      width: 100,
      render: subject => (
        <div>
          <ToolsDropdown
            onClick={action => handleAction(action, subject)}
            persmission={
                {
                  changeFinalizedCampaignScore: meta.permissions?.changeFinalizedCampaignScore,
                  rescore: meta.permissions?.rescore,
                  pushWebhook: meta.permissions?.pushWebhook,
                }
              }
          />
        </div>
      ),
    },
  ]

  if (stackRankColumn !== null) {
    sortedGroupColumns.push({
      title: I18n.t('admin.scoring_subject_list_rank'),
      dataIndex: 'stackRank',
      key: 'stackRank',
      sorter: true,
      sortOrder: getSortOrder('stackRank'),
    })
  }

  return [...staticBeforeColumns, ...sortedGroupColumns, ...staticAfterColumns]
}


const processData = (
  CampaignFactorValuesData: CampaignScores[],
): DataType[] => _.map(CampaignFactorValuesData, (valueData) => {
  const userId = valueData?.user.id
  const userData = {
    key: userId,
    id: userId,
    active: valueData?.active ? 'Yes' : 'No',
    email: valueData?.user.email,
    campaignScoresFinalizedDate: valueData?.campaignScoresFinalizedDate,
    campaignScoresCalculatedDate: valueData?.campaignScoresCalculatedDate,
    campaignScoresFinalized: valueData?.campaignScoresFinalized,
    stackRank: valueData?.stackRank || StackRank.UNRANKED,
    errors: valueData?.campaignScoresErrors,
  }

  _.forEach(valueData.campaignFactorValues, (score) => {
    const factorKey = `${score.campaignFactorId}`
    const factorValue = score.value ?? '-'
    const factorLabel = score.label ? ` (${score.label})` : ''
    userData[factorKey] = `${factorValue}${factorLabel}`
  })

  return userData
})

const actionDetails = (action: string, subject: DataType) => {
  if (action === 'mark_finalized') {
    return {
      title: I18n.t('admin.scoring_subject_list_mark_finalized'),
      content: I18n.t('admin.scoring_subject_list_mark_finalized_confirm', { email: subject.email }),
    }
  } if (action === 'mark_not_finalized') {
    return {
      title: I18n.t('admin.scoring_subject_list_mark_not_finalized'),
      content: I18n.t('admin.scoring_subject_list_mark_not_finalized_confirm', { email: subject.email }),
    }
  }
  return {
    title: I18n.t('admin.scoring_subject_list_rescore'),
    content: I18n.t('admin.scoring_subject_list_rescore_confirm', { email: subject.email }),
  }
}

const bulkActionDetails = (action: string) => {
  if (action === 'mark_finalized') {
    return {
      title: I18n.t('admin.scoring_subject_list_bulk_mark_finalized'),
      content: I18n.t('admin.scoring_subject_list_bulk_mark_finalized_confirm'),
    }
  } if (action === 'mark_not_finalized') {
    return {
      title: I18n.t('admin.scoring_subject_list_bulk_mark_not_finalized'),
      content: I18n.t('admin.scoring_subject_list_bulk_mark_not_finalized_confirm'),
    }
  }
  return {
    title: I18n.t('admin.scoring_subject_list_bulk_rescore'),
    content: I18n.t('admin.scoring_subject_list_bulk_rescore_confirm'),
  }
}

const getTextWidth = (text: string): number => {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  if (!context) return 100

  const width = context.measureText(text).width + 96 // add padding
  canvas.remove() // Clean up the canvas element

  return width
}
