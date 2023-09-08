import React, { useEffect } from 'react'
import _ from 'lodash'
import { connect, ConnectedProps } from 'react-redux'
import {
  Row, Col,
  Table,
  Space,
  Button,
  Input,
  Modal,
  message,
  Pagination,
} from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import {
  Link, useParams, useLocation, useHistory,
} from 'react-router-dom'
import { get as getCurrentUser, isSuperAdmin } from '~/core/currentUser'
import { openModal } from '~/modules/admin/core/ui/modals'
import { useResources } from '~/hooks/useResources'
import { BaseMeta } from '~/hooks/useResources/interfaces'
import { RootState } from '~/modules/admin/core/rootReducers'
import { CountDisplay } from '~/components/CountDisplay'
import {
  ProjectAdmin, Admin, AdminPermissions, CurrentUserPermissions, AdminListingTR,
} from '~/modules/admin/modules/client/core/admin'
import { getCampaignId } from '~/modules/admin/modules/threeSixtyCampaign/core/campaignDetails'
import { ResetPasswordModal } from '~/modules/admin/modules/Users/routes/UserList/ResetPasswordModal'
import Modals from '~/modules/admin/components/Modals/'
import { DetailsDrawer } from './DetailsDrawer'
import { AddEditDrawer } from './AddEditDrawer'
import { ActionsMenu } from './ActionsMenu'
import {
  DrawerMode, DRAWER_SEARCH_PARAMS, AdminTypes, CampaignTypes,
} from './constants'

const MODALS = {
  ResetPasswordModal,
}

const connecter = connect(
  (state: RootState) => ({
    currentUser: getCurrentUser(state),
    currentCampaignId: getCampaignId(state),
  }),
  {
    openModal,
  },
)

type PropsFromRedux = ConnectedProps<typeof connecter>

interface OwnProps {
  adminType: string
  campaignType?: string
}

type Props = PropsFromRedux & OwnProps

const { I18n } = window

interface Meta extends BaseMeta {
  permissions: AdminPermissions
  usersGrants: CurrentUserPermissions
}

