import React, { useEffect, useState } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { useParams, Link, useHistory } from 'react-router-dom'
import {
  Table, Input, Pagination, Button, Space, Image, Typography, Menu, Modal, Radio,
} from 'antd'
import { PlusOutlined, FileImageOutlined } from '@ant-design/icons'

import { openModal } from 'modules/admin/core/ui/modals'
import { TableProps } from 'modules/admin/hoc/withEnhancedTable/interfaces'

import withEnhancedTable from 'modules/admin/hoc/withEnhancedTable'
import Modals from 'modules/admin/components/Modals/'
import { useResources } from 'hooks/useResources'
import { Project, ProjectTR } from 'modules/admin/modules/client/core/projects'
import { ItemType } from 'antd/lib/menu/hooks/useItems'
import { BaseMeta } from 'hooks/useResources/interfaces'
import { TableLayout } from 'modules/admin/components/TableLayout'
import ConditionalDropdown from 'components/ConditionalDropdown'
import { get as getCurrentUser } from 'core/currentUser'
import { RootState } from 'modules/admin/core/rootReducers'
import _ from 'lodash'
import { CreateProjectModal } from './CreateProjectModal'
import styles from './styles.less'

const { I18n } = window
const { Text } = Typography

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

  const [showDisabledProject, setShowDisabledProject] = useState('false')

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
      },
    },
  )
  useEffect(() => {
    fetch()
  }, [])

  const tableLoading = isLoading('fetch')

  const toggleDisableProject = (project) => {
    let title
    let content

    const { id, name, disabled } = project

    if (disabled) {
      title = I18n.t('administration.clients.projects.unarchive.title')
      content = I18n.t('administration.clients.projects.unarchive.content')
    } else {
      title = I18n.t('administration.clients.projects.archive.title')
      content = I18n.t('administration.clients.projects.archive.content')
    }
    Modal.confirm({
      title,
      content: `${content} ${name} ?`,
      okText: I18n.t(
        'administration.administrators.modals.resetPassword.okText',
      ),
      cancelText: I18n.t(
        'administration.administrators.modals.resetPassword.cancelText',
      ),
      onOk: () => {
        updateResource(
          {
            id,
            disabled: !disabled,
          },
        )
      },
    })
  }

  const handleProjectStatusChange = (e) => {
    setShowDisabledProject(e.target.value)
    changeFilter('disabled_true', e.target.value)
  }

  const ProjectTable = (
    <>
      <Table
        dataSource={data}
        loading={tableLoading}
        onChange={handleTableChange}
        pagination={false}
      >
        <Column
          title={I18n.t('common.column.details')}
          key="name"
          render={({
            id, logo, name,
          }) => (
            <div>
              {
                logo ? (
                  <Image
                    src={logo}
                    preview={false}
                    width={60}
                    height={60}
                    className={styles.logoImageStyles}
                    onClick={() => { history.push(`/administration/projects/${id}/new_campaigns`) }}
                  />
                )
                  : (
                    <FileImageOutlined className={styles.imageOutlined} />
                  )
              }
              <Space
                direction="vertical"
                className={styles.spaceStyles}
              >
                <Link
                  className={styles.campaignLink}
                  to={`/administration/projects/${id}/new_campaigns`}
                >
                  {name}
                </Link>
                <div>
                  <Text className={styles.campaignLinkText} copyable>
                    {`${window.location.origin}/administration/projects/${id}/new_campaigns`}
                  </Text>
                </div>
              </Space>
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
          title={I18n.t('common.column.created_date')}
          key="created_at"
          dataIndex="createdAt"
          sorter
          sortOrder={getSortOrder('created_at')}
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
                  ActionsMenu({
                    project,
                    toggleDisableProject,
                  }) as React.ReactElement
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
        value={showDisabledProject}
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

interface ActionMenuProps {
  project: Project,
  toggleDisableProject(project): void
}

const ActionsMenu: React.FC<ActionMenuProps> = ({
  project, toggleDisableProject,
}) => {
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

  return (
    <Menu items={menuItems} onClick={handleMenuClick} />
  )
}

export const ProjectList = withEnhancedTable(
  connector(ProjectListComponent),
  'projectList',
  {
    maintainHistory: true,
  },
)
