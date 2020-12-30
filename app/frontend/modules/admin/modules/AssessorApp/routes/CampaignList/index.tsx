
import React, { useEffect } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { get as getCampaigns, fetch } from 'modules/admin/modules/AssessorApp/core/campaigns'
import {
  Table, Row, Col, Input, Select, Pagination,
} from 'antd'
import map from 'lodash/map'
import capitalize from 'lodash/capitalize'
import { AppstoreOutlined } from '@ant-design/icons'
import { STATUSES, DEFAULT_PAGE_SIZE } from 'constants/campaign'
import moment from 'moment'
import { Link } from 'react-router-dom'
import { RootState } from 'modules/admin/core/rootReducers'
import withEnhancedTable from 'modules/admin/hoc/withEnhancedTable'
import { TableConfig } from 'modules/admin/core/filterAndPagination/interfaces'
import styles from './styles.scss'

const connecter = connect(
  (state: RootState) => ({
    campaigns: getCampaigns(state),
  }),
  {
    fetch,
  },
)

export type PropsFromRedux = ConnectedProps<typeof connecter>
interface OwnProps {
  tableConfig: TableConfig
  changeFilter(filterName: string, filterValue: string): void
  removeFilter(filterName: string): void
  onTableChange(): void
  getSortOrder(column: string): 'descend' | 'ascend'
  changePage(page: number): void
}

type Props = OwnProps & PropsFromRedux

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
  useEffect(() => {
    fetch(tableConfig)
  }, [tableConfig])

  const handleStatusChange = (value: string): void => {
    if (value === 'All') { return removeFilter('statusEq') }

    changeFilter('statusEq', value)
  }

  return (
    <>
      <Row justify="space-between" className="pm">
        <Col span={4} className="pls">
          <AppstoreOutlined style={{ fontSize: '16px' }} />
          <span className="mlm">{`${total} Campaigns`}</span>
        </Col>
        <div className="float-r">
          <Search
            placeholder="Search"
            className={styles.searchInput}
            value={filters.filterableFields}
            onChange={e => changeFilter('filterableFields', e.target.value)}
          />
          <span className={styles.filterLabel}>Status:</span>
          <Select
            defaultValue="All"
            value={filters.statusEq || 'All'}
            className={styles.statusFilter}
            onChange={handleStatusChange}
          >
            <Option value="All" key="All">All</Option>
            {map(STATUSES, (val: string) => <Option value={val} key={val}>{capitalize(val)}</Option>)}
          </Select>
        </div>
      </Row>
      <Row>
        <Col span={24}>
          <Table className="mtm" rowKey="id" dataSource={list} onChange={onTableChange} pagination={false}>
            <Column
              title={I18n.t('administration.campaigns.listing.id')}
              dataIndex="id"
              key="id"
              sorter
              sortOrder={getSortOrder('id')}
            />
            <Column
              title={I18n.t('administration.campaigns.listing.name')}
              key="name"
              sorter
              sortOrder={getSortOrder('name')}
              render={({ name, campaignUrl }) => (
                <Link to={campaignUrl}>{name}</Link>
              )}
            />
            <Column
              title={I18n.t('administration.dates.start')}
              key="startDate"
              sorter
              sortOrder={getSortOrder('startDate')}
              render={({ startDate }) => (startDate ? moment(startDate).format('L LT') : ' - ')}
            />
            <Column
              title={I18n.t('administration.dates.end')}
              key="endDate"
              sorter
              sortOrder={getSortOrder('endDate')}
              render={({ endDate }) => (endDate ? moment(endDate).format('L LT') : ' - ')}
            />
            <Column
              title={I18n.t('administration.campaigns.listing.status')}
              key="status"
              render={({ status }) => capitalize(status)}
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

export default withEnhancedTable(connecter(CampaignList), 'assessorsCampaignList', { maintainHistory: true })
