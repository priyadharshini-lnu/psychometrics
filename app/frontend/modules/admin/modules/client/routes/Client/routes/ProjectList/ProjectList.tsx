import React, { useEffect } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { useParams, Link, useHistory } from 'react-router-dom'
import {
  Table,
  Input,
  Pagination,
  Button,
  Space,
  Image,
  Typography,
  MenuProps,
  Modal,
  Radio,
  Avatar,
  Row,
  Col,
  message,
  Skeleton,
} from 'antd'
import { PlusOutlined } from '@ant-design/icons'

import { ItemType } from 'antd/lib/menu/hooks/useItems'
import _ from 'lodash'
import { openModal } from '~/modules/admin/core/ui/modals'
import { TableProps } from '~/modules/admin/hoc/withEnhancedTable/interfaces'

import withEnhancedTable from '~/modules/admin/hoc/withEnhancedTable'
import Modals from '~/modules/admin/components/Modals/'
import { useResources } from '~/hooks/useResources'
import { Project, ProjectTR } from '~/modules/admin/modules/client/core/projects'
import { BaseMeta } from '~/hooks/useResources/interfaces'
import { TableLayout } from '~/modules/admin/components/TableLayout'
import ConditionalDropdown from '~/components/ConditionalDropdown'
import { get as getCurrentUser } from '~/core/currentUser'
import { RootState } from '~/modules/admin/core/rootReducers'
import { CreateProjectModal } from './CreateProjectModal'
import styles from './styles.less'

const { I18n } = window

const MODALS = {
  CreateProjectModal,
}

const { Column } = Table
const { Search } = Input

const connector = connect(
  (state: RootState) => ({
    currentUser: getCurrentUser(state),
  }),
  {
    openModal,
  },
)

type PropsFromRedux = ConnectedProps<typeof connector>
type Props = PropsFromRedux & TableProps

