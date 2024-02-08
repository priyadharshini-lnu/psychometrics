import { FC, ChangeEvent, useEffect } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { useParams, useHistory, useLocation } from 'react-router'
import {
  Col, Input, Row, Space, Table, App, Modal, Pagination,
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
import { useDocumentTitle } from '~/hooks/useDocumentTitle'
import { getProject as getCurrentProject } from '~/modules/admin/core/ui/breadcrumbs'
import { CountDisplay } from '~/components/CountDisplay'
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
  const history = useHistory()
  const { search, pathname } = useLocation()
  const searchParams = new URLSearchParams(search)
  const drawerMode = searchParams.get(DRAWER_SEARCH_PARAMS.MODE) as DrawerMode

  const params = useParams<{ projectId: string }>()
  const projectId = parseInt(params.projectId, 10)
  const { message, modal } = App.useApp()

  const drawerParticipantId = searchParams.get(
    DRAWER_SEARCH_PARAMS.PARTICIPANT_ID,
  ) as string

  useDocumentTitle(
    I18n.t('administration.document_titles.project_participants', {
      project: projectName || projectId,
    }),
  )

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
    history.push(editUrl)
  }

  const handleDeleteAdminClick = (id: Participant['id']) => {
    const participant = participantsList.find(
      participant => participant.id === id,
    )
    const name = `${participant?.firstName ?? ''} ${
      participant?.lastName ?? ''
    }`

    modal.confirm({
      title: I18n.t('administration.project_users.modal_delete_title'),
      content: I18n.t('administration.project_users.modal_delete_content', {
        name,
      }),
      okText: I18n.t('administration.project_users.confirm_delete'),
      cancelText: I18n.t('administration.project_users.cancel'),
      onOk: async () => {
        try {
          await removeParticipant(projectId, id)
          message.success(
            I18n.t('administration.project_users.delete_success', {
              name,
            }),
          )
        } catch (error) {
          message.error(
            I18n.t('administration.project_users.delete_error', {
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
      title: I18n.t('administration.project_users.model_reset_email'),
      content: I18n.t(
        'administration.project_users.modal_reset_email_content',
        { email },
      ),
      okText: I18n.t('administration.project_users.confirm_send'),
      cancelText: I18n.t('administration.project_users.cancel'),
      onOk: async () => {
        try {
          await resetParticipantPassword(projectId, id)

          message.success(
            I18n.t('administration.project_users.reset_mail_success', { email }),
          )
        } catch (error) {
          message.error(
            I18n.t('administration.project_users.reset_mail_error', { email }),
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

    history.push(`${pathname}?${searchParams.toString()}`)
    clearCurrentParticipant()
  }

  const renderCampaigns = (_: string, { campaigns }: Participant) => {
    const campaignTags = campaigns.map(campaign => ({
      title: campaign.name,
      url: constructCampaignUrl(projectId, campaign.id),
    }))
    return <TagListDisplay tags={campaignTags} />
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
            totalCount={totalParticipants}
            isLoading={isParticipantsListLoading}
          />
        </Col>
        <Col>
          <Space>
            <Input.Search
              placeholder={I18n.t(
                'administration.project_participants.search_user',
              )}
              value={filters.filterableFields}
              onChange={handleSearchInput}
            />
          </Space>
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <Table
            pagination={false}
            dataSource={participantsList}
            rowKey={row => row.id}
            loading={isParticipantsListLoading}
            onChange={onTableChange}
          >
            <Table.Column
              key="userId"
              dataIndex="userId"
              title={I18n.t('administration.project_participants.column_id')}
              sorter
              sortOrder={getSortOrder('userId')}
            />
            <Table.Column
              key="name"
              dataIndex="name"
              title={I18n.t('administration.project_participants.column_name')}
              render={(_: string, { firstName, lastName }: Participant) => (
                <>{`${firstName} ${lastName}`}</>
              )}
              sorter
              sortOrder={getSortOrder('name')}
            />
            <Table.Column
              key="email"
              dataIndex="email"
              title={I18n.t('administration.project_participants.column_email')}
              sorter
              sortOrder={getSortOrder('email')}
            />
            <Table.Column
              key="campaigns"
              title={I18n.t(
                'administration.project_participants.column_campaigns',
              )}
              render={renderCampaigns}
              filters={[
                {
                  text: I18n.t(
                    'administration.project_participants.filter_campaigns',
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
                'administration.project_participants.column_createdAt',
              )}
              sorter
              sortOrder={getSortOrder('createdAt')}
            />
            <Table.Column
              key="actions"
              dataIndex="actions"
              title={I18n.t(
                'administration.project_participants.column_actions',
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
        </Col>
      </Row>
      <Row className="pt-4 pb-4 ps-4 pe-4">
        <Col>
          <Pagination
            hideOnSinglePage
            current={page}
            pageSize={settings.pagination.defaultPageSize}
            total={totalParticipants}
            onChange={changePage}
          />
        </Col>
      </Row>
      <EditDrawer
        isOpen={drawerMode === DrawerMode.Edit}
        projectId={projectId}
        participantId={drawerParticipantId}
        handleClose={handleDrawerClose}
      />
    </>
  )
}

export const Participants = withEnhancedTable(
  connector(ParticipantsComponent),
  'projectParticipants',
  {
    maintainHistory: true,
    filterPredicates: FILTER_PREDICATES_PARTICIPANTS,
  },
)
