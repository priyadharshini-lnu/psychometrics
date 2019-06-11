import React, { useEffect } from 'react'
import _ from 'lodash'
import { Col, Icon, Row } from 'antd'
import routeUtils from 'utils/routeUtils'
import ToolsDropdown from '../ToolsDropdown'
import EvaluatorTable from './EvaluatorTable/EvaluatorTable'
import CreateEvaluatorsDropdown from './CreateEvaluatorsDropdown'
import CreateEvaluatorModal from './CreateEvaluatorModal'
import Pagination from '../../../common/Pagination/Pagination'

export default function EvaluatorList ({
  fetchEvaluators,
  evaluators,
  openModal,
  removeUser,
  total,
  match: {
    params: { campaignId },
  },
  match,
}) {
  const offset = routeUtils.getCurrentOffset()

  useEffect(() => {
    fetchEvaluators(campaignId, offset)
  }, [])

  const curriedFetchEvaluators = _.curry(fetchEvaluators)

  return (
    <>
      <Row>
        <Col span={4} className="pls">
          <Icon type="user" />
          <span className="mlm">{`${total} Evaluators`}</span>
        </Col>
        <Col span={6} offset={14} className="text-align-r">
          <ToolsDropdown />
          <CreateEvaluatorsDropdown />
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <EvaluatorTable
            campaignId={campaignId}
            openModal={openModal}
            evaluators={evaluators}
            onCloseParticipantModal={() => fetchEvaluators(campaignId, offset)}
            removeUser={removeUser}
          />
          <div className="pm">
            <Pagination total={total} fetch={curriedFetchEvaluators(campaignId)} />
          </div>
        </Col>
      </Row>
      <CreateEvaluatorModal match={match} />
    </>
  )
}
