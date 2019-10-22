import React, { useEffect } from 'react'
import _ from 'lodash'
import { Col, Icon, Row } from 'antd'
import UserEditModal from 'admin/core/threeSixtyCampaign/components/common/UserEditModal'
import ToolsDropdown from '../ToolsDropdown'
import EvaluatorTable from './EvaluatorTable/EvaluatorTable'
import CreateEvaluatorsDropdown from './CreateEvaluatorsDropdown'
import CreateEvaluatorModal from './CreateEvaluatorModal'
import Pagination from '../../../common/Pagination'
import EvaluatorImportModal from './EvaluatorImportModal'
import SearchInput from '../SearchInput'

export default function EvaluatorList ({
  fetchEvaluators,
  evaluators,
  openModal,
  removeUser,
  editUser,
  total,
  page,
  match: {
    params: { campaignId },
  },
  match,
}) {
  useEffect(() => {
    fetchEvaluators(campaignId, page)
  }, [page])

  const curriedFetchEvaluators = _.curry(fetchEvaluators)

  return (
    <>
      <Row>
        <Col span={4} className="pls">
          <Icon type="user" />
          <span className="mlm">{`${total} Evaluators`}</span>
        </Col>
        <div className="float-r">
          <SearchInput onChange={curriedFetchEvaluators(campaignId)} path="/participants/evaluators" />
          <ToolsDropdown />
          <CreateEvaluatorsDropdown />
        </div>
      </Row>
      <Row>
        <Col span={24}>
          <EvaluatorTable
            campaignId={campaignId}
            openModal={openModal}
            evaluators={evaluators}
            editUser={editUser}
            onCloseParticipantModal={() => fetchEvaluators(campaignId, page)}
            removeUser={removeUser}
          />
          <div className="pm">
            <Pagination total={total} fetch={curriedFetchEvaluators(campaignId)} path="/participants/evaluators" />
          </div>
        </Col>
      </Row>
      <CreateEvaluatorModal match={match} />
      <EvaluatorImportModal match={match} />
      <UserEditModal match={match} />
    </>
  )
}
