import _ from 'lodash'
import React, { useEffect } from 'react'
import { Col, Icon, Row } from 'antd'
import routeUtils from 'utils/routeUtils'
import ToolsDropdown from '../ToolsDropdown'
import EvaluatorTable from '../EvaluatorList/EvaluatorTable/EvaluatorTable'
import Pagination from '../../../common/Pagination/Pagination'

export default function ManagerList ({
  fetchManagers,
  managers,
  openModal,
  total,
  match: {
    params: { campaignId },
  },
}) {
  const offset = routeUtils.getCurrentOffset()

  useEffect(() => {
    fetchManagers(campaignId, offset)
  }, [])

  const curriedFetchManagers = _.curry(fetchManagers)

  return (
    <>
      <Row>
        <Col span={4} className="pls">
          <Icon type="user" />
          <span className="mlm">{`${total} Managers`}</span>
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
            onCloseParticipantModal={() => fetchManagers(campaignId, offset)}
          />
          <div className="pm">
            <Pagination total={total} fetch={curriedFetchManagers(campaignId)} />
          </div>
        </Col>
      </Row>
    </>
  )
}
