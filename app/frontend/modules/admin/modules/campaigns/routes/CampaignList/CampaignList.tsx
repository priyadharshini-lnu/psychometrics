import React, { useEffect } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { Link, useParams } from 'react-router-dom'
import {
  Table,
  MenuProps,
  Row,
  Col,
  Input,
  Pagination,
  Avatar,
  Space,
} from 'antd'
import { ItemType } from 'antd/lib/menu/hooks/useItems'
import { MoreOutlined } from '@ant-design/icons'
import capitalize from 'lodash/capitalize'
import map from 'lodash/map'
import dayjs from '~/utils/dayjs'
import { ResourceAvatar } from '~/glint'

import {
  fetch,
  FETCH,
  get as getCampaign,
  remove,
} from '~/modules/admin/modules/campaigns/core/list'
import { openModal } from '~/modules/admin/core/ui/modals'
import { get as getTotal } from '~/modules/admin/modules/campaigns/core/total'
import { get as getPermissions } from '~/modules/admin/modules/campaigns/core/permissions'
import { RootState } from '~/modules/admin/core/rootReducers'
import Campaign from '~/modules/admin/modules/campaigns/interfaces/Campaign'
import { TableProps } from '~/modules/admin/hoc/withEnhancedTable/interfaces'
import {
  STATUSES,
  DEFAULT_PAGE_SIZE,
  TYPES,
  FILTER_PREDICATES,
} from '~/constants/campaign'
import withEnhancedTable from '~/modules/admin/hoc/withEnhancedTable'
import Modals from '~/modules/admin/components/Modals/'
import ConditionalDropdown from '~/components/ConditionalDropdown'
import { CountDisplay } from '~/components/CountDisplay'
import { isRequestInProgress } from '~/core/request'
import { get as getCurrentUser } from '~/core/currentUser'
import ThreesixtyCampaignFormModal from '../CampaignList/ThreesixtyCampaignFormModal'
import RemoveCampaignModal from './RemoveCampaignModal'
import CommonCampaignFormModal from './CommonCampaignFormModal'
import CreateCampaignDropdown from './CreateCampaignDropdown'
import { PDFPasswordModal } from './PDFPasswordModal'
import ToolsDropdown from './ToolsDropdown'

const MODALS = {
  CommonCampaignFormModal,
  ThreesixtyCampaignFormModal,
  RemoveCampaignModal,
  PDFPasswordModal,
}

const { I18n } = window

const { Column } = Table
const { Search } = Input
const MAX_AVATARS = 2

const connector = connect(
  (state: RootState) => ({
    list: getCampaign(state),
    isLoading: isRequestInProgress(state, FETCH),
    total: getTotal(state),
    permissions: getPermissions(state),
    currentUser: getCurrentUser(state),
  }),
  {
    fetch,
    openModal,
    remove,
  },
)

type PropsFromRedux = ConnectedProps<typeof connector>

type Props = PropsFromRedux & TableProps

