import React, { useEffect, useState } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import {
  Row, Col, Table, Space, Input, message, Pagination, App, Typography,
} from 'antd'
import { useParams } from 'react-router-dom'
import { get as getCurrentUser } from '~/core/currentUser'
import { RootState } from '~/modules/admin/core/rootReducers'
import { openModal } from '~/modules/admin/core/ui/modals'
import { useResources } from '~/hooks/useResources'
import { BaseMeta } from '~/hooks/useResources/interfaces'
import { CountDisplay } from '~/components/CountDisplay'
import { extractErrorTitle } from '~/utils/requestErrors'
import { downloadTextFile } from '~/utils/downloadTextFile'
import {
  ProjectAdmin, Admin, AdminPermissions, CurrentUserPermissions, AdminListingTR,
} from '~/modules/admin/modules/client/core/admin'
import { ResetPasswordModal } from '~/modules/admin/modules/Users/routes/UserList/ResetPasswordModal'
import Modals from '~/modules/admin/components/Modals/'
import { useWindowSize } from '~/hooks/useWindowSize'
import { ActionsMenu } from './ActionsMenu'
import { ClientAssessorModal } from './ClientAssessorModal'
import { ClientAssessorImportModal } from './ClientAssessorImportModal'
import { ClientAssessorActionsDropdown } from './ClientAssessorToolsDropdown'

const { I18n } = window

const MODALS = {
  ResetPasswordModal,
}

export interface Meta extends BaseMeta {
  permissions: AdminPermissions
  usersGrants: CurrentUserPermissions
}

const connecter = connect(
  (state: RootState) => ({
    currentUser: getCurrentUser(state),
  }),
  {
    openModal,
  },
)

type PropsFromRedux = ConnectedProps<typeof connecter>

type Props = PropsFromRedux

const ClientAssessorsComponent: React.FC<Props> = ({ currentUser, openModal }) => {
  const { clientId, projectId } = useParams() as {
    clientId: string
    projectId: string
  }
  const { modal } = App.useApp()
  const { width: windowWidth } = useWindowSize()
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [isImporting, setIsImporting] = useState(false)

  const {
    data, meta, fetch, isLoading, getSortOrder, handleTableChange, createResource,
    removeResource, currentPage, pageSize, changePage, getFilteredValue, changeFilter,
    uploadFileAction,
  } = useResources<ProjectAdmin, Meta>(
    'memberships',
    {
      trackUrl: true,
      responseType: AdminListingTR,
      apiConfig: {
        filter: {
          with_role: 'client_assessor',
          project_id_eq: projectId,
          client_id_eq: clientId,
        },
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
  const createInProgress = isLoading('add')
  const recordCount = meta?.recordCount || 0
  const permissions = meta?.permissions || {}

  const handleDelete = (
    id: Admin['id'], _firstName: Admin['firstName'], _lastName: Admin['lastName'], email: Admin['email'],
  ) => {
    modal.confirm({
      title: I18n.t('shared.confirm'),
      content: I18n.t('admin.confirm_remove_client_assessor', { email }),
      okText: I18n.t('shared.ok'),
      cancelText: I18n.t('shared.cancel'),
      onOk: async () => {
        removeResource(`${id}`).then(() => {
          message.info(I18n.t('admin.client_assessor_removed_successfully', { email }))
        }).catch((error) => {
          message.error(error)
        })
      },
    })
  }

  const handleDownloadTemplate = () => {
    downloadTextFile('email\nassessor1@example.com\nassessor2@example.com\n', 'client-assessor-import-template.csv')
  }

  const handleImport = async (file: File) => {
    try {
      setIsImporting(true)
      const body = new FormData()
      body.append('import_data', file)
      body.append('client_id', clientId)

      await uploadFileAction('memberships/import_client_assessors', body)

      message.success(I18n.t('user.modals.import.success_msg'))
      setIsImportModalOpen(false)
      fetch()
    } catch (error) {
      const normalizedErrors = Array.isArray(error)
        ? error
        : [extractErrorTitle(error) || I18n.t('shared.something_went_wrong')]
      throw normalizedErrors
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <>
      <Row justify="space-between" align="middle" className="pt-4 pb-4 ps-4 pe-4">
        <Col>
          <CountDisplay selectedCount={0} totalCount={recordCount} isLoading={tableLoading} />
        </Col>
        <Col>
          <Space>
            <Input.Search
              placeholder={I18n.t('admin.search_client_assessors')}
              value={getFilteredValue('filterable_fields')}
              onChange={e => changeFilter('filterable_fields', e.target.value)}
            />
            <ClientAssessorActionsDropdown
              onAdd={() => setIsAddModalOpen(true)}
              onImport={() => setIsImportModalOpen(true)}
            />
          </Space>
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <Table
            pagination={false}
            loading={tableLoading}
            scroll={{ x: 'max-content' }}
            rowKey="id"
            dataSource={data}
            onChange={handleTableChange}
          >
            <Table.Column
              dataIndex="userId"
              key="userId"
              fixed={windowWidth > 800 ? 'left' : undefined}
              title={I18n.t('shared.id')}
              sorter
              sortOrder={getSortOrder('userId')}
            />
            <Table.Column
              dataIndex="name"
              title={I18n.t('shared.name')}
              render={(_, { firstName, lastName }) => (
                <Typography.Text>
                  {`${firstName} ${lastName}`}
                </Typography.Text>
              )}
            />
            <Table.Column
              dataIndex="email"
              key="user.email"
              title={I18n.t('shared.email')}
              sorter
              sortOrder={getSortOrder('user.email')}
              render={(_, { email }) => (
                <Typography.Paragraph copyable>
                  {email}
                </Typography.Paragraph>
              )}
            />
            <Table.Column
              dataIndex="createdAt"
              key="createdAt"
              title={I18n.t('shared.created_at')}
              sorter
              sortOrder={getSortOrder('createdAt')}
            />
            <Table.Column
              dataIndex="actions"
              fixed={windowWidth > 800 ? 'right' : undefined}
              title={I18n.t('shared.actions')}
              render={(_, user: Admin) => {
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
                    permissions={permissions}
                    handleEdit={() => undefined}
                    handleDelete={handleDelete}
                    handleResetPassword={() => openModal('ResetPasswordModal', { user: { ...user, id: user.userId } })}
                    showEditAction={false}
                    showSendEmailAction={false}
                  />
                )
              }}
            />
          </Table>
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={recordCount}
            onChange={changePage}
            className="pl"
          />
        </Col>
      </Row>
      <ClientAssessorModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        createAdmin={async (payload) => {
          const createdAdmin = await createResource(payload)
          setIsAddModalOpen(false)
          return createdAdmin
        }}
        loading={createInProgress}
      />
      <ClientAssessorImportModal
        open={isImportModalOpen}
        loading={isImporting}
        onClose={() => setIsImportModalOpen(false)}
        onDownloadTemplate={handleDownloadTemplate}
        onSubmit={handleImport}
      />
      <Modals modals={MODALS} />
    </>
  )
}

export const ClientAssessors = connecter(ClientAssessorsComponent)
