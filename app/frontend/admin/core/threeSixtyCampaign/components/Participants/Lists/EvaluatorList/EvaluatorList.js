import React, { useEffect } from 'react'
import {
  Button, Col, Dropdown, Icon, Row,
} from 'antd'
import ToolsDropdown from '../ToolsDropdown'
import CreateEvaluatorsMenu from './CreateEvaluatorsMenu'
import EvaluatorTable from './EvaluatorTable/EvaluatorTable'

export default function EvaluatorList ({
  fetchEvaluators,
  evaluators,

  match: {
    params: { campaignId },
  },
}) {
  useEffect(() => {
    fetchEvaluators(campaignId)
  }, [])

  return (
    <>
      <Row>
        <Col span={4} className="pls">
          <Icon type="user" />
          <span className="mlm">{`${evaluators.length} Evaluators`}</span>
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
          <EvaluatorTable evaluators={evaluators} />
        </Col>
      </Row>
    </>
  )
}
