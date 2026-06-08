import React, { useEffect } from 'react'
import {
  Row, Col, Table, MenuProps, Input, Pagination, Button, Space, App,
} from 'antd'
import type { ModalStaticFunctions } from 'antd/es/modal/confirm'
import type { MessageInstance } from 'antd/es/message/interface'
import { connect, ConnectedProps } from 'react-redux'
import isEmpty from 'lodash/isEmpty'
import { useParams } from 'react-router-dom'
import {
  MoreOutlined, AppstoreOutlined, ExclamationCircleOutlined, PlusOutlined, DeleteOutlined,
} from '~/glint/icons/AccessibleIconsAntDesign'
import { MenuItem } from '~/interfaces/Antd'
import ConditionalDropdown from '~/components/ConditionalDropdown'
import {
  get as getAssessorAssessments, fetch, reset, resetProgress, selectRecords, getSelectedIds, bulkDelete, BULK_DELETE,
  rescore,
} from '~/modules/admin/modules/campaigns/core/assessorAssessments'
import { getCurrent } from '~/modules/admin/modules/campaigns/core/assessors'
import { RootState } from '~/modules/admin/core/rootReducers'
import settings from '~/modules/admin/settings'
import withEnhancedTable from '~/modules/admin/hoc/withEnhancedTable/'
import { TableProps } from '~/modules/admin/hoc/withEnhancedTable/interfaces'
import Modals from '~/modules/admin/components/Modals/'
import { openModal } from '~/modules/admin/core/ui/modals'
import { isRequestInProgress } from '~/core/request'
import styles from './styles.less'
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
    resetProgress,
    selectRecords,
    bulkDelete,
    openModal,
    rescore,
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
  resetProgress,
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
  rescore,
}) => {
  const { campaignId, id } = useParams() as { campaignId: string, id: string }
  const { modal, message } = App.useApp()
  const parsedCampaignId = parseInt(campaignId, 10)
  const parsedAssessorId = parseInt(id, 10)

  useEffect(() => {
    fetch(parsedCampaignId, parsedAssessorId, tableConfig)
  }, [tableConfig])

  const handleBulkDelete = () => {
    modal.confirm({
      title: I18n.t('common.text.confirm'),
      icon: <ExclamationCircleOutlined />,
      centered: true,
      width: 650,
      content: I18n.t('admin.assessor_assessments_bulk_delete_confirmation'),
      okText: I18n.t('common.text.ok'),
      cancelText: I18n.t('shared.cancel'),
      onOk: async () => {
        await bulkDelete(parsedCampaignId, parsedAssessorId, selectedIds || [])
        await fetch(parsedCampaignId, parsedAssessorId, tableConfig)
        message.success(I18n.t('admin.assessor_assessments_bulk_delete_successful'))
      },
    })
  }

  return (
    <>
      <Row justify="space-between" className="pm">
        <Col span={4} className="pls">
          <AppstoreOutlined style={{ fontSize: '16px' }} />
          <span className="mlm">{`${total} ${I18n.t('admin.assessments')}`}</span>
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
                  <span>{I18n.t('shared.remove')}</span>
                </Button>
              )}
              <Search
                placeholder={I18n.t('shared.search')}
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
                  <span>{I18n.t('admin.assessor_assessments_actions_add_subject')}</span>
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
              title={I18n.t('shared.id')}
              dataIndex="id"
              sorter
              sortOrder={getSortOrder('id')}
              key="id"
            />
            <Column
              title={I18n.t('admin.assessor_assessments_subject_name')}
              dataIndex="subjectName"
              sorter
              sortOrder={getSortOrder('subjectName')}
              key="subjectName"
            />
            <Column
              title={I18n.t('admin.assessor_assessments_subject_email')}
              dataIndex="subjectEmail"
              key="subjectEmail"
            />
            <Column
              title={I18n.t('shared.assessment_name')}
              key="assessmentName"
              dataIndex="assessmentName"
            />
            <Column
              title={I18n.t('shared.status')}
              key="status"
              render={({ status }) => I18n.t(`campaign_assessment.statuses.${status}`)}
            />
            <Column
              title={I18n.t('shared.action')}
              key="action"
              render={({ subjectEmail, id, permissions }) => (
                <ConditionalDropdown
                  menu={
                    getActionsMenuProps({
                      subjectEmail,
                      reset: () => reset(parsedCampaignId, parsedAssessorId, id),
                      resetProgress: () => resetProgress(parsedCampaignId, parsedAssessorId, id),
                      rescore: () => rescore(parsedCampaignId, parsedAssessorId, id),
                      permissions,
                      modal,
                      message,
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
    </>
  )
}

interface ActionsMenuData {
  subjectEmail: string
  reset(): Promise<{ response: unknown}>
  rescore(): Promise<{ response: unknown}>
  resetProgress(): Promise<{ response: unknown}>
  permissions: {
    resetEvaluation: boolean
    resetProgress: boolean
    rescore: boolean
  }
  modal: Omit<ModalStaticFunctions, 'warn'>
  message: MessageInstance
}

const getActionsMenuProps = ({
  subjectEmail, reset, resetProgress, permissions, rescore, modal, message,
}: ActionsMenuData): MenuProps => {
  const handleReset = () => {
    modal.confirm({
      title: I18n.t('shared.confirm'),
      icon: <ExclamationCircleOutlined />,
      centered: true,
      width: 650,
      content: I18n.t('admin.assessor_assessments_reset_confirmation', { subjectEmail }),
      okText: I18n.t('shared.ok'),
      cancelText: I18n.t('shared.cancel'),
      onOk: () => {
        reset()
        message.success(I18n.t('admin.assessor_assessments_reset_successfully', { subjectEmail }))
      },
    })
  }

  const handleResetProgress = () => {
    modal.confirm({
      title: I18n.t('shared.confirm'),
      icon: <ExclamationCircleOutlined />,
      centered: true,
      width: 650,
      content: I18n.t('admin.assessor_assessments_reset_progress_confirmation', { subjectEmail }),
      okText: I18n.t('shared.ok'),
      cancelText: I18n.t('shared.cancel'),
      onOk: () => {
        resetProgress()
        message.success(I18n.t('admin.assessor_assessments_reset_progress_successfully', { subjectEmail }))
      },
    })
  }

  const menuItems: MenuItem[] = []
  if (permissions.resetEvaluation) {
    menuItems.push({ key: 'reset', label: I18n.t('admin.assessor_assessments_actions_reset') })
  }
  if (permissions.resetProgress) {
    menuItems.push({
      key: 'resetProgress',
      label: I18n.t('admin.assessor_assessments_actions_reset_progress'),
    })
  }
  if (permissions.rescore) {
    menuItems.push({ key: 'rescore', label: I18n.t('admin.assessor_assessments_actions_rescore') })
  }


  const handleMenuClick = ({ key }) => {
    if (key === 'reset') {
      return handleReset()
    }
    if (key === 'resetProgress') {
      return handleResetProgress()
    }
    if (key === 'rescore') {
      return rescore()
    }
  }
  return ({ items: menuItems, onClick: handleMenuClick })
}

export default connecter(withEnhancedTable<{}>(AssessmentList, 'assessorAssessmentsList', { maintainHistory: true }))
