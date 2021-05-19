import React, { useEffect } from 'react'
import {
  Row, Col, Table, Dropdown, Menu, Input, Pagination, Modal, message, Button, Space,
} from 'antd'
import {
  MoreOutlined, AppstoreOutlined, ExclamationCircleOutlined, PlusOutlined, DeleteOutlined,
} from '@ant-design/icons'
import { connect, ConnectedProps } from 'react-redux'
import isEmpty from 'lodash/isEmpty'
import {
  get as getAssessorAssessments, fetch, reset, selectRecords, getSelectedIds, bulkDelete, BULK_DELETE,
} from 'modules/admin/modules/campaigns/core/assessorAssessments'
import { getCurrent } from 'modules/admin/modules/campaigns/core/assessors'
import { isRequestInProgress } from 'modules/admin/core/request'
import { RootState } from 'modules/admin/core/rootReducers'
import settings from 'modules/admin/settings'
import withEnhancedTable from 'modules/admin/hoc/withEnhancedTable/'
import { TableProps } from 'modules/admin/hoc/withEnhancedTable/interfaces'
import { useParams } from 'react-router-dom'
import Modals from 'modules/admin/components/Modals/'
import { openModal } from 'modules/admin/core/ui/modals'
import styles from './styles.scss'
import AddAssessmentModal from './AddAssessmentModal'

const { Column } = Table
const { I18n } = window
const { Search } = Input

const connecter = connect(
  (state: RootState) => ({
    assessor: getCurrent(state),
    assessorAssessments: getAssessorAssessments(state),
    selectedIds: getSelectedIds(state),
    bulkDeleteInProgress: isRequestInProgress(state, BULK_DELETE),
  }),
  {
    fetch,
    reset,
    selectRecords,
    bulkDelete,
    openModal,
  },
)

type PropsFromRedux = ConnectedProps<typeof connecter>
type Props = TableProps & PropsFromRedux

const MODALS = { AddAssessmentModal }

const AssessmentList: React.FC<Props> = ({
  assessorAssessments: { list, total },
  assessor,
  fetch,
  reset,
  selectRecords,
  selectedIds,
  bulkDelete,
  bulkDeleteInProgress,
  tableConfig: { filters, page },
  tableConfig,
  changeFilter,
  onTableChange,
  getSortOrder,
  changePage,
  openModal,
}) => {
  const { campaignId, id } = useParams<{ campaignId: string, id: string }>()
  const parsedCampaignId = parseInt(campaignId, 10)
  const parsedAssessorId = parseInt(id, 10)

  useEffect(() => {
    fetch(parsedCampaignId, parsedAssessorId, tableConfig)
  }, [tableConfig])

  const handleBulkDelete = () => {
    Modal.confirm({
      title: I18n.t('common.text.confirm'),
      icon: <ExclamationCircleOutlined />,
      centered: true,
      width: 650,
      content: I18n.t('administration.assessor.assessments.bulk_delete_confirmation'),
      okText: I18n.t('common.text.ok'),
      cancelText: I18n.t('common.text.cancel'),
      onOk: async () => {
        await bulkDelete(parsedCampaignId, parsedAssessorId, selectedIds)
        await fetch(parsedCampaignId, parsedAssessorId, tableConfig)
        message.success(I18n.t('administration.assessor.assessments.bulk_delete_successful'))
      },
    })
  }

  return (
    <>
      <Row justify="space-between" className="pm">
        <Col span={4} className="pls">
          <AppstoreOutlined style={{ fontSize: '16px' }} />
          <span className="mlm">{`${total} ${I18n.t('common.model.assessments')}`}</span>
        </Col>
        <div className="float-r">
          <div className={styles.newReportButton}>
            <Space>
              {!isEmpty(selectedIds) && assessor && assessor.permissions.removeSubject && (
              <Button
                type="default"
                danger
                icon={<DeleteOutlined />}
                onClick={handleBulkDelete}
                disabled={bulkDeleteInProgress}
                loading={bulkDeleteInProgress}
              >
                <span>Remove</span>
              </Button>
              )}
              <Search
                placeholder="Search"
                className={styles.searchInput}
                value={filters.filterableFields}
                onChange={e => changeFilter('filterBySubjectOrAssessment', e.target.value)}
              />
              {assessor && assessor.permissions.addSubject && (
                <Button
                  type="primary"
                  onClick={() => openModal('AddAssessmentModal')}
                >
                  <PlusOutlined />
                  <span>{I18n.t('administration.assessor.assessments.actions.add_subject')}</span>
                </Button>
              )}
            </Space>
          </div>
        </div>
      </Row>
      <Row>
        <Col span={24}>
          <Table
            className="mtm mbl"
            rowKey="id"
            dataSource={list}
            onChange={onTableChange}
            pagination={false}
            rowSelection={{ type: 'checkbox', onChange: (ids: number[]) => { selectRecords(ids) } }}
          >
            <Column
              title={I18n.t('common.column.id')}
              dataIndex="id"
              sorter
              sortOrder={getSortOrder('id')}
              key="id"
            />
            <Column
              title={I18n.t('administration.assessor.assessments.subject_name')}
              dataIndex="subjectName"
              sorter
              sortOrder={getSortOrder('subjectName')}
              key="subjectName"
            />
            <Column
              title={I18n.t('administration.assessor.assessments.subject_name')}
              dataIndex="subjectEmail"
              key="subjectEmail"
            />
            <Column
              title={I18n.t('campaign_assessment.column.assessment_name')}
              key="assessmentName"
              dataIndex="assessmentName"
            />
            <Column
              title={I18n.t('common.column.status')}
              key="status"
              render={({ status }) => I18n.t(`campaign_assessment.statuses.${status}`)}
            />
            <Column
              title={I18n.t('common.column.action')}
              key="action"
              render={({ subjectEmail, id, permissions }) => (
                <Dropdown
                  overlay={() => (
                    ActionsMenu({
                      subjectEmail,
                      reset: () => reset(parsedCampaignId, parsedAssessorId, id),
                      permissions,
                    }) as React.ReactElement
                  )}
                  trigger={['click']}
                >
                  <a>
                    <MoreOutlined />
                  </a>
                </Dropdown>
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
    </>
  )
}

interface ActionsMenuProps {
  subjectEmail: string
  reset(): Promise<{ response: unknown}>
  permissions: {
    resetEvaluation: boolean
  }
}

const ActionsMenu: React.FC<ActionsMenuProps> = ({ subjectEmail, reset, permissions }) => {
  const handleReset = () => {
    Modal.confirm({
      title: I18n.t('common.text.confirm'),
      icon: <ExclamationCircleOutlined />,
      centered: true,
      width: 650,
      content: I18n.t('administration.assessor.assessments.reset_confirmation', { subjectEmail }),
      okText: I18n.t('common.text.ok'),
      cancelText: I18n.t('common.text.cancel'),
      onOk: () => {
        reset()
        message.success(I18n.t('administration.assessor.assessments.reset_successfully', { subjectEmail }))
      },
    })
  }

  return (
    <Menu>
      <Menu.Item key="reset" disabled={!permissions.resetEvaluation}>
        <div
          role="button"
          tabIndex={-1}
          onClick={handleReset}
        >
          {I18n.t('administration.assessor.assessments.actions.reset')}
        </div>
      </Menu.Item>
    </Menu>
  )
}


export default connecter(withEnhancedTable<{}>(AssessmentList, 'assessorAssessmentsList', { maintainHistory: true }))
