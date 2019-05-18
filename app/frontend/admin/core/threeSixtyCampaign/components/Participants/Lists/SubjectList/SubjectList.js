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

const { Column } = Table

export default function SubjectList ({
  fetchSubjects,
  update,
  remove,
  subjects,
  openModal,
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
          <Table
            className="mtm"
            rowKey="id"
            dataSource={subjects}
            pagination={false}
            onRow={record => ({
              onClick: (e) => {
                if (['TR', 'TD'].includes(e.target.tagName)) {
                  openModal('ParticipantModal', { user: record.user, onClose: () => fetchSubjects(campaignId) })
                }
              },
            })}
          >
            <Column title="Name" key="fullName" render={({ user }) => userPresenter.getFullName(user)} />
            <Column title="Email" dataIndex="user.email" key="email" />
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
    </>
  )
}
