import React, { useEffect } from 'react'
import {
  Dropdown, Table, Tooltip, Menu, Row, Col, Input, Select, Pagination, Avatar,
} from 'antd'
import { Link } from 'react-router-dom'
import withEnhancedTable from 'modules/admin/core/hoc/withEnhancedTable'
import { TableConfig } from 'modules/admin/filterAndPagination/interfaces'
import { EllipsisOutlined, AppstoreOutlined } from '@ant-design/icons'
import _ from 'lodash'
import { STATUSES, DEFAULT_PAGE_SIZE } from 'constants/campaign'
import { Campaign } from 'modules/admin/modules/campaigns/core/list'
import Modals from 'modules/admin/components/Modals/'
import styles from './styles.scss'
import CreateCampaignDropdown from './CreateCampaignDropdown'
import CommonCampaignFormModal from '../CampaignList/CommonCampaignFormModal'
import ThreesixtyCampaignFormModal from '../CampaignList/ThreesixtyCampaignFormModal'

const MODALS = {
  CommonCampaignFormModal,
  ThreesixtyCampaignFormModal,
}

const { Column } = Table
const { Search } = Input
const { Option } = Select

interface Props {
  fetch(projectId: string, tableConfig: TableConfig): void
  list: Campaign[],
  total: number,
  match: {
    params: {
      projectId: string
    }
  }
  tableConfig: TableConfig
  changeFilter(filtername: string, filterValue: string): void
  removeFilter(filtername: string): void
  onTableChange(): void
  getSortOrder(column: string): 'descend' | 'ascend'
  changePage(page: number): void
  openModal(name: string, data?: { projectId: string, campaign: object }): void
}

const CampaignList: React.FC<Props> = ({
  fetch,
  list,
  total,
  match: { params: { projectId } },
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
  openModal,
}) => {
  useEffect(() => {
    fetch(projectId, tableConfig)
  }, [tableConfig])

  const handleStatusChange = (value: string): void => {
    if (value === 'All') { return removeFilter('statusEq') }

    changeFilter('statusEq', value)
  }

  return (
    <div>
      <Row justify="space-between" className="pm">
        <Col span={4} className="pls">
          <AppstoreOutlined style={{ fontSize: '16px' }} />
          <span className="mlm">{`${total} Campaigns`}</span>
        </Col>
        <div className="float-r">
          <Select
            defaultValue="All"
            value={filters.statusEq || 'All'}
            className={styles.statusFilter}
            onChange={handleStatusChange}
          >
            <Option value="All" key="All">All</Option>
            {_.map(STATUSES, (val: string) => <Option value={val} key={val}>{_.capitalize(val)}</Option>)}
          </Select>
          <Search
            placeholder="Search"
            className={styles.searchInput}
            value={filters.filterableFields}
            onChange={e => changeFilter('filterableFields', e.target.value)}
          />
          <div className={styles.newCampaignButton}>
            <CreateCampaignDropdown openModal={openModal} projectId={projectId} />
          </div>
        </div>
      </Row>
      <Row>
        <Col span={24}>
          <Table className="mtm" rowKey="id" dataSource={list} onChange={onTableChange} pagination={false}>
            <Column
              title="Id"
              dataIndex="id"
              key="id"
              sorter
              sortOrder={getSortOrder('id')}
            />
            <Column
              title="Name"
              key="name"
              sorter
              sortOrder={getSortOrder('name')}
              render={({ name, id }) => (
                <Link to={`/administration/projects/${projectId}/new_campaigns/${id}`}>
                  {name}
                </Link>
              )}
            />
            <Column
              title="Type"
              key="type"
              render={({ type }) => _.capitalize(type)}
            />
            <Column
              title="Assessments"
              key="assessments"
              render={({ assessments }) => <ResourcesTag resources={assessments} type="assessments" />}
            />
            <Column
              title="Reports"
              key="reports"
              render={({ reports }) => <ResourcesTag resources={reports} type="reports" />}
            />
            <Column
              title="Action"
              key="action"
              render={campaign => (
                <Dropdown
                  overlay={() => (
                    <ActionsMenu
                      onEdit={() => openModal('CommonCampaignFormModal', { projectId, campaign })}
                    />
                  )}
                  trigger={['click']}
                >
                  <a>
                    <EllipsisOutlined />
                  </a>
                </Dropdown>
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
      <Modals modals={MODALS} />
    </div>
  )
}

interface Resource {
  id: string
  name: string
  iconColor: string
  iconUrl: string
}

interface ResourcesProps {
  resources: Resource[]
  type: string
}

const ResourcesTag: React.FC<ResourcesProps> = ({ resources, type }) => (
  <>
    {resources.map((resource: Resource) => (
      <Tooltip placement="top" title={resource.name} key={resource.id}>
        <a href={`/administration/${type}/${resource.id}`} target="_blank" rel="noopener noreferrer">
          {resource.iconUrl ? (
            <Avatar src={resource.iconUrl} />
          ) : (
            <Avatar
              style={{
                backgroundColor: resource.iconColor,
              }}
            >
              {resource.name.substring(0, 2)}
            </Avatar>
          )}
        </a>
      </Tooltip>
    ))}
  </>
)

interface ActionMenuProps {
  onEdit(): void
}

const ActionsMenu: React.FC<ActionMenuProps> = ({ onEdit }) => (
  <Menu>
    <Menu.Item key="edit">
      <div
        role="button"
        tabIndex={-1}
        onClick={onEdit}
      >
          Edit
      </div>
    </Menu.Item>
    <Menu.Item key="copy">
        Copy
    </Menu.Item>
    <Menu.Item key="delete">
        Delete
    </Menu.Item>
  </Menu>
)

export default withEnhancedTable(CampaignList, 'tableName', { maintainHistory: true })
