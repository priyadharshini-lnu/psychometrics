import React from 'react'
import { Popover } from 'antd'
import type { GlobalToken } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { DataTableColumnNode } from '@thetalententerprise/glint'
import _ from 'lodash'
import cs from 'classnames'
import { CheckOutlined, WarningFilled } from '~/glint/icons/AccessibleIconsAntDesign'
import { formatedDate } from '~/utils/time'
import { CampaignFactorGroup } from '../ScoringGroups/GroupCard'
import { CampaignFactor } from '../ScoringGroups/Factor'
import { ToolsDropdown } from './ToolsDropdown'
import { DataType } from './subjectScoresRows'
import styles from './styles.less'

const { I18n } = window

export type CampaignFactorGroupType = CampaignFactorGroup & {campaignFactors: CampaignFactor[]}

const PINNED_COLUMNS = ['id', 'actions']

type ScoringColumn = ColumnsType<DataType>[number]

const labelOf = (column: ScoringColumn): React.ReactNode => (
  typeof column.title === 'function' ? null : column.title
)

export const toColumnNodes = (columns: ColumnsType<DataType>): DataTableColumnNode[] => columns.flatMap((column) => {
  const label = labelOf(column)
  const key = column.key == null ? null : String(column.key)
  if (key == null || label == null || PINNED_COLUMNS.includes(key)) return []
  if (!('children' in column)) return [{ key, label }]

  const children = toColumnNodes(column.children)
  return children.length === 0 ? [] : [{ key, label, children }]
})

// Leaves alone: a half-checked group is absent from the tree's checked keys, and hiding it would drop the band.
export const leafKeysOf = (nodes: DataTableColumnNode[]): string[] => nodes.flatMap(
  node => (node.children == null ? [node.key] : leafKeysOf(node.children)),
)

// What a sortable small bordered cell spends before the label: padding and border either side, sorter and its gap.
const chromeWidth = (token: GlobalToken): number => (
  ((token.paddingXS + token.lineWidth) * 2) + token.marginXXS + token.fontSizeIcon
)

const getTextWidth = (text: string, token: GlobalToken): number => {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  if (!context) return 100

  context.font = `${token.fontWeightStrong} ${token.fontSize}px ${token.fontFamily}`
  const width = Math.ceil(context.measureText(text).width) + chromeWidth(token)
  canvas.remove()

  return width
}

export function createSortedTableColumns (
  campaignFactorData: CampaignFactorGroupType[],
  handleAction: (actions: string, subject)=> void,
  getSortOrder, meta,
  getFilteredValue,
  token: GlobalToken,
): ColumnsType<DataType> {
  const allFactors = _.flatMap(campaignFactorData, 'campaignFactors')
  const sortedGroupColumns: ColumnsType<DataType> = _.sortBy(campaignFactorData, 'position').map((group, index) => {
    const even = index % 2 === 0
    const factors = _.sortBy(group.campaignFactors, 'position')
    return ({
      title: group.name,
      key: `group_${group.id}`,
      children: factors.map((factor, factorIndex) => ({
        title: factor.name,
        dataIndex: `${factor.id}`,
        key: `${factor.id}`,
        width: getTextWidth(factor.name, token),
        sorter: true,
        sortOrder: getSortOrder(`${factor.id}`),
        className: cs(factorIndex === 0 ? styles.columnBorderStart : null,
          factorIndex === factors.length - 1 ? styles.columnBorderEnd : null,
          even ? styles.evenGroup : styles.oddGroup),
      })),
      className: cs(styles.columnBorderEnd, styles.columnBorderStart, even ? styles.evenGroup : styles.oddGroup),
    })
  })

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
        { text: 'Active', value: 'true' },
        { text: 'Inactive', value: 'false' },
      ],
      filteredValue: getFilteredValue('campaign_users_active_in'),
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
          const content = subject.errors.map((error) => {
            const factor = allFactors.find(factor => factor.id === error.factorId)
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

  if (_.some(allFactors, 'ranked')) {
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