const AdminsComponent: React.FC<Props> = ({
  adminType, campaignType, currentUser, openModal, currentCampaignId,
}) => {
  const params = useParams<{ campaignId: string; projectId: string; clientId: string }>()
  const { projectId } = params
  const { clientId } = params
  const campaignIdParam = params.campaignId

  const campaignId = campaignType === CampaignTypes.common ? campaignIdParam : currentCampaignId

  const filterHash = {
    with_role: adminType,
    project_id_eq: projectId,
  }

  if (adminType === AdminTypes.CampaignAdmin) {
    _.merge(filterHash, { campaign_id_eq: campaignId })
  } else if (adminType === AdminTypes.ClientAdmin) {
    _.merge(filterHash, { client_id_eq: clientId })
  }

  const {
    data, meta, fetch, isLoading, getSortOrder, handleTableChange, createResource, updateResource,
    removeResource, currentPage, pageSize, changePage, getFilteredValue, changeFilter,
  } = useResources<ProjectAdmin, Meta>(
    'memberships',
    {
      trackUrl: true,
      responseType: AdminListingTR,
      apiConfig: {
        filter: filterHash,
        fields: {
          memberships: ['first_name', 'last_name', 'email', 'created_at', 'user_id'],
        },
      },
    },
  )
  useEffect(() => {
    fetch()
  }, [])

  const tableLoading = isLoading('fetch')

  const { pathname, search } = useLocation()
  const searchParams = new URLSearchParams(search)
  const drawerMode = searchParams.get(DRAWER_SEARCH_PARAMS.MODE) as DrawerMode
  const drawerAdminId = searchParams.get(
    DRAWER_SEARCH_PARAMS.ADMIN_ID,
  ) as string

  const updateInProgress = isLoading(`update@${drawerAdminId}`)
  const createAdminInProgress = isLoading('add')

  const history = useHistory()

  const getIndividualAdminUrl = (
    mode: DrawerMode,
    id?: Admin['id'],
  ): string => {
    const params = new URLSearchParams(search)

    if (mode === DrawerMode.Edit || mode === DrawerMode.View) {
      params.set(DRAWER_SEARCH_PARAMS.ADMIN_ID, `${id}`)
    }

    params.set(DRAWER_SEARCH_PARAMS.MODE, mode)

    return `${pathname}?${params.toString()}`
  }

  const handleEditAdminClick = (id: Admin['id']) => {
    const editUrl = getIndividualAdminUrl(DrawerMode.Edit, id)
    history.push(editUrl)
  }

  const handleDeleteAdminClick = (
    id: Admin['id'], firstName: Admin['firstName'], lastName: Admin['lastName'],
  ) => {
    Modal.confirm({
      title: I18n.t('administration.administrators.modals.delete.title'),
      content: I18n.t(
        'administration.administrators.modals.delete.content',
        { name: `${firstName} ${lastName}` },
      ),
      okText: I18n.t('administration.administrators.modals.delete.okText'),
      cancelText: I18n.t(
        'administration.administrators.modals.delete.cancelText',
      ),
      onOk: async () => {
        removeResource(`${id}`).then(() => {
          message.info(
            I18n.t(
              'frontend.admins.actions.remove.success',
              { adminName: `${firstName} ${lastName}` },
            ),
          )
          close()
        }).catch((error) => {
          message.error(error)
        })
      },
    })
  }

  const handleDrawerClose = () => {
    const searchParams = new URLSearchParams(search)
    searchParams.delete(DRAWER_SEARCH_PARAMS.MODE)
    searchParams.delete(DRAWER_SEARCH_PARAMS.ADMIN_ID)

    history.push(`${pathname}?${searchParams.toString()}`)
  }

  const handleAddAdminClick = () => {
    const addUrl = getIndividualAdminUrl(DrawerMode.Add)
    history.push(addUrl)
  }

  return (
    <>
      <Row
        justify="space-between"
        align="middle"
        className="pt-4 pb-4 ps-4 pe-4"
      >
        <Col>
          <CountDisplay
            selectedCount={0}
            totalCount={meta.recordCount}
            isLoading={tableLoading}
          />
        </Col>
        <Col>
          <Space>
            <Input.Search
              placeholder={I18n.t(
                'administration.administrators.list.header.search_admins',
              )}
              value={getFilteredValue('filterable_fields')}
              onChange={e => changeFilter('filterable_fields', e.target.value)}
            />
            <Button
              type="primary"
              disabled={tableLoading}
              onClick={handleAddAdminClick}
            >
              <PlusOutlined />
              {I18n.t('administration.administrators.list.header.add_admin')}
            </Button>
          </Space>
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <Table
            pagination={false}
            loading={tableLoading}
            dataSource={data}
            onChange={handleTableChange}
          >
            <Table.Column
              dataIndex="userId"
              title={I18n.t('administration.administrators.list.columns.id')}
              sorter
              sortOrder={getSortOrder('user_id')}
            />
            <Table.Column
              dataIndex="name"
              title={I18n.t('administration.administrators.list.columns.name')}
              render={(_, { id, firstName, lastName }) => (
                <Link to={getIndividualAdminUrl(DrawerMode.View, id)}>
                  <Button type="link" className="ps-0">
                    {`${firstName} ${lastName}`}
                  </Button>
                </Link>
              )}
            />
            <Table.Column
              dataIndex="email"
              title={I18n.t('administration.administrators.list.columns.email')}
              sorter
              sortOrder={getSortOrder('user.email')}
            />
            <Table.Column
              dataIndex="createdAt"
              title={I18n.t(
                'administration.administrators.list.columns.created_at',
              )}
              sorter
              sortOrder={getSortOrder('created_at')}
            />
            <Table.Column
              dataIndex="actions"
              title={I18n.t(
                'administration.administrators.list.columns.actions',
              )}
              render={(
                _,
                user: Admin,
              ) => {
                const {
                  id, userId, email, firstName, lastName,
                } = user

                return (
                  <ActionsMenu
                    id={id}
                    userId={userId}
                    currentUser={currentUser}
                    email={email}
                    firstName={firstName}
                    lastName={lastName}
                    permissions={meta.permissions}
                    handleEdit={handleEditAdminClick}
                    handleDelete={handleDeleteAdminClick}
                    handleResetPassword={() => openModal('ResetPasswordModal', { user: { ...user, id: user.userId } })}
                  />
                )
              }}
            />
          </Table>
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={meta.recordCount}
            onChange={changePage}
            className="pl"
          />
        </Col>
      </Row>
      <DetailsDrawer
        isVisible={drawerMode === DrawerMode.View}
        adminId={drawerAdminId}
        permissions={meta.permissions}
        handleClose={handleDrawerClose}
        handleEdit={handleEditAdminClick}
        adminType={adminType}
      />
      <AddEditDrawer
        isVisible={
          drawerMode === DrawerMode.Add || drawerMode === DrawerMode.Edit
        }
        isEditMode={drawerMode === DrawerMode.Edit}
        handleClose={handleDrawerClose}
        updateAdmin={updateResource}
        createAdmin={createResource}
        isSuperAdmin={isSuperAdmin(currentUser)}
        permissions={meta.permissions}
        currentUserGrants={meta.usersGrants}
        adminId={drawerAdminId}
        adminType={adminType}
        campaignType={campaignType}
        addOrUpdateInProgress={updateInProgress || createAdminInProgress}
      />
      <Modals modals={MODALS} />
    </>
  )
}

export const Admins = connecter(AdminsComponent)
