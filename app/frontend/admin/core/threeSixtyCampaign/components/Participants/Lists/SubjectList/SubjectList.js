import React, { useEffect } from 'react'
import {
  Table, Dropdown, Icon, Row, Col,
} from 'antd'
import userPresenter from 'presenters/userPresenter'
import css from './SubjectList.scss'
import ActionsMenu from './ActionMenu'
import ToolsDropdown from '../ToolsDropdown'
import CreateSubjectsDropdown from './CreateSubjectsDropdown'
import CreateSubjectModal from './CreateSubjectModal'
import SubjectImportModal from './SubjectImportModal'

const { Column } = Table

export default function SubjectList ({
  fetchSubjects,
  update,
  remove,
  subjects,
  openModal,
  removeUser,
  match: {
    params: { campaignId },
  },
  match,
}) {
  useEffect(() => {
    fetchSubjects(campaignId)
  }, [])

  return (
    <>
      <Row>
        <Col span={4} className="pls">
          <Icon type="user" />
          <span className="mlm">{`${subjects.length} Subjects`}</span>
        </Col>
        <Col span={6} offset={14} className="text-align-r">
          <ToolsDropdown />
          <CreateSubjectsDropdown />
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <Table className="mtm" rowKey="id" dataSource={subjects} pagination={false}>
            <Column title="Name" key="fullName" render={({ user }) => userPresenter.getFullName(user)} />
            <Column
              title="Email"
              key="email"
              render={({ user }) => (
                <a
                  role="button"
                  tabIndex="0"
                  onClick={() => openModal('ParticipantModal', { user, onClose: () => fetchSubjects(campaignId) })}
                >
                  {user.email}
                </a>
              )}
            />
            <Column title="Evaluations Received" dataIndex="evaluators" key="received_evaluations" />
            <Column title="Evaluations Completed" dataIndex="evaluations" key="completed_evaluations" />
            <Column title="Report Status" dataIndex="reportStatus" key="report_status" />
            <Column title="Status" dataIndex="status" key="status" />

            <Column
              key="action"
              render={({ id, user: { email }, user }) => (
                <Dropdown
                  overlay={() => ActionsMenu({
                    subjectId: id,
                    email,
                    user,
                    campaignId,
                    update,
                    remove,
                    removeUser,
                  })}
                  trigger={['click']}
                >
                  <div className={css.actions}>
                    <Icon type="ellipsis" />
                  </div>
                </Dropdown>
              )}
            />
          </Table>
        </Col>
      </Row>
      <CreateSubjectModal match={match} />
      <SubjectImportModal />
    </>
  )
}