const ProjectListComponent: React.FC<Props> = ({ openModal, currentUser }) => {
  const { clientId } = useParams<{ clientId: string }>()

  const history = useHistory()

  const {
    data, meta, fetch, isLoading, getSortOrder, handleTableChange, changePage,
    currentPage, pageSize, changeFilter, getFilteredValue, createResource,
    requests, updateResource,
  } = useResources<Project, BaseMeta>(
    'projects',
    {
      basePath: `clients/${clientId}`,
      trackUrl: true,
      responseType: ProjectTR,
      apiConfig: {
        filter: { disabled_true: 'false' },
        include: ['modifier', 'creator'],
        fields: { users: ['name'] },
      },
    },
  )
  useEffect(() => {
    fetch()
  }, [])

  const tableLoading = isLoading('fetch')

  const toggleDisableProject = (project) => {
    const { id, name, disabled } = project

    const action = disabled ? 'unarchive' : 'archive'
    Modal.confirm({
      title: I18n.t(`administration.clients.projects.${action}.title`),
      content: I18n.t(`administration.clients.projects.${action}.content`, { project_name: name }),
      onOk: () => {
        updateResource(
          {
            id,
            disabled: !disabled,
          },
        ).then(() => {
          message.success(I18n.t(`administration.clients.projects.${action}.success`, { project_name: name }))
          fetch()
        })
      },
    })
  }

  const handleProjectStatusChange = (e) => {
    changeFilter('disabled_true', e.target.value)
  }

  const ProjectTable = (
    <>
      <Table
        dataSource={data}
        loading={tableLoading}
        onChange={handleTableChange}
        pagination={false}
        rowKey={row => row.id}
      >
        <Column
          title={I18n.t('common.column.id')}
          dataIndex="id"
          key="id"
          sorter
          sortOrder={getSortOrder('id')}
        />
        <Column
          title={I18n.t('common.column.details')}
          key="name"
          width={500}
          render={({
            id, logo, name, url,
          }) => (
            <div>
              <Row gutter={40}>
                <Col span="4">
                  {
                    logo ? (
                      <>
                        <Image
                          src={logo}
                          preview={false}
                          className={styles.logoImageStyles}
                          placeholder={<Skeleton.Avatar className={styles.imageSkeleton} shape="square" active />}
                          onClick={() => {
                            history.push(`/administration/projects/${id}/new_campaigns?filters[statusEq]=active`)
                          }}
                        />
                      </>
                    ) : (
                      <Avatar
                        size="large"
                        className={styles.imageAvatarStyles}
                      >
                        {name.substring(0, 2)}
                      </Avatar>
                    )
                  }
                </Col>
                <Col>
                  <Space
                    direction="vertical"
                  >
                    <Link
                      className={styles.campaignLink}
                      to={`/administration/projects/${id}/new_campaigns?filters[statusEq]=active`}
                    >
                      {name}
                    </Link>
                    <div>
                      <Typography.Link
                        href={url}
                        target="_blank"
                        copyable
                      >
                        {url}
                      </Typography.Link>
                    </div>
                  </Space>
                </Col>
              </Row>
            </div>
          )}
          sorter
          sortOrder={getSortOrder('name')}
        />

        <Column
          title={I18n.t('administration.projects.columns.project_number')}
          key="number"
          dataIndex="number"
          sorter
          sortOrder={getSortOrder('number')}
        />

        <Column
          title={I18n.t('common.column.created_by')}
          key="created_by"
          render={project => project.creator?.name}
        />

        <Column
          title={I18n.t('common.column.created_date')}
          key="created_at"
          dataIndex="createdAt"
          sorter
          sortOrder={getSortOrder('created_at')}
        />

        <Column
          title={I18n.t('common.column.modified_by')}
          key="modified_by"
          render={project => project.modifier?.name}
        />

        <Column
          title={I18n.t('common.column.modified_date')}
          key="updated_at"
          dataIndex="updatedAt"
          sorter
          sortOrder={getSortOrder('updated_at')}
        />

        {currentUser.permissions.canManageProject && (
          <Column
            title={I18n.t('common.column.action')}
            key="action"
            render={project => (
              <ConditionalDropdown
                menu={
                  getActionsMenuProps({
                    project,
                    toggleDisableProject,
                  })
                }
              />
            )}
          />
        )}
      </Table>
      <Pagination
        current={currentPage}
        pageSize={pageSize}
        total={meta.recordCount}
        onChange={changePage}
        className="pl"
      />
    </>
  )

  const Filter = (
    <Space>
      <Radio.Group
        onChange={handleProjectStatusChange}
        defaultValue={getFilteredValue('disabled_true') || 'false'}
      >
        <Radio.Button value="false">
          {I18n.t('administration.clients.projects.status.active')}
        </Radio.Button>
        <Radio.Button value="true">
          {I18n.t('administration.clients.projects.status.archived')}
        </Radio.Button>
      </Radio.Group>
      <Search
        placeholder="Search"
        value={getFilteredValue('filterable_fields')}
        onChange={e => changeFilter('filterable_fields', e.target.value)}
      />
      {currentUser.permissions.canManageProject
        && (
          <Button
            type="primary"
            disabled={tableLoading}
            onClick={() => {
              openModal('CreateProjectModal', { addProject: createResource })
            }}
          >
            <PlusOutlined />
            {I18n.t('administration.projects.addProject')}
          </Button>
        )}
    </Space>
  )

  return (
    <>
      <TableLayout
        table={ProjectTable}
        filters={Filter}
        recordCount={meta.recordCount}
        loading={tableLoading}
        requestStatus={requests.fetch?.status}
      />
      <Modals modals={MODALS} />
    </>
  )
}

interface ActionMenuData {
  project: Project,
  toggleDisableProject(project): void
}

const getActionsMenuProps = ({
  project, toggleDisableProject,
}: ActionMenuData): MenuProps => {
  const { disabled } = project

  const menuItems: ItemType[] = []

  if (disabled) {
    menuItems.push({
      key: 'unarchive',
      label: I18n.t('administration.clients.projects.actions.unarchive'),
    })
  } else {
    menuItems.push({
      key: 'archive',
      label: I18n.t('administration.clients.projects.actions.archive'),
    })
  }

  const handleMenuClick = ({ key }) => {
    if (_.includes(['archive', 'unarchive'], key)) {
      toggleDisableProject(project)
    }
  }

  return ({ items: menuItems, onClick: handleMenuClick })
}

export const ProjectList = withEnhancedTable(
  connector(ProjectListComponent),
  'projectList',
  {
    maintainHistory: true,
  },
)
