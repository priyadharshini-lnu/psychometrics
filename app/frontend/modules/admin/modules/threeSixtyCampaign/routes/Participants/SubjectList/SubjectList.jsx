import { useEffect, useMemo, useState } from 'react'
import _ from 'lodash'
import {
  Table, Row, Col, App, Checkbox, Flex,
} from 'antd'
import { useParams, useSearchParams } from 'react-router-dom'
import { connect } from 'react-redux'
import { CountDisplay } from '~/components/CountDisplay'
import userPresenter from '~/presenters/user'
import UserEditModal from '~/modules/admin/modules/threeSixtyCampaign/components/UserEditModal'
import ResetSubjectModal from '~/modules/admin/modules/threeSixtyCampaign/components/ResetSubjectModal'
import ResetPasswordModal from '~/modules/admin/modules/threeSixtyCampaign/routes/Participants/ResetPasswordModal'
import ConditionalDropdown from '~/components/ConditionalDropdown'
import { getActionsMenuProps } from './getActionsMenuProps'
import ToolsDropdown from '../ToolsDropdown'
import { Manage } from '../Manage'
import CreateSubjectsDropdown from './CreateSubjectsDropdown'
import SubjectImportModal from './SubjectImportModal'
import Pagination from '../../../components/Pagination'
import SearchInput from '../SearchInput'
import { useWindowSize } from '~/hooks/useWindowSize'
import { useSelectAll } from '~/hooks/useSelectAll'
import { getFeatures } from '~/core/config'

const { Column } = Table

