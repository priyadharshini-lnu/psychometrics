import React, { useEffect } from 'react'
import {
  Table, Dropdown, Icon, Row, Col, Button,
} from 'antd'
import userPresenter from 'presenters/userPresenter'
import css from './SubjectList.scss'
import ActionsMenu from './ActionsMenu'
import ToolsDropdown from '../ToolsDropdown'
import CreateSubjectsMenu from './CreateSubjectsMenu'

const { Column } = Table

export default function SubjectList ({
  fetchSubjects,
  subjects,
  match: {
    params: { campaignId },
  },
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
          <Dropdown overlay={CreateSubjectsMenu} className="mrm" trigger={['click']}>
            <Button type="primary">
              <Icon type="plus" />
              <span>Add Subjects</span>
              <Icon type="down" />
            </Button>
          </Dropdown>
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <Table className="mtm" rowKey="id" dataSource={subjects} pagination={false}>
            <Column title="Name" key="fullName" render={({ user }) => userPresenter.getFullName(user)} />
            <Column title="Email" dataIndex="user.email" key="email" />
            <Column title="Evaluations Received" dataIndex="receivedEvaluations" key="received_evaluations" />
            <Column title="Evaluations Completed" dataIndex="completedEvaluations" key="completed_evaluations" />
            <Column title="Report Status" dataIndex="reportStatus" key="report_status" />
            <Column title="Status" dataIndex="status" key="status" />

            <Column
              key="action"
              render={() => (
                <Dropdown overlay={ActionsMenu} trigger={['click']}>
                  <div className={css.actions}>
                    <Icon type="ellipsis" />
                  </div>
                </Dropdown>
              )}
            />
          </Table>
        </Col>
      </Row>
    </>
  )
}
