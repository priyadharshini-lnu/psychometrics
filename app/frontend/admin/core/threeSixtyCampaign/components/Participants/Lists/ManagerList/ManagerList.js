import React, { useEffect } from 'react'
import { Col, Icon, Row } from 'antd'
import ToolsDropdown from '../ToolsDropdown'
import EvaluatorTable from '../EvaluatorList/EvaluatorTable/EvaluatorTable'

export default function ManagerList ({
  fetchManagers,
  managers,
  openModal,
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
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <EvaluatorTable
            campaignId={campaignId}
            openModal={openModal}
            evaluators={managers}
            onCloseParticipantModal={() => fetchManagers(campaignId)}
          />
        </Col>
      </Row>
    </>
  )
}