function SubjectList ({
  fetchSubjects,
  update,
  remove,
  subjects,
  openModal,
  removeUser,
  downloadReport,
  regenerateReport,
  total,
  permissions,
  cachingEnabled,
  allowCaching,
  searchTerm,
  editUser,
  reportAvailableLanguages,
  reportDefaultLanguage,
  reportIcon,
  reportName,
  category,
  template,
}) {
  const { projectId, campaignId } = useParams()
  const [params] = useSearchParams()
  const page = params.get('page') || 1
  const { message } = App.useApp()
  const [showResetSubjectModal, setShowResetSubjectModal] = useState(false)
  const { width: windowWidth } = useWindowSize()
  const isSkillRater = category === 'skill_rater'
  const {
    isAllSelected, excludedKeys, selectedKeys, onSelectionChange, onAllSelect,
  } = useSelectAll(false, subjects)

  const normalizedSubjectsData = useMemo(() => _.keyBy(subjects, 'id'), [subjects])

  const [selectedCount, setSelectedCount] = useState(0)

  useEffect(() => {
    fetchSubjects(campaignId, page, searchTerm)
  }, [page, searchTerm])

  useEffect(() => {
    // Dynamically update the selected count whenever selection changes
    const count = isAllSelected ? total - excludedKeys.length : selectedKeys.length
    setSelectedCount(count)
  }, [isAllSelected, excludedKeys, selectedKeys, total])

  const rowSelection = {
    selectedRowKeys: selectedKeys,
    onChange: onSelectionChange,
    preserveSelectedRowKeys: true,
  }

  const curriedFetchSubjects = _.curry(fetchSubjects)

  const openParticipantModal = (user) => {
    openModal('ParticipantModal', {
      user,
      permissions,
      onClose: () => fetchSubjects(campaignId, page, searchTerm),
    })
  }
  const onUserUpdate = () => fetchSubjects(campaignId, page)

  return (
    <>
      <Flex
        justify="space-between"
        align="middle"
        className="pb-4 ps-3 pe-5"
      >
        <CountDisplay
          selectedCount={selectedCount ?? 0}
          totalCount={total}
        />

        <Flex gap={8}>
          <SearchInput
            onChange={curriedFetchSubjects(campaignId)}
            path="/participants/subjects"
            searchTerm={searchTerm}
            style={{ marginRight: 0 }}
          />
          <Manage />
          {!template
          && (
            <ToolsDropdown
              isBulk
              title={I18n.t('shared.actions')}
              permissions={permissions}
              selectedKeys={selectedKeys}
              excludedKeys={excludedKeys}
              isAllSelected={isAllSelected}
              normalizedSubjectsData={normalizedSubjectsData}
              cachingEnabled={cachingEnabled}
              allowCaching={allowCaching}
            />
          )
          }
          {!template && (
            <ToolsDropdown
              permissions={permissions}
              selectedKeys={selectedKeys}
              excludedKeys={excludedKeys}
              isAllSelected={isAllSelected}
              normalizedSubjectsData={normalizedSubjectsData}
              cachingEnabled={cachingEnabled}
              allowCaching={allowCaching}
            />
          )}
          {permissions.addSubject && !template && (
            <CreateSubjectsDropdown />
          )}
        </Flex>

      </Flex>
      <div className="pb-4 ps-3 pe-5">
        <Row>
          <Col>
            <Checkbox
              checked={isAllSelected && total === selectedCount}
              onChange={e => onAllSelect(e.target.checked)}
              className="font-normal text-nowrap flex items-center"
              indeterminate={isAllSelected && total !== selectedCount}
            >
              {I18n.t('admin.scoring_select_all', { n: total ?? 0 })}
            </Checkbox>
          </Col>
        </Row>
      </div>
      <Row>
        <Col span={24}>
          <Table
            className="mtm"
            rowKey="id"
            dataSource={subjects}
            pagination={false}
            scroll={{ x: 'max-content' }}
            rowSelection={rowSelection}
          >
            <Column
              title={I18n.t('shared.name')}
              fixed={windowWidth > 800 ? 'left' : undefined}
              key="fullName"
              render={({ user, permissions }) => (
                <a
                  role="button"
                  tabIndex="0"
                  onClick={() => openParticipantModal(user, permissions)}
                >
                  {userPresenter.getFullName(user)}
                </a>
              )}
            />
            <Column
              title={I18n.t('shared.email')}
              key="user_email"
              render={({ user }) => user.email}
            />

            {isSkillRater && (
              <>
                <Column
                  title={I18n.t('admin.current_job_role')}
                  key="current_job_role"
                  render={({ user }) => user.currentJobRole || '—'}
                />
                <Column
                  title={I18n.t('admin.target_job_role')}
                  key="target_job_role"
                  render={({ user }) => user.targetJobRole || '—'}
                />
              </>
            )}

            <Column
              title={I18n.t('admin.evaluations_received')}
              dataIndex="evaluators"
              key="received_evaluations"
            />
            <Column
              title={I18n.t('admin.evaluations_completed')}
              dataIndex="evaluations"
              key="completed_evaluations"
            />

            <Column
              title={I18n.t('admin.report_status')}
              key="report_status"
              render={({ reportStatus }) => I18n.t(`reports.statuses.${reportStatus}`)}
            />

            <Column
              title={I18n.t('admin.evaluation_status')}
              key="status"
              render={(record) => {
                const { status } = record
                return I18n.t(`admin.${status}`)
              }}
            />

            <Column
              key="action"
              fixed={windowWidth > 800 ? 'right' : undefined}
              title={I18n.t('shared.action')}
              render={({
                id, user: { email }, user, permissions, userReportId,
              }) => (
                <ConditionalDropdown
                  menu={
                    getActionsMenuProps({
                      subjectId: id,
                      email,
                      user,
                      projectId,
                      campaignId,
                      userReportId,
                      update,
                      remove,
                      removeUser,
                      downloadReport,
                      openModal,
                      editUser,
                      onUserUpdate,
                      permissions,
                      regenerateReport,
                      message,
                      setShowResetSubjectModal,
                      reportAvailableLanguages,
                      reportDefaultLanguage,
                      reportIcon,
                      reportName,
                      subjects,
                    })
                  }
                  placement="bottomRight"
                  autoAdjustOverflow={false}
                />
              )}
            />
          </Table>
          <div className="pm">
            <Pagination total={total} path="/participants/subjects" />
          </div>
        </Col>
      </Row>
      <SubjectImportModal />
      <UserEditModal />
      <ResetSubjectModal open={showResetSubjectModal} />
      <ResetPasswordModal />
    </>
  )
}

const mapStateToProps = state => ({
  features: getFeatures(state),
})

export default connect(mapStateToProps)(SubjectList)
