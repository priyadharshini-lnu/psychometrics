import React, { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  Table, Skeleton, Row, Col, App, Popover, Pagination,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { CheckOutlined, AppstoreOutlined, WarningFilled } from '@ant-design/icons'
import _ from 'lodash'
import * as t from 'io-ts'
import cs from 'classnames'
import { useResources } from '~/hooks/useResources'
import { CampaignFactorGroup } from '../ScoringGroups/GroupCard'
import { CampaignFactor } from '../ScoringGroups/Factor'
import { ToolsDropdown } from './ToolsDropdown'
import styles from './styles.less'
import { CampaignScores, CampaignScoresTR, type Error } from '~/modules/admin/modules/campaigns/core/combinedScoring'
import { formatedDate } from '~/utils/time'
import { TableLayout } from '~/modules/admin/components/TableLayout'

const { I18n } = window

type CampaignFactorGroupType = CampaignFactorGroup & {campaignFactors: CampaignFactor[]}

type DataType = {
  key: React.Key;
  id: string;
  email: string;
  campaignScoresFinalized: boolean | null;
  campaignScoresFinalizedDate: string | null;
  campaignScoresCalculatedDate: string | null;
  errors: Error[] | null;
  stackRank: number | null ;
  [key: string]: string | number | boolean | null | Error[];
}

export function SubjectScoresList () {
  const { modal, message } = App.useApp()
  const { campaignId } = useParams<{ campaignId: string }>()
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [isCampaignFactorsLoading, setIsCampaignFactorsLoading] = useState(true)
  const [isCampaignFactorValuesLoading, setIsCampaignFactorValuesLoading] = useState(true)

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
      },
    },
  )

  useEffect(() => {
    fetchCampaignFactors().then(() => setIsCampaignFactorsLoading(false))
    fetchFinalScores().then(() => setIsCampaignFactorValuesLoading(false))
  }, [])


  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys)
  }

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
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
    }
  }

  const handleBulkAction = (action: string) => {
    if (action === 'mark_finalized') {
      collectionAction({
        action: 'change_finalized_campaign_score_bulk',
        method: 'post',
        body: { userIds: selectedRowKeys, finalized: true },
        responseType: t.literal('ok'),
      }).then(() => {
        message.success(I18n.t('frontend.resource.update_success',
          { readableResourceName: I18n.t('administration.scoring.subject_list.bulk_mark_finalized') }))
      })
    } else if (action === 'mark_not_finalized') {
      collectionAction({
        action: 'change_finalized_campaign_score_bulk',
        method: 'post',
        body: { userIds: selectedRowKeys, finalized: false },
        responseType: t.literal('ok'),
      }).then(() => {
        message.success(I18n.t('frontend.resource.update_success',
          { readableResourceName: I18n.t('administration.scoring.subject_list.bulk_mark_not_finalized') }))
      })
    } else if (action === 'rescore') {
      collectionAction({
        action: 'rescore_bulk',
        method: 'post',
        body: { userIds: selectedRowKeys },
        responseType: {},
      }).then(() => {
        message.success(I18n.t('frontend.resource.update_success',
          { readableResourceName: I18n.t('administration.scoring.subject_list.bulk_rescore') }))
      })
    }
  }

  const handleConfirmAction = (action: string, subject: DataType) => {
    const { title, content } = actionDetails(action, subject)
    modal.confirm({
      title,
      content,
      onOk: () => handleIndividualAction(action, subject),
    })
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
    getSortOrder,
  ), [campaignFactorData, getSortOrder])

  const dataSource = useMemo(() => processData(CampaignFactorValuesData), [CampaignFactorValuesData])

  const handleChange = (pagination, filters, sorter) => {
    handleTableChange(pagination, filters, sorter)
  }

  return (
    <div>
      <Row justify="space-between" className="pm">
        <Col span={4} className="pls">
          <AppstoreOutlined style={{ fontSize: '16px' }} />
          <span className="mlm">
            {`${CampaignFactorValuesData.length} ${I18n.t('administration.scoring.subjects')}`}
          </span>
        </Col>
        <div>
          <ToolsDropdown
            isBulk
            onClick={action => handleBulkConfirmAction(action)}
            isDisabled={selectedRowKeys.length === 0}
            persmission={
            {
              markFinalized: true,
              markNotFinalized: true,
              rescore: true,
            }
          }
          />
        </div>
      </Row>
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
              />
              )}
            disableHeader
            recordCount={meta.recordCount}
            loading={false}
            requestStatus={requests.fetch?.status}
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
    </div>
  )
}


