import { ChangeEvent, FC, useEffect } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { useNavigate, useLocation, useParams } from 'react-router'
import {
  Col, Input, Pagination, Row, Table, App, Modal,
} from 'antd'

import { RootState } from '~/modules/admin/core/rootReducers'
import { getProject as getCurrentProject } from '~/modules/admin/core/ui/breadcrumbs'
import { TableProps } from '~/modules/admin/hoc/withEnhancedTable/interfaces'
import {
  Assessor,
  getList,
  FETCH,
  fetch as fetchAssessors,
  getTotal as getTotalProjectAssessors,
  resetPassword as resetAssessorPassword,
  remove as removeAssessor,
  clearSingle as clearCurrentAssessor,
} from '~/modules/admin/modules/client/core/assessors'
import { isRequestInProgress } from '~/core/request'

import { useDocumentTitle } from '~/hooks/useDocumentTitle'
import withEnhancedTable from '~/modules/admin/hoc/withEnhancedTable'
import settings from '~/modules/admin/settings'
import { CountDisplay } from '~/components/CountDisplay'
import { TagListDisplay } from '~/components/TagListDisplay'
import { ActionsMenu } from './ActionsMenu'
import { EditDrawer } from './EditDrawer'
import {
  DrawerMode,
  DRAWER_SEARCH_PARAMS,
  FILTER_PREDICATES_ASSESSORS,
} from '../constants'
import { constructCampaignUrl } from '../commonUtils'

const { I18n } = window

const connector = connect(
  (state: RootState) => ({
    projectName: getCurrentProject(state).name,
    assessorsList: getList(state),
    isAssessorsListLoading: isRequestInProgress(state, FETCH),
    totalAssessors: getTotalProjectAssessors(state),
  }),
  {
    fetchAssessors,
    resetAssessorPassword,
    removeAssessor,
    clearCurrentAssessor,
  },
)

type PropsFromRedux = ConnectedProps<typeof connector>

type Props = PropsFromRedux & TableProps

const AssessorsComponent: FC<Props> = ({
  tableConfig: { filters, page },
  tableConfig,
  changeFilter,
  getSortOrder,
  changePage,
  onTableChange,
  projectName,
  assessorsList,
  totalAssessors,
  fetchAssessors,
  isAssessorsListLoading,
  resetAssessorPassword,
  removeAssessor,
  clearCurrentAssessor,
}) => {
  const navigate = useNavigate()

  const { search, pathname } = useLocation()
  const searchParams = new URLSearchParams(search)
  const drawerMode = searchParams.get(DRAWER_SEARCH_PARAMS.MODE) as DrawerMode
  const drawerAssessorId = searchParams.get(
    DRAWER_SEARCH_PARAMS.ASSESSOR_ID,
  ) as string
  const params = useParams() as { projectId: string }
  const projectId = parseInt(params.projectId, 10)
  const { modal, message } = App.useApp()

  useDocumentTitle(
    I18n.t('admin.document_titles_project_assessors', {
      project: projectName || projectId,
    }),
  )

  useEffect(() => {
    fetchAssessors(projectId, tableConfig)
  }, [tableConfig])

  useEffect(
    () => () => {
      Modal.destroyAll()
    },
    [],
  )

  const handleSearchInput = (event: ChangeEvent<HTMLInputElement>) => {
    const {
      target: { value },
    } = event
    changeFilter('filterableFields', value)
  }

  const getIndividualAssessorUrl = (
    mode: DrawerMode,
    id?: Assessor['id'],
  ): string => {
    const params = new URLSearchParams(search)

    if (mode === DrawerMode.Edit) {
      params.set(DRAWER_SEARCH_PARAMS.ASSESSOR_ID, `${id}`)
    }

    params.set(DRAWER_SEARCH_PARAMS.MODE, mode)

    return `${pathname}?${params.toString()}`
  }

  const handleEditAdminClick = (id: Assessor['id']) => {
    const editUrl = getIndividualAssessorUrl(DrawerMode.Edit, id)
    navigate(editUrl)
  }

  const handleDeleteAdminClick = (id: Assessor['id']) => {
    const assessor = assessorsList.find(assessor => assessor.id === id)
    const name = `${assessor?.firstName ?? ''} ${assessor?.lastName ?? ''}`

    modal.confirm({
      title: I18n.t('admin.project_users_modal_delete_title'),
      content: I18n.t('admin.project_users_modal_delete_content', {
        name,
      }),
      okText: I18n.t('admin.project_users_confirm_delete'),
      cancelText: I18n.t('shared.cancel'),
      onOk: async () => {
        try {
          await removeAssessor(projectId, id)
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

  const handlePasswordResetClick = (id: Assessor['id']) => {
    const assessor = assessorsList.find(assessor => assessor.id === id)
    const email = assessor?.email ?? ''

    modal.confirm({
      title: I18n.t('admin.project_users_model_reset_email'),
      content: I18n.t(
        'admin.project_users_modal_reset_email_content',
        { email },
      ),
      okText: I18n.t('admin.project_users_confirm_send'),
      cancelText: I18n.t('shared.cancel'),
      onOk: async () => {
        try {
          await resetAssessorPassword(projectId, id)

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

  const handleDrawerClose = () => {
    const searchParams = new URLSearchParams(search)
    searchParams.delete(DRAWER_SEARCH_PARAMS.MODE)
    searchParams.delete(DRAWER_SEARCH_PARAMS.ASSESSOR_ID)

    navigate(`${pathname}?${searchParams.toString()}`)
    clearCurrentAssessor()
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
            totalCount={totalAssessors}
            isLoading={isAssessorsListLoading}
          />
        </Col>
        <Col>
          <Input.Search
            placeholder={I18n.t('admin.project_users_search_accessor')}
            value={filters.filterableFields}
            onChange={handleSearchInput}
          />
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <Table
            loading={isAssessorsListLoading}
            pagination={false}
            rowKey={row => row.id}
            dataSource={assessorsList}
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
              render={(_: string, { firstName, lastName }: Assessor) => (
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
              title={I18n.t('admin.project_users_column_campaigns')}
              render={(_: string, { campaigns }: Assessor) => {
                const campaignTags = campaigns.map(campaign => ({
                  title: campaign.name,
                  url: constructCampaignUrl(projectId, campaign.id),
                }))

                return <TagListDisplay tags={campaignTags} />
              }}
              filters={[
                {
                  text: I18n.t('admin.project_users_filter_campaigns'),
                  value: 'no_campaigns',
                },
              ]}
              filterMultiple={false}
            />
            <Table.Column
              key="createdAt"
              dataIndex="createdAt"
              title={I18n.t('admin.project_users_column_created_at')}
              sorter
              sortOrder={getSortOrder('createdAt')}
            />
            <Table.Column
              key="actions"
              dataIndex="actions"
              title={I18n.t('shared.actions')}
              render={(_: string, { id, email, permissions }: Assessor) => (
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
            total={totalAssessors}
            onChange={changePage}
          />
        </Col>
      </Row>
      <EditDrawer
        isOpen={drawerMode === DrawerMode.Edit}
        projectId={projectId}
        assessorId={drawerAssessorId}
        handleClose={handleDrawerClose}
      />
    </>
  )
}

export const Assessors = withEnhancedTable<{}>(
  connector(AssessorsComponent),
  'projectAccessors',
  { maintainHistory: true, filterPredicates: FILTER_PREDICATES_ASSESSORS },
)
