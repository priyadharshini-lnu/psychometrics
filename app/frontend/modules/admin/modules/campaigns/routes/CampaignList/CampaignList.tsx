import React, { useEffect } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { Link, useParams } from 'react-router-dom'
import {
  Table,
  MenuProps,
  Input,
  Avatar,
  Tag,
  Space,
} from 'antd'
import map from 'lodash/map'
import { MenuItem } from '~/interfaces/Antd'
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
import { TableLayout } from '~/modules/admin/components/TableLayout'
import { isRequestInProgress } from '~/core/request'
import { get as getCurrentUser } from '~/core/currentUser'
import ThreesixtyCampaignFormModal from '../CampaignList/ThreesixtyCampaignFormModal'
import RemoveCampaignModal from './RemoveCampaignModal'
import CopyCampaignModal from './CopyCampaignModal'
import CommonCampaignFormModal from './CommonCampaignFormModal'
import CreateCampaignDropdown from './CreateCampaignDropdown'
import { PDFPasswordModal } from './PDFPasswordModal'
import ToolsDropdown from './ToolsDropdown'
import { UserFilterModal } from '../Campaign/routes/Participants/Subjects/UserFilterModal'
import ConvertOrCopyAsTemplateModal from
  '~/modules/admin/modules/threeSixtyCampaign/routes/Participants/ConvertOrCopyAsTemplateModal'
import { CampaignTagFilter } from './CampaignTagFilter'
import BulkImportCampaignTranslationsModal from './BulkImportCampaignTranslationsModal'