function createSortedTableColumns (
  campaignFactorData: CampaignFactorGroupType[],
  handleAction: (actions: string, subject)=> void,
  getSortOrder,
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
      title: I18n.t('administration.scoring.id'),
      dataIndex: 'id',
      key: 'id',
      width: 80,
      fixed: 'left',
      sorter: true,
      sortOrder: getSortOrder('id'),
    },
    {
      title: I18n.t('administration.scoring.subject'),
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
      title: I18n.t('administration.scoring.subject_list.calculated_date'),
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
    },
    {
      title: I18n.t('administration.scoring.subject_list.finalized_date'),
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
    },
    {
      title: I18n.t('administration.scoring.subject_list.finalized'),
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
            <Popover content={content} title={I18n.t('administration.scoring.subject_list.calculation_errors')}>
              <WarningFilled className={styles.warning} />
            </Popover>
          )
        }
        return (campaignScoresFinalized ? <CheckOutlined className={styles.icon} /> : null)
      },
    },
    {
      title: I18n.t('administration.scoring.subject_list.actions'),
      key: 'actions',
      fixed: 'right',
      width: 100,
      render: subject => (
        <div>
          <ToolsDropdown
            onClick={action => handleAction(action, subject)}
            persmission={
                {
                  markFinalized: true,
                  markNotFinalized: true,
                  rescore: true,
                }
              }
          />
        </div>
      ),
    },
  ]

  if (stackRankColumn !== null) {
    sortedGroupColumns.push({
      title: I18n.t('administration.scoring.subject_list.rank'),
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
    email: valueData?.user.email,
    campaignScoresFinalizedDate: valueData?.campaignScoresFinalizedDate,
    campaignScoresCalculatedDate: valueData?.campaignScoresCalculatedDate,
    campaignScoresFinalized: valueData?.campaignScoresFinalized,
    stackRank: valueData?.stackRank || null,
    errors: valueData?.campaignScoresErrors,
  }

  _.forEach(valueData.campaignFactorValues, (score) => {
    const factorKey = `${score.campaignFactorId}`
    const factorValue = score.value || '-'
    userData[factorKey] = factorValue
  })

  return userData
})

const actionDetails = (action: string, subject: DataType) => {
  if (action === 'mark_finalized') {
    return {
      title: I18n.t('administration.scoring.subject_list.mark_finalized'),
      content: I18n.t('administration.scoring.subject_list.mark_finalized_confirm', { email: subject.email }),
    }
  } if (action === 'mark_not_finalized') {
    return {
      title: I18n.t('administration.scoring.subject_list.mark_not_finalized'),
      content: I18n.t('administration.scoring.subject_list.mark_not_finalized_confirm', { email: subject.email }),
    }
  }
  return {
    title: I18n.t('administration.scoring.subject_list.rescore'),
    content: I18n.t('administration.scoring.subject_list.rescore_confirm', { email: subject.email }),
  }
}

const bulkActionDetails = (action: string) => {
  if (action === 'mark_finalized') {
    return {
      title: I18n.t('administration.scoring.subject_list.bulk_mark_finalized'),
      content: I18n.t('administration.scoring.subject_list.bulk_mark_finalized_confirm'),
    }
  } if (action === 'mark_not_finalized') {
    return {
      title: I18n.t('administration.scoring.subject_list.bulk_mark_not_finalized'),
      content: I18n.t('administration.scoring.subject_list.bulk_mark_not_finalized_confirm'),
    }
  }
  return {
    title: I18n.t('administration.scoring.subject_list.bulk_rescore'),
    content: I18n.t('administration.scoring.subject_list.bulk_rescore_confirm'),
  }
}
