import React, { useEffect, useState } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import {
  Table, Row, Col, Input, Pagination, Button, message,
} from 'antd'
import { Link, useParams } from 'react-router-dom'
import {
  AppstoreOutlined, PlusOutlined, MoreOutlined,
} from '~/glint/icons/AccessibleIconsAntDesign'
import { isRequestInProgress } from '~/core/request'
import {
  fetch,
  FETCH,
  remove,
  get as getAssessors,
} from '~/modules/admin/modules/campaigns/core/assessors'
import { openModal } from '~/modules/admin/core/ui/modals'
import { RootState } from '~/modules/admin/core/rootReducers'
import ConditionalDropdown from '~/components/ConditionalDropdown'
import AnswerableConfirmationModal from '~/components/AnswerableConfirmationModal'
import withEnhancedTable from '~/modules/admin/hoc/withEnhancedTable'
import { TableConfig } from '~/modules/admin/core/filterAndPagination/interfaces'
import settings from '~/modules/admin/settings'
import Modals from '~/modules/admin/components/Modals/'
import User from '~/modules/admin/modules/campaigns/interfaces/User'
import { get as getCurrentUser } from '~/core/currentUser'
import { getActionsMenuProps } from './getActionsMenuProps'
import styles from './styles.less'
import AssessorFormModal from './AssessorFormModal'
import ImportAssessorsModal from './ImportAssessorsModal'
import ToolsDropdown from './ToolsDropdown'

const connecter = connect(
  (state: RootState) => ({
    assessors: getAssessors(state),
    currentUser: getCurrentUser(state) as User,
    isLoadingAssessors: isRequestInProgress(state, FETCH),
  }),
  {
    fetch,
    remove,
    openModal,
  },
)

const MODALS = {
  AssessorFormModal,
  ImportAssessorsModal,
}

const { Column } = Table
const { Search } = Input
const { I18n } = window

interface AssessorToDelete {
  id: number
  email: string
  workshopAssessorsCount: number
  totalEvaluations: number
}

interface Props extends ConnectedProps<typeof connecter> {
  tableConfig: TableConfig
  changeFilter(filterName: string, filterValue: string): void
  onTableChange(): void
  getSortOrder(column: string): 'descend' | 'ascend'
  changePage(page: number): void
}

const AssessorList: React.FC<Props> = ({
  fetch,
  assessors: {
    list,
    total,
    permissions,
  },
  isLoadingAssessors,
  tableConfig: {
    filters,
    page,
  },
  tableConfig,
  changeFilter,
  onTableChange,
  getSortOrder,
  changePage,
  openModal,
  remove,
}) => {
  const { campaignId, projectId } = useParams() as { projectId: string, campaignId: string }
  const [assessorToDelete, setAssessorToDelete] = useState<AssessorToDelete | null>(null)

  useEffect(() => {
    fetch(campaignId, tableConfig)
  }, [tableConfig])

  const handleConfirmRemove = async () => {
    if (!assessorToDelete) return
    await remove(campaignId, assessorToDelete.id)
    message.success(I18n.t('campaign_users.details.modals.remove.successfully', { email: assessorToDelete.email }))
    setAssessorToDelete(null)
  }

  const buildWarningMessage = (workshopAssessorsCount: number, totalEvaluations: number) => {
    if (workshopAssessorsCount === 0 && totalEvaluations === 0) return undefined

    return (
      <div>
        {workshopAssessorsCount > 0 && (
          <p>
            {I18n.t('admin.assessor_remove_in_assessment_centers', { workshop_count: workshopAssessorsCount })}
          </p>
        )}
        {totalEvaluations > 0 && (
          <p>
            {I18n.t('admin.assessor_remove_has_evaluations', { evaluation_count: totalEvaluations })}
          </p>
        )}
      </div>
    )
  }

  return (
    <div>
      <Row justify="space-between" className="pm">
        <Col span={4} className="pls">
          <AppstoreOutlined style={{ fontSize: '16px' }} />
          <span className="mlm">{I18n.t('admin.assessor_count', { count: total })}</span>
        </Col>
        <div>
          <ToolsDropdown campaignId={parseInt(campaignId, 10)} openModal={openModal} permissions={permissions} />
          <Search
            placeholder={I18n.t('common.actions.search')}
            className={styles.searchInput}
            value={filters.filterableFields}
            onChange={e => changeFilter('filterableFields', e.target.value)}
          />
          {permissions.add && (
            <div className={styles.newUserButton}>
              <Button type="primary" onClick={() => openModal('AssessorFormModal', { campaignId, projectId })}>
                <PlusOutlined />
                <span>{I18n.t('admin.assessor_create_assessor')}</span>
              </Button>
            </div>
          )}
        </div>
      </Row>
      <Row>
        <Col span={24}>
          <Table
            className="mtm"
            rowKey="id"
            loading={isLoadingAssessors}
            dataSource={list}
            onChange={onTableChange}
            pagination={false}
          >
            <Column
              title={I18n.t('shared.id')}
              key="id"
              sorter
              sortOrder={getSortOrder('id')}
              render={({ id }) => (
                <Link to={`/admin/projects/${projectId}/new_campaigns/${campaignId}/participants/assessors/${id}`}>
                  {id}
                </Link>
              )}
            />
            <Column
              title={I18n.t('shared.name')}
              key="fullName"
              dataIndex="fullName"
              sorter
              sortOrder={getSortOrder('fullName')}
            />
            <Column
              title={I18n.t('shared.email')}
              key="email"
              dataIndex="email"
            />
            <Column
              title={I18n.t('shared.status')}
              key="status"
              render={({ status }) => I18n.t(`admin.assessor_statuses_${status}`)}
            />
            <Column
              title={I18n.t('admin.assessor_evaluations')}
              key="evaluationsCompleted"
              render={({ totalEvaluations, completedEvaluations }) => `${completedEvaluations} / ${totalEvaluations}`}
            />
            <Column
              title={I18n.t('shared.manage')}
              key="action"
              render={assessor => (
                <ConditionalDropdown
                  menu={
                    getActionsMenuProps({
                      campaignId,
                      id: assessor.id,
                      permissions: assessor.permissions,
                      onRemoveClick: () => setAssessorToDelete({
                        id: assessor.id,
                        email: assessor.email,
                        workshopAssessorsCount: assessor.workshopAssessorsCount,
                        totalEvaluations: assessor.totalEvaluations,
                      }),
                    })
                  }
                  innerElement={(
                    <a>
                      <MoreOutlined />
                    </a>
                  )}
                />
              )}
            />
          </Table>
        </Col>
      </Row>
      <div className="pl">
        <Pagination
          current={page}
          pageSize={settings.pagination.defaultPageSize}
          total={total}
          onChange={changePage}
          hideOnSinglePage
        />
      </div>
      <Modals modals={MODALS} />
      {assessorToDelete && (
        <AnswerableConfirmationModal
          confirmationMessage={I18n.t('admin.assessor_remove_confirmation', { email: assessorToDelete.email })}
          warningMessage={buildWarningMessage(
            assessorToDelete.workshopAssessorsCount,
            assessorToDelete.totalEvaluations,
          )}
          requiredAnswer={assessorToDelete.email}
          onConfirm={handleConfirmRemove}
          onCancel={() => setAssessorToDelete(null)}
        />
      )}
    </div>
  )
}

export default connecter(withEnhancedTable<{}>(AssessorList, 'assessorsList', { maintainHistory: true }))
