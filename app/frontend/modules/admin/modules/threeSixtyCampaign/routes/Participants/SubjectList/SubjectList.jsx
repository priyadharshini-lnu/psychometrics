import { useEffect, useState } from 'react'
import _ from 'lodash'
import {
  Table, Row, Col, App,
} from 'antd'
import { UserOutlined } from '@ant-design/icons'
import { useParams, useSearchParams } from 'react-router-dom'
import userPresenter from '~/presenters/user'
import UserEditModal from '~/modules/admin/modules/threeSixtyCampaign/components/UserEditModal'
import ResetSubjectModal from '~/modules/admin/modules/threeSixtyCampaign/components/ResetSubjectModal'
import ConditionalDropdown from '~/components/ConditionalDropdown'
import { getActionsMenuProps } from './getActionsMenuProps'
import ToolsDropdown from '../ToolsDropdown'
import { Manage } from '../Manage'
import CreateSubjectsDropdown from './CreateSubjectsDropdown'
import CreateSubjectModal from './CreateSubjectModal'
import SubjectImportModal from './SubjectImportModal'
import ResetPasswordModal from '../ResetPasswordModal'
import Pagination from '../../../components/Pagination'
import SearchInput from '../SearchInput'
import { useWindowSize } from '~/hooks/useWindowSize'

const { Column } = Table

export default function SubjectList ({
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
  searchTerm,
  editUser,
  currentCampaignId,
}) {
  const { campaignId } = useParams()
  const [params] = useSearchParams()
  const page = params.get('page') || 1
  const { message } = App.useApp()
  const [showResetSubjectModal, setShowResetSubjectModal] = useState(false)
  const { width: windowWidth } = useWindowSize()
  useEffect(() => {
    fetchSubjects(campaignId, page, searchTerm)
  }, [page, searchTerm])
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
      <Row>
        <Col span={4} className="pll">
          <UserOutlined />
          <span className="mlm">{`${total} Subjects`}</span>
        </Col>
        <Col span={20} className="text-align-r">
          <SearchInput
            onChange={curriedFetchSubjects(campaignId)}
            path="/participants/subjects"
            searchTerm={searchTerm}
          />
          <Manage />
          <ToolsDropdown permissions={permissions} />
          {permissions.addSubject && (
            <CreateSubjectsDropdown />
          )}
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <Table
            className="mtm"
            rowKey="id"
            dataSource={subjects}
            pagination={false}
            scroll={{ x: 'max-content' }}
          >
            <Column
              title="Name"
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
              title="Email"
              key="user_email"
              render={({ user }) => user.email}
            />
            <Column
              title="Evaluations Received"
              dataIndex="evaluators"
              key="received_evaluations"
            />
            <Column
              title="Evaluations Completed"
              dataIndex="evaluations"
              key="completed_evaluations"
            />

            <Column
              title="Report Status"
              key="report_status"
              render={({ reportStatus }) => I18n.t(`reports.statuses.${reportStatus}`)
              }
            />

            <Column
              title="Status"
              key="status"
              render={({ status }) => I18n.t(`subjects.statuses.${status}`)}
            />

            <Column
              key="action"
              fixed={windowWidth > 800 ? 'right' : undefined}
              title="Action"
              render={({
                id, user: { email }, user, permissions,
              }) => (
                <ConditionalDropdown
                  menu={
                    getActionsMenuProps({
                      subjectId: id,
                      email,
                      user,
                      campaignId,
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
                      currentCampaignId,
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
      <CreateSubjectModal />
      <SubjectImportModal />
      <UserEditModal />
      <ResetSubjectModal open={showResetSubjectModal} />
      <ResetPasswordModal />
    </>
  )
}
