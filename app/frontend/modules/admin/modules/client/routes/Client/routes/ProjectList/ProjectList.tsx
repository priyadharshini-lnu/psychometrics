import React from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { useParams, Link } from 'react-router-dom'
import {
  Table, Row, Col, Input, Pagination, Button, Space,
} from 'antd'
import { PlusOutlined } from '@ant-design/icons'

import { openModal } from 'modules/admin/core/ui/modals'
import { TableProps } from 'modules/admin/hoc/withEnhancedTable/interfaces'

import withEnhancedTable from 'modules/admin/hoc/withEnhancedTable'
import Modals from 'modules/admin/components/Modals/'
import { CountDisplay } from 'components/CountDisplay'
import { CreateProjectModal } from 'modules/admin/modules/client/routes/Client/routes/ProjectList/CreateProjectModal'

const { I18n } = window

const MODALS = {
  CreateProjectModal,
}

const TestProjects = [
  {
    id: 1322,
  },
]
const isLoading = false
const permissions = { create: true }

const { Column } = Table
const { Search } = Input

const connector = connect(state => state,
  {
    openModal,
  })


type PropsFromRedux = ConnectedProps<typeof connector>

type Props = PropsFromRedux & TableProps

const ProjectListComponent: React.FC<Props> = ({
  tableConfig: { filters, page, pageSize },
  changeFilter,
  changePage,
  openModal,
}) => {
  const params = useParams<{ projectId: string }>()
  const clientId = parseInt(params.projectId, 10)

  return (
    <div>
      <Row justify="space-between" align="middle" className="pt-4 pb-4 ps-4 pe-4">
        <Col>
          <CountDisplay selectedCount={0} totalCount={TestProjects.length} isLoading={isLoading} />
        </Col>
        <Col>
          <Space>
            <Search
              placeholder="Search"
              value={filters.filterableFields}
              onChange={e => changeFilter('filterableFields', e.target.value)}
            />
            {permissions.create && (
              <Button type="primary" onClick={() => openModal('CommonCampaignFormModal', { clientId })}>
                <PlusOutlined />
                <span>{I18n.t('administration.projects.addProject')}</span>
              </Button>
            )}
          </Space>
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <Table
            dataSource={TestProjects}
          >
            <Column
              title="Logo Column"
              key="logoColumn"
            />
            <Column
              title="Project Number"
              key="projectNumber"
              render={({ id }) => <Link to={`/administration/projects/${id}/new_campaigns`}>{id}</Link>}
            />
            <Column
              title="Users Count"
              key="usersCount"
            />
            <Column
              title="Created Date"
              key="createdDate"
            />
            <Column
              title="Modified Date"
              key="modifiedDate"
            />
            <Column
              title="Actions"
              key="actions"
            />
          </Table>
        </Col>
      </Row>
      <div className="pl">
        <Pagination
          current={page}
          pageSize={pageSize}
          total={TestProjects.length}
          onChange={changePage}
        />
      </div>
      <Modals modals={MODALS} />
    </div>
  )
}

export const ProjectList = withEnhancedTable(
  connector(ProjectListComponent),
  'projectList',
  {
    maintainHistory: true,
  },
)
