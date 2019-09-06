import _ from 'lodash'
import React, { useEffect } from 'react'
import { Col, Icon, Row } from 'antd'
import ToolsDropdown from '../ToolsDropdown'
import EvaluatorTable from '../EvaluatorList/EvaluatorTable/EvaluatorTable'
import Pagination from '../../../common/Pagination'
import SearchInput from '../SearchInput'

export default function ManagerList ({
  fetchManagers,
  managers,
  openModal,
  total,
  page,
  match: {
    params: { campaignId },
  },
}) {
  useEffect(() => {
    fetchManagers(campaignId, page)
  }, [page])

  const curriedFetchManagers = _.curry(fetchManagers)

  return (
    <>
      <Row>
        <Col span={4} className="pls">
          <Icon type="user" />
          <span className="mlm">{`${total} Managers`}</span>
        </Col>
        <Col span={6} offset={14} className="text-align-r">
          <SearchInput onChange={curriedFetchManagers(campaignId)} path="/participants/managers" />
          <ToolsDropdown />
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <EvaluatorTable
            campaignId={campaignId}
            openModal={openModal}
            evaluators={managers}
            onCloseParticipantModal={() => fetchManagers(campaignId, page)}
          />
          <div className="pm">
            <Pagination total={total} fetch={curriedFetchManagers(campaignId)} path="/participants/managers" />
          </div>
        </Col>
      </Row>
    </>
  )
}
