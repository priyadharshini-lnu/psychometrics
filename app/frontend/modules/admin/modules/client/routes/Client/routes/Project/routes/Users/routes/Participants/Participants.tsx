import { FC, ChangeEvent, useEffect } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { useParams, useNavigate, useLocation } from 'react-router'
import {
  Input, Space, Table, App, Modal,
} from 'antd'

import { RootState } from '~/modules/admin/core/rootReducers'
import { TableProps } from '~/modules/admin/hoc/withEnhancedTable/interfaces'
import {
  Participant,
  FETCH,
  fetch as fetchParticipants,
  clearCurrent as clearCurrentParticipant,
  getList,
  getTotal as getTotalProjectParticipants,
  remove as removeParticipant,
  resetPassword as resetParticipantPassword,
} from '~/modules/admin/modules/client/core/participants'
import { isRequestInProgress } from '~/core/request'

import withEnhancedTable from '~/modules/admin/hoc/withEnhancedTable'
import settings from '~/modules/admin/settings'
import { DocumentTitle } from '~/components/DocumentTitle'
import { getProject as getCurrentProject } from '~/modules/admin/core/ui/breadcrumbs'
import { TableLayout } from '~/modules/admin/components/TableLayout'
import { TagListDisplay } from '~/components/TagListDisplay'
import { ActionsMenu } from './ActionMenu'
import { EditDrawer } from './EditDrawer'
import {
  DrawerMode,
  DRAWER_SEARCH_PARAMS,
  FILTER_PREDICATES_PARTICIPANTS,
} from '../constants'
import { constructCampaignUrl } from '../commonUtils'

const { I18n } = window

const connector = connect(
  (state: RootState) => ({
    projectName: getCurrentProject(state).name,
    isParticipantsListLoading: isRequestInProgress(state, FETCH),
    participantsList: getList(state),
    totalParticipants: getTotalProjectParticipants(state),
  }),
  {
    fetchParticipants,
    removeParticipant,
    clearCurrentParticipant,
    resetParticipantPassword,
  },
)

type PropsFromRedux = ConnectedProps<typeof connector>

type Props = PropsFromRedux & TableProps

