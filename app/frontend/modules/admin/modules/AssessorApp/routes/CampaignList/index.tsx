
import React, { useEffect } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import {
  Table, Row, Col, Input, Select, Pagination, Typography,
} from 'antd'
import map from 'lodash/map'
import capitalize from 'lodash/capitalize'
import { useNavigate } from 'react-router-dom'
import { AppstoreOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import dayjs from '~/utils/dayjs'
import { STATUSES, DEFAULT_PAGE_SIZE } from '~/constants/campaign'
import { get as getCampaigns, fetch } from '~/modules/admin/modules/AssessorApp/core/campaigns'
import { RootState } from '~/modules/admin/core/rootReducers'
import withEnhancedTable from '~/modules/admin/hoc/withEnhancedTable'
import { TableProps } from '~/modules/admin/hoc/withEnhancedTable/interfaces'
import styles from './styles.less'
import { DocumentTitle } from '~/components/DocumentTitle'

const connecter = connect(
  (state: RootState) => ({
    campaigns: getCampaigns(state),
  }),
  {
    fetch,
  },
)

export type PropsFromRedux = ConnectedProps<typeof connecter>
type Props = TableProps & PropsFromRedux

const { Column } = Table
const { Search } = Input
const { Option } = Select
const { I18n } = window

const CampaignList: React.FC<Props> = (
  {
    campaigns: { list, total },
    fetch,
    tableConfig: {
      filters,
      page,
    },
    tableConfig,
    changeFilter,
    removeFilter,
    onTableChange,
    getSortOrder,
    changePage,
  },
) => {
  const navigate = useNavigate()

  useEffect(() => {
    fetch(tableConfig)
  }, [tableConfig])

  const handleStatusChange = (value: string): void => {
    if (value === 'All') { return removeFilter('statusEq') }

    changeFilter('statusEq', value)
  }

  return (
    <>
      <DocumentTitle text={I18n.t('campaign.campaigns')} />
      <Row justify="space-between" className="pm">
        <Col span={4} className="pls">
          <AppstoreOutlined style={{ fontSize: '16px' }} />
          <span className="mlm">{`${total} ${I18n.t('campaign.campaigns')}`}</span>
        </Col>
        <div className="float-r">
          <Search
            placeholder={I18n.t('shared.search')}
            className={styles.searchInput}
            value={filters.filterableFields}
            onChange={e => changeFilter('filterableFields', e.target.value)}
          />
          <span className={styles.filterLabel}>{I18n.t('admin.campaigns_filters_status')}</span>
          <Select
            defaultValue="All"
            value={filters.statusEq || 'All'}
            className={styles.statusFilter}
            onChange={handleStatusChange}
          >
            <Option value="All" key="All">{I18n.t('admin.campaigns_filters_all')}</Option>
            {map(STATUSES, (val: string) => (
              <Option value={val} key={val}>
                {I18n.t(`admin.campaigns_filters_${val}`)}
              </Option>
            ))}
          </Select>
        </div>
      </Row>
      <Row>
        <Col span={24}>
          <Table
            className="mtm"
            rowKey="id"
            dataSource={list}
            onChange={onTableChange}
            pagination={false}
            onRow={record => ({
              onClick: () => {
                navigate(`/assessors/campaigns/${record.id}/users`)
              },
              className: styles.clickableRow,
            })}
          >
            <Column
              title={I18n.t('shared.id')}
              dataIndex="id"
              key="id"
              sorter
              sortOrder={getSortOrder('id')}
            />
            <Column
              title={I18n.t('shared.name')}
              key="name"
              sorter
              sortOrder={getSortOrder('name')}
              render={({ name }) => (
                <Typography.Link>{name}</Typography.Link>
              )}
            />
            <Column
              title={I18n.t('admin.dates_start')}
              key="startDate"
              sorter
              sortOrder={getSortOrder('startDate')}
              render={({ startDate }) => (startDate ? dayjs(startDate).format('L LT') : ' - ')}
            />
            <Column
              title={I18n.t('admin.dates_end')}
              key="endDate"
              sorter
              sortOrder={getSortOrder('endDate')}
              render={({ endDate }) => (endDate ? dayjs(endDate).format('L LT') : ' - ')}
            />
            <Column
              title={I18n.t('shared.status')}
              key="status"
              render={({ status }) => capitalize(status)}
            />
            <Column
              title={I18n.t('assessors.campaigns_list.column.evaluation_status')}
              key="completion_status"
              render={({ evaluationCompletionStatus }) => (
                I18n.t(`admin.assessor_campaigns_statuses_${evaluationCompletionStatus}`)
              )}
            />
            <Column
              title={I18n.t('assessors.campaigns_list.column.evaluation_count')}
              key="completionCount"
              render={({ completedSubjectEvaluationCount, totalSubjectEvaluationCount }) => (
                `${completedSubjectEvaluationCount} / ${totalSubjectEvaluationCount}`
              )}
            />
            <Column
              title={I18n.t('assessors.campaigns_list.column.moderation_status')}
              key="moderationStatus"
              render={({ moderationCompletionStatus }) => (
                I18n.t(`admin.assessor_campaigns_statuses_${moderationCompletionStatus}`)
              )}
            />
            <Column
              title={I18n.t('assessors.campaigns_list.column.moderation_count')}
              key="moderationCount"
              render={({ completedSubjectModerationCount, totalSubjectModerationCount }) => (
                `${completedSubjectModerationCount} / ${totalSubjectModerationCount}`
              )}
            />
          </Table>
        </Col>
      </Row>
      <div className="pl">
        <Pagination
          current={page}
          pageSize={DEFAULT_PAGE_SIZE}
          total={total}
          onChange={changePage}
          hideOnSinglePage
        />
      </div>
    </>
  )
}

export default withEnhancedTable<{}>(connecter(CampaignList), 'assessorsCampaignList', { maintainHistory: true })
