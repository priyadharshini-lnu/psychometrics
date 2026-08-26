import { useEffect, useMemo, useState } from 'react'
import _ from 'lodash'
import {
  Button, Table, App, Flex,
} from 'antd'
import { useBreakpoint } from '@thetalententerprise/glint'
import { useParams, useSearchParams } from 'react-router-dom'
import { connect } from 'react-redux'
import userPresenter from '~/presenters/user'
import UserEditModal from '~/modules/admin/modules/threeSixtyCampaign/components/UserEditModal'
import ResetSubjectModal from '~/modules/admin/modules/threeSixtyCampaign/components/ResetSubjectModal'
import ResetPasswordModal from '~/modules/admin/modules/threeSixtyCampaign/routes/Participants/ResetPasswordModal'
import ConditionalDropdown from '~/components/ConditionalDropdown'
import { TableLayout } from '~/modules/admin/components/TableLayout'
import { getActionsMenuProps } from './getActionsMenuProps'
import ToolsDropdown from '../ToolsDropdown'
import { Manage } from '../Manage'
import CreateSubjectsDropdown from './CreateSubjectsDropdown'
import SubjectImportModal from './SubjectImportModal'
import settings from '../../../settings'
import SearchInput from '../SearchInput'
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
  const [params, setParams] = useSearchParams()
  const page = Number(params.get('page')) || 1
  const { message } = App.useApp()
  const [showResetSubjectModal, setShowResetSubjectModal] = useState(false)
  const screens = useBreakpoint()
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
    const count = isAllSelected ? total - excludedKeys.length : selectedKeys.length
    setSelectedCount(count)
  }, [isAllSelected, excludedKeys, selectedKeys, total])

  const rowSelection = {
    selectedRowKeys: selectedKeys,
    onChange: onSelectionChange,
    preserveSelectedRowKeys: true,
  }

  const curriedFetchSubjects = _.curry(fetchSubjects)

  const changePage = (nextPage) => {
    params.set('page', nextPage)
    setParams(params)
  }

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
      <TableLayout
        title={I18n.t('admin.subjects_title')}
        recordCount={total}
        pagination={{
          page,
          pageSize: settings.pageLimit,
          total,
          onChange: changePage,
        }}
        selectionSetting={{
          selectionAllowed: true,
          hasSelectInAllPages: isAllSelected,
          onSelectionChange: onAllSelect,
          label: I18n.t('admin.scoring_select_all', { n: total ?? 0 }),
        }}
        selectedCount={selectedCount}
        filters={(
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
                placement="bottomRight"
                menuStyle={{
                  maxHeight: '270px',
                }}
              />
            )}
            {permissions.addSubject && !template && (
              <CreateSubjectsDropdown />
            )}
          </Flex>
        )}
        table={(
          <Table
            rowKey="id"
            dataSource={subjects}
            pagination={false}
            scroll={{ x: 'max-content' }}
            rowSelection={rowSelection}
          >
            <Column
              title={I18n.t('shared.name')}
              fixed={screens.md ? 'left' : undefined}
              key="fullName"
              minWidth={200}
              render={({ user, permissions }) => (
                <Button
                  type="link"
                  size="small"
                  className="p-0"
                  onClick={() => openParticipantModal(user, permissions)}
                >
                  {user.isUat
                    ? `UAT - ${userPresenter.getFullName(user)}`
                    : userPresenter.getFullName(user)}
                </Button>
              )}
            />
            <Column
              title={I18n.t('shared.email')}
              key="user_email"
              minWidth={200}
              render={({ user }) => user.email}
            />

            {isSkillRater && (
              <>
                <Column
                  title={I18n.t('admin.current_job_role')}
                  key="current_job_role"
                  minWidth={150}
                  render={({ user }) => user.currentJobRole || '—'}
                />
                <Column
                  title={I18n.t('admin.target_job_role')}
                  key="target_job_role"
                  minWidth={150}
                  render={({ user }) => user.targetJobRole || '—'}
                />
              </>
            )}

            <Column
              title={I18n.t('admin.evaluations_received')}
              dataIndex="evaluators"
              key="received_evaluations"
              minWidth={100}
            />
            <Column
              title={I18n.t('admin.evaluations_completed')}
              dataIndex="evaluations"
              key="completed_evaluations"
              minWidth={100}
            />

            <Column
              title={I18n.t('admin.report_status')}
              key="report_status"
              minWidth={150}
              render={({ reportStatus }) => I18n.t(`reports.statuses.${reportStatus}`)}
            />

            <Column
              title={I18n.t('admin.evaluation_status')}
              key="status"
              minWidth={150}
              render={(record) => {
                const { status } = record
                return I18n.t(`admin.${status}`)
              }}
            />

            <Column
              key="action"
              fixed={screens.md ? 'right' : undefined}
              title={I18n.t('shared.action')}
              minWidth={100}
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
        )}
      />
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
