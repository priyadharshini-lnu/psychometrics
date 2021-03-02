import React, { useEffect } from 'react'
import {
  Dropdown, Table, Tooltip, Menu, Row, Col, Input, Select, Pagination, Avatar,
} from 'antd'
import cs from 'classnames'
import { Link } from 'react-router-dom'
import withEnhancedTable from 'modules/admin/hoc/withEnhancedTable'
import { TableConfig } from 'modules/admin/core/filterAndPagination/interfaces'
import { MoreOutlined, AppstoreOutlined } from '@ant-design/icons'
import _ from 'lodash'
import moment from 'moment'
import { STATUSES, DEFAULT_PAGE_SIZE, TYPES } from 'constants/campaign'
import Campaign from 'modules/admin/modules/campaigns/interfaces/Campaign'
import Modals from 'modules/admin/components/Modals/'
import array from 'utils/array'
import { CampaignPolicy } from 'modules/admin/modules/campaigns/policies/CampaignPolicy'
import User from 'modules/admin/modules/campaigns/interfaces/User'
import styles from './styles.scss'
import CreateCampaignDropdown from './CreateCampaignDropdown'
import CommonCampaignFormModal from './CommonCampaignFormModal'
import RemoveCampaignModal from './RemoveCampaignModal'
import ThreesixtyCampaignFormModal from '../CampaignList/ThreesixtyCampaignFormModal'
import Breadcrumb from '../../components/Breadcrumb'

const MODALS = {
  CommonCampaignFormModal,
  ThreesixtyCampaignFormModal,
  RemoveCampaignModal,
}

const { I18n } = window

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
  currentUser: User
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
  currentUser,
}) => {
  useEffect(() => {
    fetch(projectId, tableConfig)
  }, [tableConfig])

  const handleStatusChange = (value: string): void => {
    if (value === 'All') { return removeFilter('statusEq') }

    changeFilter('statusEq', value)
  }

  const handleTypeChange = (value: string): void => {
    if (value === 'All') { return removeFilter('typeEq') }

    changeFilter('typeEq', value)
  }

  return (
    <div>
      <Breadcrumb
        request={{
          fields: ['project', 'client'],
          data: {
            projectId: parseInt(projectId, 10),
          },
        }}
        crumbs={[{
          link: () => '/administration',
          label: () => I18n.t('administration.clients.tenancies'),
        }, {
          link: state => `/administration/clients/${state.client.id}/projects`,
          label: state => state.client.name,
        }, {
          label: state => state.project.name,
        }]}
      />
      <Row justify="space-between" className="pm">
        <Col span={4} className="pls">
          <AppstoreOutlined style={{ fontSize: '16px' }} />
          <span className="mlm">{`${total} Campaigns`}</span>
        </Col>
        <div className="float-r">
          <span className={styles.filterLabel}>Type:</span>
          <Select
            defaultValue="All"
            value={filters.typeEq || 'All'}
            className={cs(styles.typeFilter, 'mrm')}
            onChange={handleTypeChange}
          >
            <Option value="All" key="All">All</Option>
            {_.map(TYPES, (val: string) => <Option value={val} key={val}>{_.capitalize(val)}</Option>)}
          </Select>
          <span className={styles.filterLabel}>Status:</span>
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
          {CampaignPolicy.canCreate(currentUser) && (
          <div className={styles.newCampaignButton}>
            <CreateCampaignDropdown openModal={openModal} projectId={projectId} />
          </div>
          )}
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
              render={({ name, isThreesixty, campaignUrl }) => (
                isThreesixty ? <a href={campaignUrl}>{name}</a> : <Link to={campaignUrl}>{name}</Link>
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
              render={({ status }) => _.capitalize(status)}
            />
            <Column
              title={I18n.t('administration.campaigns.listing.type')}
              key="type"
              render={({ type }) => _.capitalize(type)}
            />
            <Column
              title={I18n.t('administration.campaigns.listing.assessments')}
              key="assessments"
              render={({ assessments }) => <ResourcesTag resources={assessments} type="assessments" />}
            />
            <Column
              title={I18n.t('administration.campaigns.listing.reports')}
              key="reports"
              render={({ reports }) => <ResourcesTag resources={reports} type="reports" />}
            />
            <Column
              title={I18n.t('administration.campaigns.actions')}
              key="action"
              render={campaign => (
                <Dropdown
                  overlay={() => (
                    ActionsMenu({
                      onEdit: () => {
                        openModal('CommonCampaignFormModal', {
                          projectId,
                          campaign: {
                            ...campaign,
                            startDate: campaign.startDate && moment(campaign.startDate),
                            endDate: campaign.endDate && moment(campaign.endDate),
                          },
                        })
                      },
                      onDelete: () => { openModal('RemoveCampaignModal', { projectId, campaign }) },
                    }) as React.ReactElement
                  )}
                  trigger={['click']}
                >
                  <a>
                    <MoreOutlined />
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

const ResourcesTag: React.FC<ResourcesProps> = ({ resources, type }) => {
  const tags = () => (
    resources.map((resource: Resource) => (
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
    ))
  )

  return (
    <>
      {array.joinJSXElements(tags(), ' ')}
    </>
  )
}

interface ActionMenuProps {
  onEdit(): void
  onDelete(): void
}

const ActionsMenu: React.FC<ActionMenuProps> = ({ onEdit, onDelete }) => (
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
      <div
        role="button"
        tabIndex={-1}
        onClick={onDelete}
      >
        Delete
      </div>
    </Menu.Item>
  </Menu>
)

export default withEnhancedTable(CampaignList, 'campaignList', { maintainHistory: true })