const CampaignListComponent: React.FC<Props> = ({
  fetch,
  isLoading,
  list,
  total,
  permissions,
  tableConfig: { filters, page, pageSize },
  getFilteredValue,
  tableConfig,
  changeFilter,
  onTableChange,
  getSortOrder,
  changePage,
  openModal,
}) => {
  const params = useParams() as { projectId: string }
  const projectId = parseInt(params.projectId, 10)

  useEffect(() => {
    fetch(projectId, tableConfig)
  }, [tableConfig])

  const showPDFPasswordModal = (campaignId: number) => {
    openModal('PDFPasswordModal', { projectId, campaignId })
  }

  return (
    <div>
      <Row
        justify="space-between"
        align="middle"
        className="pt-4 pb-4 ps-4 pe-4"
      >
        <Col>
          <CountDisplay
            selectedCount={0}
            totalCount={total}
            isLoading={isLoading}
          />
        </Col>
        <Col>
          <Space>
            <Search
              placeholder="Search"
              value={filters.filterableFields}
              onChange={e => changeFilter('filterableFields', e.target.value)}
            />
            <ToolsDropdown />
            {permissions.create && (
              <CreateCampaignDropdown
                openModal={openModal}
                projectId={projectId}
              />
            )}
          </Space>
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <Table
            rowKey={row => row?.id ?? -1}
            dataSource={list}
            onChange={onTableChange}
            pagination={false}
            loading={isLoading}
          >
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
              render={({ name, isThreesixty, campaignUrl }) => (isThreesixty ? (
                <a href={campaignUrl}>{name}</a>
              ) : (
                <Link to={campaignUrl}>{name}</Link>
              ))}
            />
            <Column
              title={I18n.t('administration.dates.start')}
              key="startDate"
              sorter
              sortOrder={getSortOrder('startDate')}
              render={({ startDate }) => (startDate ? dayjs(startDate).format('L LT') : ' - ')
              }
            />
            <Column
              title={I18n.t('administration.dates.end')}
              key="endDate"
              sorter
              sortOrder={getSortOrder('endDate')}
              render={({ endDate }) => (endDate ? dayjs(endDate).format('L LT') : ' - ')
              }
            />
            <Column
              title={I18n.t('administration.campaigns.listing.status')}
              key="status"
              render={({ status }) => capitalize(status)}
              filterMultiple={false}
              filters={map(STATUSES, status => ({
                text: capitalize(status),
                value: status,
              }))}
              filteredValue={getFilteredValue('statusEq')}
            />
            <Column
              title={I18n.t('administration.campaigns.listing.type')}
              key="type"
              render={({ type }) => capitalize(type)}
              filterMultiple={false}
              filters={map(TYPES, type => ({
                text: capitalize(type),
                value: type,
              }))}
              filteredValue={getFilteredValue('type')}
            />
            <Column
              title={I18n.t('administration.campaigns.listing.assessments')}
              key="assessments"
              render={({ assessments }) => (
                <ResourcesTag resources={assessments} />
              )}
            />
            <Column
              title={I18n.t('administration.campaigns.listing.reports')}
              key="reports"
              render={({ reports }) => <ResourcesTag resources={reports} />}
            />
            <Column
              title={I18n.t('administration.campaigns.actions')}
              key="action"
              render={campaign => (
                <ConditionalDropdown
                  menu={
                    getActionsMenuProps({
                      onEdit: () => {
                        openModal('CommonCampaignFormModal', {
                          projectId,
                          campaign: {
                            ...campaign,
                            startDate:
                              campaign.startDate && dayjs(campaign.startDate),
                            endDate:
                              campaign.endDate && dayjs(campaign.endDate),
                          },
                        })
                      },
                      onDelete: () => {
                        openModal('RemoveCampaignModal', {
                          projectId,
                          campaign,
                        })
                      },
                      showPDFPasswordModal,
                      campaign,
                    })
                  }
                  innerElement={(
                    <a>
                      <MoreOutlined />
                    </a>
                  )}
                />
              )}
            />
          </Table>
        </Col>
      </Row>
      <div className="pl">
        <Pagination
          current={page}
          pageSize={pageSize || DEFAULT_PAGE_SIZE}
          total={total}
          onChange={changePage}
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
}

const ResourcesTag: React.FC<ResourcesProps> = ({ resources }) => (
  <Avatar.Group maxCount={MAX_AVATARS}>
    {resources.map((resource: Resource) => (
      <ResourceAvatar
        key={resource.id}
        tooltip={resource.name}
        url={resource.iconUrl}
        color={resource.iconColor}
        name={resource.name}
      />
    ))}
  </Avatar.Group>
)

interface ActionMenuData {
  onEdit(): void
  onDelete(): void
  campaign: Campaign
  showPDFPasswordModal: (campaignId: number) => void
}

const getActionsMenuProps = ({
  onEdit,
  onDelete,
  campaign,
  showPDFPasswordModal,
}: ActionMenuData): MenuProps => {
  const { permissions } = campaign

  const menuItems: ItemType[] = []
  permissions.edit && menuItems.push({
    key: 'edit',
    label: 'Edit',
  })
  permissions.copy && menuItems.push({
    key: 'copy',
    label: 'Copy',
  })
  permissions.delete && menuItems.push({
    key: 'delete',
    label: 'Delete',
  })

  permissions.pdfPassword && menuItems.push({
    key: 'pdfPassword',
    label: I18n.t('administration.campaigns.pdf_password'),
  })

  const handleMenuClick = ({ key }) => {
    if (key === 'edit') {
      return onEdit()
    }
    if (key === 'delete') {
      return onDelete()
    }
    if (key === 'pdfPassword') {
      return showPDFPasswordModal(campaign.id)
    }
  }

  return ({ items: menuItems, onClick: handleMenuClick })
}

export const CampaignList = withEnhancedTable<{}>(
  connector(CampaignListComponent),
  'campaignList',
  {
    maintainHistory: true,
    filterPredicates: FILTER_PREDICATES,
  },
)
