import React, { useEffect } from 'react'
import {
  Button, Col, Dropdown, Icon, Row, Table,
} from 'antd'
import userPresenter from 'presenters/userPresenter'
import ToolsDropdown from '../ToolsDropdown'
import CreateEvaluatorsMenu from '../EvaluatorList/CreateEvaluatorsMenu'
import ActionsMenu from '../SubjectList/ActionsMenu'
import css from '../SubjectList/SubjectList.scss'

const { Column } = Table

export default function ManagerList ({
  fetchManagers,
  managers,
  match: {
    params: { campaignId },
  },
}) {
  useEffect(() => {
    fetchManagers(campaignId)
  }, [])

  return (
    <>
      <Row>
        <Col span={4} className="pls">
          <Icon type="user" />
          <span className="mlm">{`${managers.length} Managers`}</span>
        </Col>
        <Col span={6} offset={14} className="text-align-r">
          <ToolsDropdown />
          <Dropdown overlay={CreateEvaluatorsMenu} className="mrm" trigger={['click']}>
            <Button type="primary">
              <Icon type="plus" />
              <span>Add Evaluators</span>
              <Icon type="down" />
            </Button>
          </Dropdown>
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <Table className="mtm" rowKey="id" dataSource={managers} pagination={false}>
            <Column title="Name" key="fullName" render={({ evaluator }) => userPresenter.getFullName(evaluator)} />
            <Column title="Email" dataIndex="evaluator.email" key="email" />
            <Column title="Evaluations Received" dataIndex="receivedEvaluations" key="received_evaluations" />
            <Column title="Evaluations Completed" dataIndex="completedEvaluations" key="completed_evaluations" />
            <Column title="Report Status" dataIndex="reportStatus" key="report_status" />
            <Column title="Status" dataIndex="status" key="status" />
            <Column
              title="Is Subject"
              render={({ isSubject }) => isSubject && <Icon className="text-success" type="check" />}
              key="isSubject"
            />

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
