import React, { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  Table, Skeleton, Row, Col, App, Popover,
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

const { I18n } = window

type CampaignFactorGroupType = CampaignFactorGroup & {campaignFactors: CampaignFactor[]}

type DataType = {
  key: React.Key;
  id: string;
  subject: string;
  finalized: boolean | null;
  finalizedDate: string | null;
  calculatedDate: string | null;
  errors: Error[] | null;
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
        campaign_factors: ['name', 'position', 'id'],
      },
      include: ['campaign_factors'],
    },
  })

  const {
    data: CampaignFactorValuesData,
    fetch: fetchFinalScores,
    memberAction,
    collectionAction,
  } = useResources<CampaignScores>(
    'campaign_user_scorings',
    {
      trackUrl: true,
      responseType: CampaignScoresTR,
      basePath: `campaigns/${campaignId}`,
      apiConfig: {
        fields: {
          users: ['id', 'email', 'first_name', 'last_name'],
          campaign_factor_values: ['id', 'numeric_value', 'campaign_factor_id', 'string_value'],
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
        message.success(I18n.t('frontend.resource.update_success', { readableResourceName: subject.subject }))
      })
    } else if (action === 'mark_not_finalized') {
      memberAction({
        id: subject?.id,
        action: 'change_finalized_campaign_score',
        method: 'post',
        updateStore: true,
        body: { finalized: false },
      }).then(() => {
        message.success(I18n.t('frontend.resource.update_success', { readableResourceName: subject.subject }))
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
        message.success(I18n.t('frontend.resource.update_success', { readableResourceName: subject.subject }))
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
  ), [campaignFactorData])

  const dataSource = useMemo(() => processData(CampaignFactorValuesData), [CampaignFactorValuesData])

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
        <Table
          rowSelection={rowSelection}
          size="small"
          dataSource={dataSource}
          columns={tableColumns}
          pagination={false}
          bordered
          scroll={{ x: 'max-content' }}
        />
      )}
    </div>
  )
}


function createSortedTableColumns (
  campaignFactorData: CampaignFactorGroupType[],
  handleAction: (actions: string, subject)=> void,
): ColumnsType<DataType> {
  const sortedGroupColumns: ColumnsType<DataType> = campaignFactorData?.map(group => ({
    ...group,
    campaignFactors: group.campaignFactors.sort((a, b) => a.position - b.position),
  })).sort((a, b) => a.position - b.position).map((group, index) => {
    const even = index % 2 === 0
    return ({
      title: group.name,
      children: group.campaignFactors.sort((a, b) => a.position - b.position).map((factor, factorIndex) => ({
        title: factor.name,
        dataIndex: `factor_${factor.id}`,
        key: `factor_${factor.id}`,
        className: cs(factorIndex === 0 ? styles.columnBorderStart : null,
          factorIndex === group.campaignFactors.length - 1 ? styles.columnBorderEnd : null,
          even ? styles.evenGroup : styles.oddGroup),
      })),
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
    },
    {
      title: I18n.t('administration.scoring.subject'),
      dataIndex: 'subject',
      key: 'subject',
      className: styles.columnBorderEnd,
      width: 200,
      fixed: 'left',
    },
  ]

  const staticAfterColumns: ColumnsType<DataType> = [
    {
      title: I18n.t('administration.scoring.subject_list.calculated_date'),
      dataIndex: 'calculatedDate',
      key: 'calculatedDate',
      className: styles.columnBorderStart,
      render: (calculatedDate) => {
        if (calculatedDate) {
          return formatedDate(calculatedDate)
        }
        return null
      },
    },
    {
      title: I18n.t('administration.scoring.subject_list.finalized_date'),
      dataIndex: 'finalizedDate',
      key: 'finalizedDate',
      render: (finalizedDate) => {
        if (finalizedDate) {
          return formatedDate(finalizedDate)
        }
        return null
      },
    },
    {
      title: I18n.t('administration.scoring.subject_list.finalized'),
      dataIndex: 'finalized',
      key: 'finalized',
      render: (finalized: boolean, subject) => {
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
        return (finalized ? <CheckOutlined className={styles.icon} /> : null)
      },
    },
    {
      title: I18n.t('common.column.action'),
      key: 'actions',
      width: 80,
      fixed: 'right',
      render: subject => (
        <ToolsDropdown
          onClick={action => handleAction(action, subject)}
          persmission={
          {
            markFinalized: subject.finalized === false && subject.errors === null,
            markNotFinalized: subject.finalized === true,
            rescore: true,
          }
        }
        />
      ),
    },
  ]

  return [...staticBeforeColumns, ...sortedGroupColumns, ...staticAfterColumns]
}


const processData = (
  CampaignFactorValuesData: CampaignScores[],
): DataType[] => _.map(CampaignFactorValuesData, (valueData) => {
  const userId = valueData.user.id
  const userData = {
    key: userId,
    id: userId,
    subject: valueData.user.email,
    finalizedDate: valueData.campaignScoresFinalizedDate,
    calculatedDate: valueData.campaignScoresCalculatedDate,
    finalized: valueData.campaignScoresFinalized,
    errors: valueData.campaignScoresErrors,
  }

  _.forEach(valueData.campaignFactorValues, (score) => {
    const factorKey = `factor_${score.campaignFactorId}`
    const factorValue = score.numericValue || score.stringValue || '-'
    userData[factorKey] = factorValue
  })

  return userData
})

const actionDetails = (action: string, subject: DataType) => {
  if (action === 'mark_finalized') {
    return {
      title: I18n.t('administration.scoring.subject_list.mark_finalized'),
      content: I18n.t('administration.scoring.subject_list.mark_finalized_confirm', { email: subject.subject }),
    }
  } if (action === 'mark_not_finalized') {
    return {
      title: I18n.t('administration.scoring.subject_list.mark_not_finalized'),
      content: I18n.t('administration.scoring.subject_list.mark_not_finalized_confirm', { email: subject.subject }),
    }
  }
  return {
    title: I18n.t('administration.scoring.subject_list.rescore'),
    content: I18n.t('administration.scoring.subject_list.rescore_confirm', { email: subject.subject }),
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