const ParticipantsComponent: FC<Props> = ({
  tableConfig: { filters, page },
  tableConfig,
  projectName,
  changePage,
  getSortOrder,
  onTableChange,
  changeFilter,
  fetchParticipants,
  isParticipantsListLoading,
  removeParticipant,
  clearCurrentParticipant,
  resetParticipantPassword,
  totalParticipants,
  participantsList,
}) => {
  const navigate = useNavigate()
  const { search, pathname } = useLocation()
  const searchParams = new URLSearchParams(search)
  const drawerMode = searchParams.get(DRAWER_SEARCH_PARAMS.MODE) as DrawerMode

  const params = useParams() as { projectId: string }
  const projectId = parseInt(params.projectId, 10)
  const { message, modal } = App.useApp()

  const drawerParticipantId = searchParams.get(
    DRAWER_SEARCH_PARAMS.PARTICIPANT_ID,
  ) as string

  useEffect(() => {
    fetchParticipants(projectId, tableConfig)
  }, [tableConfig])

  const handleSearchInput = (event: ChangeEvent<HTMLInputElement>) => {
    const {
      target: { value },
    } = event
    changeFilter('filterableFields', value)
  }

  const getIndividualParticipantUrl = (
    mode: DrawerMode,
    id?: Participant['id'],
  ): string => {
    const params = new URLSearchParams(search)

    if (mode === DrawerMode.Edit) {
      params.set(DRAWER_SEARCH_PARAMS.PARTICIPANT_ID, `${id}`)
    }

    params.set(DRAWER_SEARCH_PARAMS.MODE, mode)

    return `${pathname}?${params.toString()}`
  }

  const handleEditAdminClick = (id: Participant['id']) => {
    const editUrl = getIndividualParticipantUrl(DrawerMode.Edit, id)
    navigate(editUrl)
  }

  const handleDeleteAdminClick = (id: Participant['id']) => {
    const participant = participantsList.find(
      participant => participant.id === id,
    )
    const name = `${participant?.firstName ?? ''} ${
      participant?.lastName ?? ''
    }`

    modal.confirm({
      title: I18n.t('admin.project_users_modal_delete_title'),
      content: I18n.t('admin.project_users_modal_delete_content', {
        name,
      }),
      okText: I18n.t('admin.project_users_confirm_delete'),
      cancelText: I18n.t('admin.project_users_cancel'),
      onOk: async () => {
        try {
          await removeParticipant(projectId, id)
          message.success(
            I18n.t('admin.project_users_delete_success', {
              name,
            }),
          )
        } catch (error) {
          message.error(
            I18n.t('admin.project_users_delete_error', {
              name,
            }),
          )
        }
      },
    })
  }

  const handlePasswordResetClick = (id: Participant['id']) => {
    const participant = participantsList.find(
      participant => participant.id === id,
    )
    const email = participant?.email ?? ''

    modal.confirm({
      title: I18n.t('admin.project_users_model_reset_email'),
      content: I18n.t(
        'admin.project_users_modal_reset_email_content',
        { email },
      ),
      okText: I18n.t('admin.project_users_confirm_send'),
      cancelText: I18n.t('admin.project_users_cancel'),
      onOk: async () => {
        try {
          await resetParticipantPassword(projectId, id)

          message.success(
            I18n.t('admin.project_users_reset_mail_success', { email }),
          )
        } catch (error) {
          message.error(
            I18n.t('admin.project_users_reset_mail_error', { email }),
          )
        }
      },
    })
  }

  useEffect(
    () => () => {
      Modal.destroyAll()
    },
    [],
  )

  const handleDrawerClose = () => {
    const searchParams = new URLSearchParams(search)
    searchParams.delete(DRAWER_SEARCH_PARAMS.MODE)
    searchParams.delete(DRAWER_SEARCH_PARAMS.PARTICIPANT_ID)

    navigate(`${pathname}?${searchParams.toString()}`)
    clearCurrentParticipant()
  }

  const renderCampaigns = (_: string, { campaigns }: Participant) => {
    const campaignTags = campaigns.map(campaign => ({
      title: campaign.name,
      url: constructCampaignUrl(projectId, campaign.id),
    }))
    return <TagListDisplay tags={campaignTags} />
  }

  const ParticipantsTable = (
    <Table
      pagination={false}
      dataSource={participantsList}
      rowKey={row => row.id}
      onChange={onTableChange}
    >
      <Table.Column
        key="userId"
        dataIndex="userId"
        title={I18n.t('shared.id')}
        sorter
        sortOrder={getSortOrder('userId')}
      />
      <Table.Column
        key="name"
        dataIndex="name"
        title={I18n.t('shared.name')}
        render={(_: string, { firstName, lastName }: Participant) => (
          <>{`${firstName} ${lastName}`}</>
        )}
        sorter
        sortOrder={getSortOrder('name')}
      />
      <Table.Column
        key="email"
        dataIndex="email"
        title={I18n.t('shared.email')}
        sorter
        sortOrder={getSortOrder('email')}
      />
      <Table.Column
        key="campaigns"
        title={I18n.t(
          'admin.project_participants_column_campaigns',
        )}
        render={renderCampaigns}
        filters={[
          {
            text: I18n.t(
              'admin.project_participants_filter_campaigns',
            ),
            value: 'no_campaigns',
          },
        ]}
        filterMultiple={false}
      />
      <Table.Column
        key="createdAt"
        dataIndex="createdAt"
        title={I18n.t(
          'admin.project_participants_column_createdAt',
        )}
        sorter
        sortOrder={getSortOrder('createdAt')}
      />
      <Table.Column
        key="actions"
        dataIndex="actions"
        title={I18n.t(
          'shared.actions',
        )}
        render={(_: string, { id, email, permissions }: Participant) => (
          <ActionsMenu
            id={id}
            email={email}
            permissions={permissions}
            handleEdit={handleEditAdminClick}
            handleResetPassword={handlePasswordResetClick}
            handleDelete={handleDeleteAdminClick}
          />
        )}
      />
    </Table>
  )

  const Filter = (
    <Space>
      <Input.Search
        placeholder={I18n.t(
          'admin.project_participants_search_user',
        )}
        value={filters.filterableFields}
        onChange={handleSearchInput}
      />
    </Space>
  )

  return (
    <>
      <DocumentTitle
        text={I18n.t('admin.document_titles_project_participants', { project: projectName || projectId })}
      />
      <TableLayout
        loading={isParticipantsListLoading}
        table={ParticipantsTable}
        filters={Filter}
        title={I18n.t('admin.participants')}
        pagination={{
          page,
          pageSize: settings.pagination.defaultPageSize,
          total: totalParticipants,
          onChange: changePage,
        }}
        recordCount={totalParticipants}
      />
      <EditDrawer
        isOpen={drawerMode === DrawerMode.Edit}
        projectId={projectId}
        participantId={drawerParticipantId}
        handleClose={handleDrawerClose}
      />
    </>
  )
}

export const Participants = withEnhancedTable<{}>(
  connector(ParticipantsComponent),
  'projectParticipants',
  {
    maintainHistory: true,
    filterPredicates: FILTER_PREDICATES_PARTICIPANTS,
  },
)
