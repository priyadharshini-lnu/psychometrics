import React, { useEffect } from 'react'
import _ from 'lodash'
import {
  Table, Dropdown, Icon, Row, Col,
} from 'antd'
import userPresenter from 'presenters/userPresenter'
import UserEditModal from 'admin/core/threeSixtyCampaign/components/common/UserEditModal'
import styles from './SubjectList.scss'
import ActionsMenu from './ActionMenu'
import ToolsDropdown from '../ToolsDropdown'
import CreateSubjectsDropdown from './CreateSubjectsDropdown'
import CreateSubjectModal from './CreateSubjectModal'
import SubjectImportModal from './SubjectImportModal'
import Pagination from '../../../common/Pagination'
import SearchInput from '../SearchInput'

const { Column } = Table

export default function SubjectList ({
  fetchSubjects,
  update,
  remove,
  subjects,
  openModal,
  removeUser,
  downloadReport,
  total,
  page,
  editUser,
  match: {
    params: { campaignId },
  },
  match,
}) {
  useEffect(() => {
    fetchSubjects(campaignId, page)
  }, [page])
  const curriedFetchSubjects = _.curry(fetchSubjects)

  const openParticipantModal = (user) => {
    openModal('ParticipantModal', {
      user,
      onClose: () => fetchSubjects(campaignId, page),
    })
  }

  const onUserUpdate = () => fetchSubjects(campaignId, page)

  return (
    <>
      <Row>
        <Col span={4} className="pls">
          <Icon type="user" />
          <span className="mlm">{`${total} Subjects`}</span>
        </Col>
        <Col>
          <div className="float-r">
            <SearchInput onChange={curriedFetchSubjects(campaignId)} path="/participants/subjects" />
            <ToolsDropdown />
            <CreateSubjectsDropdown />
          </div>
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <Table className="mtm" rowKey="id" dataSource={subjects} pagination={false}>
            <Column
              title="Name"
              key="fullName"
              render={({ user }) => (
                <a
                  role="button"
                  tabIndex="0"
                  onClick={() => openParticipantModal(user)}
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
            <Column title="Evaluations Received" dataIndex="evaluators" key="received_evaluations" />
            <Column title="Evaluations Completed" dataIndex="evaluations" key="completed_evaluations" />

            <Column
              title="Report Status"
              key="report_status"
              render={({ reportStatus }) => I18n.t(`reports.statuses.${reportStatus}`)}
            />

            <Column title="Status" key="status" render={({ status }) => I18n.t(`subjects.statuses.${status}`)} />

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
                    downloadReport,
                    openModal,
                    editUser,
                    onUserUpdate,
                  })
                  }
                  trigger={['click']}
                >
                  <div className={styles.actions}>
                    <Icon type="ellipsis" />
                  </div>
                </Dropdown>
              )}
            />
          </Table>
          <div className="pm">
            <Pagination total={total} path="/participants/subjects" />
          </div>
        </Col>
      </Row>
      <CreateSubjectModal match={match} />
      <SubjectImportModal match={match} />
      <UserEditModal match={match} />
    </>
  )
}
