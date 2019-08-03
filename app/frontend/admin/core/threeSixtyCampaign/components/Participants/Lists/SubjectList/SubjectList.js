import React, { useEffect } from 'react'
import _ from 'lodash'
import {
  Table, Dropdown, Icon, Row, Col,
} from 'antd'
import userPresenter from 'presenters/userPresenter'
import routeUtils from 'utils/routeUtils'
import css from './SubjectList.scss'
import ActionsMenu from './ActionMenu'
import ToolsDropdown from '../ToolsDropdown'
import CreateSubjectsDropdown from './CreateSubjectsDropdown'
import CreateSubjectModal from './CreateSubjectModal'
import SubjectImportModal from './SubjectImportModal'
import Pagination from '../../../common/Pagination'

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
  match: {
    params: { campaignId },
  },
  match,
}) {
  const offset = routeUtils.getCurrentOffset()

  useEffect(() => {
    fetchSubjects(campaignId, page)
  }, [page])
  const curriedFetchSubjects = _.curry(fetchSubjects)
  return (
    <>
      <Row>
        <Col span={4} className="pls">
          <Icon type="user" />
          <span className="mlm">{`${total} Subjects`}</span>
        </Col>
        <Col>
          <div className="float-r">
            <ToolsDropdown />
            <CreateSubjectsDropdown />
          </div>
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
                  onClick={() => openModal('ParticipantModal', {
                    user,
                    onClose: () => fetchSubjects(campaignId, offset),
                  })
                  }
                >
                  {user.email}
                </a>
              )}
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
                  })
                  }
                  trigger={['click']}
                >
                  <div className={css.actions}>
                    <Icon type="ellipsis" />
                  </div>
                </Dropdown>
              )}
            />
          </Table>
          <div className="pm">
            <Pagination total={total} fetch={curriedFetchSubjects(campaignId)} path="/participants/subjects" />
          </div>
        </Col>
      </Row>
      <CreateSubjectModal match={match} />
      <SubjectImportModal match={match} />
    </>
  )
}