const MODALS = {
  CommonCampaignFormModal,
  ThreesixtyCampaignFormModal,
  RemoveCampaignModal,
  PDFPasswordModal,
  CopyCampaignModal,
  UserFilterModal,
  ConvertOrCopyAsTemplateModal,
  BulkImportCampaignTranslationsModal,
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
  removeFilter,
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

  const displayableType = (type: string) => I18n.t(`admin.campaigns_types_${type}`)

  const CampaignsTable = (
    <Table
      rowKey={row => row?.id ?? -1}
      dataSource={list}
      onChange={onTableChange}
      pagination={false}
      scroll={{ x: 'max-content' }}
      sticky
    >
      <Column
        title={I18n.t('shared.id')}
        dataIndex="id"
        fixed="left"
        key="id"
        sorter
        sortOrder={getSortOrder('id')}
        width={100}
      />
      <Column
        title={I18n.t('shared.name')}
        key="name"
        sorter
        sortOrder={getSortOrder('name')}
        render={({
          name, campaignUrl, isTemplate, tagList,
        }) => (
          <div>
            <Link to={campaignUrl}>{name}</Link>
            {(isTemplate || tagList?.length > 0) && (
              <div>
                {isTemplate && (
                  <Tag color="gold">
                    {I18n.t('admin.campaigns_listing_template')}
                  </Tag>
                )}
                {tagList?.map((tag: string) => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
              </div>
            )}
          </div>
        )}
        minWidth={150}
      />
      <Column
        title={I18n.t('admin.dates_start')}
        key="startDate"
        sorter
        sortOrder={getSortOrder('startDate')}
        render={({ startDate }) => (
          <div style={{ minWidth: 150 }}>
            {startDate ? dayjs(startDate).format('L LT') : ' - '}
          </div>
        )}
        minWidth={150}
      />
      <Column
        title={I18n.t('admin.dates_end')}
        key="endDate"
        sorter
        sortOrder={getSortOrder('endDate')}
        render={({ endDate }) => (
          <div style={{ minWidth: 150 }}>
            {endDate ? dayjs(endDate).format('L LT') : ' - '}
          </div>
        )}
      />
      <Column
        title={I18n.t('shared.status')}
        key="status"
        render={({ status }) => (
          <div style={{ minWidth: 100 }}>
            {I18n.t(`admin.campaigns_filters_${status}`)}
          </div>
        )}
        filterMultiple={false}
        filters={map(STATUSES, status => ({
          text: I18n.t(`admin.campaigns_filters_${status}`),
          value: status,
        }))}
        filteredValue={getFilteredValue('statusEq')}
      />
      <Column
        title={I18n.t('shared.type')}
        key="type"
        render={({ type }) => (
          <div style={{ minWidth: 100 }}>
            {displayableType(type)}
          </div>
        )}
        filterMultiple={false}
        filters={map(TYPES, type => ({
          text: displayableType(type),
          value: type,
        }))}
        filteredValue={getFilteredValue('type')}
      />
      <Column
        title={I18n.t('admin.campaigns_listing_assessments')}
        key="assessments"
        render={({ assessments }) => (
          <div style={{ minWidth: 150 }}>
            <ResourcesTag resources={assessments} />
          </div>
        )}
      />
      <Column
        title={I18n.t('admin.campaigns_listing_reports')}
        key="reports"
        render={({ reports }) => (
          <div style={{ minWidth: 150 }}>
            <ResourcesTag resources={reports} />
          </div>
        )}
      />
      <Column
        title={I18n.t('shared.actions')}
        key="action"
        fixed="right"
        width={100}
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
                onCopy: () => {
                  openModal('CopyCampaignModal', {
                    projectId,
                    campaign,
                    onSuccess: () => fetch(projectId, tableConfig),
                  })
                },
                onConvert: () => {
                  openModal('ConvertOrCopyAsTemplateModal', {
                    visible: true,
                    campaignId: campaign.id,
                    projectId,
                  })
                },
                showPDFPasswordModal,
                campaign,
              })
            }
          />
        )}
      />
    </Table>
  )

  const Filter = (
    <Space>
      <CampaignTagFilter
        changeFilter={changeFilter}
        removeFilter={removeFilter}
      />
      <Search
        placeholder={I18n.t('common.actions.search')}
        value={filters.filterableFields}
        onChange={e => changeFilter('filterableFields', e.target.value)}
      />
      <ToolsDropdown openModal={openModal} />
      {permissions.create && (
        <CreateCampaignDropdown
          openModal={openModal}
          projectId={projectId}
        />
      )}
    </Space>
  )

  return (
    <div>
      <TableLayout
        loading={isLoading}
        table={CampaignsTable}
        filters={Filter}
        title={I18n.t('admin.campaigns')}
        pagination={{
          page,
          pageSize: pageSize || DEFAULT_PAGE_SIZE,
          total,
          onChange: changePage,
        }}
        recordCount={total}
      />
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
  <Avatar.Group max={{ count: MAX_AVATARS }}>
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
  onCopy(): void
  onConvert(): void
  campaign: Campaign
  showPDFPasswordModal: (campaignId: number) => void
}

const getActionsMenuProps = ({
  onEdit,
  onDelete,
  onConvert,
  onCopy,
  campaign,
  showPDFPasswordModal,
}: ActionMenuData): MenuProps => {
  const { permissions } = campaign

  const menuItems: MenuItem[] = []
  permissions.edit && menuItems.push({
    key: 'edit',
    label: I18n.t('shared.edit'),
  })
  permissions.copy && !campaign.isThreesixty && menuItems.push({
    key: 'copy',
    label: I18n.t('shared.copy'),
  })
  permissions.delete && menuItems.push({
    key: 'delete',
    label: I18n.t('shared.delete'),
  })

  permissions.pdfPassword && menuItems.push({
    key: 'pdfPassword',
    label: I18n.t('admin.campaigns_pdf_password'),
  })

  campaign.isThreesixty && !campaign.isTemplate && permissions.convertToTemplate && menuItems.push({
    key: 'convert_to_template',
    label: I18n.t('admin.campaigns_convert_to_template'),
  })

  const handleMenuClick = ({ key }) => {
    if (key === 'edit') {
      return onEdit()
    }
    if (key === 'copy') {
      return onCopy()
    }
    if (key === 'delete') {
      return onDelete()
    }
    if (key === 'pdfPassword') {
      return showPDFPasswordModal(campaign.id)
    }
    if (key === 'convert_to_template') {
      return onConvert()
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
