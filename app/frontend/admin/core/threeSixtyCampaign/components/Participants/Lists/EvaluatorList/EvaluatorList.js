import React, { useEffect } from 'react'
import { Col, Icon, Row } from 'antd'
import ToolsDropdown from '../ToolsDropdown'
import EvaluatorTable from './EvaluatorTable/EvaluatorTable'
import CreateEvaluatorsDropdown from './CreateEvaluatorsDropdown'
import CreateEvaluatorModal from './CreateEvaluatorModal'

export default function EvaluatorList ({
  fetchEvaluators,
  evaluators,

  match: {
    params: { campaignId },
  },
  match,
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
          <CreateEvaluatorsDropdown />
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <EvaluatorTable evaluators={evaluators} />
        </Col>
      </Row>
      <CreateEvaluatorModal match={match} />
    </>
  )
}
