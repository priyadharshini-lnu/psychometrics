import _ from 'lodash'
import React, { useEffect } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  Table,
  Input,
  Pagination,
  Button,
  Space,
  Image,
  Typography,
  MenuProps,
  Radio,
  Avatar,
  Row,
  Col,
  App,
  Skeleton,
} from 'antd'
import { PlusOutlined } from '~/glint/icons/AccessibleIconsAntDesign'

import { MenuItem } from '~/interfaces/Antd'
import { openModal } from '~/modules/admin/core/ui/modals'
import { TableProps } from '~/modules/admin/hoc/withEnhancedTable/interfaces'

import withEnhancedTable from '~/modules/admin/hoc/withEnhancedTable'
import Modals from '~/modules/admin/components/Modals/'
import { useResources } from '~/hooks/useResources'
import { getErrorMsgFromJsonApiRequests } from '~/hooks/useResources/utils'
import { Project, ProjectTR } from '~/modules/admin/modules/client/core/projects'
import { BaseMeta } from '~/hooks/useResources/interfaces'
import { TableLayout } from '~/modules/admin/components/TableLayout'
import ConditionalDropdown from '~/components/ConditionalDropdown'
import { CreateProjectModal } from './CreateProjectModal'
import styles from './styles.less'
import { useWindowSize } from '~/hooks/useWindowSize'
import { useClientContext } from '../../ClientContext'

const { I18n } = window

const MODALS = {
  CreateProjectModal,
}

const { Column } = Table
const { Search } = Input

const connector = connect(
  () => ({}),
  {
    openModal,
  },
)

type PropsFromRedux = ConnectedProps<typeof connector>
type Props = PropsFromRedux & TableProps

const ProjectListComponent: React.FC<Props> = ({ openModal }) => {
  const { clientId } = useParams() as { clientId: string }
  const { modal, message } = App.useApp()
  const { width: windowWidth } = useWindowSize()
  const navigate = useNavigate()

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
    modal.confirm({
      title: I18n.t(`admin.${action}_title`),
      content: I18n.t(`admin.${action}_content`, { project_name: name }),
      onOk: () => {
        updateResource(
          {
            id,
            disabled: !disabled,
          },
        ).then(() => {
          message.success(I18n.t(`admin.${action}_success`, { project_name: name }))
          fetch()
        })
      },
    })
  }

  const handleProjectStatusChange = (e) => {
    changeFilter('disabled_true', e.target.value)
  }

  const client = useClientContext()

  const ProjectTable = (
    <>
      <Table
        dataSource={data}
        loading={tableLoading}
        onChange={handleTableChange}
        pagination={false}
        scroll={{ x: 'max-content' }}
        rowKey={row => row.id}
        sticky={{ offsetHeader: 50 }}
      >
        <Column
          title={I18n.t('common.column.id')}
          dataIndex="id"
          fixed={windowWidth > 800 ? 'left' : undefined}
          key="id"
          sorter
          sortOrder={getSortOrder('id')}
          width={100}
        />
        <Column
          title={I18n.t('common.column.details')}
          key="name"
          width={500}
          render={({
            id, logo, name, url,
          }) => (
            <div>
              <Row gutter={40} wrap={false}>
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
                            navigate(`/admin/projects/${id}/new_campaigns?filters[statusEq]=active`)
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
                    orientation="vertical"
                  >
                    <Link
                      className={styles.campaignLink}
                      to={`/admin/projects/${id}/new_campaigns?filters[statusEq]=active`}
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
          title={I18n.t('admin.projects_columns_project_number')}
          key="number"
          dataIndex="number"
          render={number => (
            <div style={{ minWidth: 150 }}>{number}</div>
          )}
          sorter
          sortOrder={getSortOrder('number')}
        />

        <Column
          title={I18n.t('shared.created_by')}
          key="created_by"
          render={project => project.creator?.name}
          minWidth={150}
        />

        <Column
          title={I18n.t('shared.created_date')}
          key="created_at"
          dataIndex="createdAt"
          sorter
          sortOrder={getSortOrder('created_at')}
          minWidth={150}
        />

        <Column
          title={I18n.t('shared.modified_by')}
          key="modified_by"
          render={project => project.modifier?.name}
          minWidth={150}
        />

        <Column
          title={I18n.t('shared.modified_date')}
          key="updated_at"
          dataIndex="updatedAt"
          sorter
          sortOrder={getSortOrder('updated_at')}
          minWidth={150}
        />

        {client?.meta?.permissions?.canManageProject && (
          <Column
            title={I18n.t('shared.action')}
            key="action"
            fixed={windowWidth > 800 ? 'right' : undefined}
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
            width={100}
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
          {I18n.t('admin.status_active')}
        </Radio.Button>
        <Radio.Button value="true">
          {I18n.t('admin.status_archived')}
        </Radio.Button>
      </Radio.Group>
      <Search
        placeholder={I18n.t('shared.search')}
        value={getFilteredValue('filterable_fields')}
        onChange={e => changeFilter('filterable_fields', e.target.value)}
      />
      {client?.meta?.permissions?.canManageProject
        && (
          <Button
            type="primary"
            disabled={tableLoading}
            onClick={() => {
              openModal('CreateProjectModal', { addProject: createResource })
            }}
          >
            <PlusOutlined />
            {I18n.t('admin.projects_addProject')}
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
        failureMsg={getErrorMsgFromJsonApiRequests(requests)}
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

  const menuItems: MenuItem[] = []

  if (disabled) {
    menuItems.push({
      key: 'unarchive',
      label: I18n.t('admin.actions_unarchive'),
    })
  } else {
    menuItems.push({
      key: 'archive',
      label: I18n.t('admin.actions_archive'),
    })
  }

  const handleMenuClick = ({ key }) => {
    if (_.includes(['archive', 'unarchive'], key)) {
      toggleDisableProject(project)
    }
  }

  return ({ items: menuItems, onClick: handleMenuClick })
}

export const ProjectList = withEnhancedTable<{}>(
  connector(ProjectListComponent),
  'projectList',
  {
    maintainHistory: true,
  },
)
