import React, { useEffect } from 'react'
import _ from 'lodash'
import { Col, Row } from 'antd'
import { UserOutlined } from '@ant-design/icons'
import UserEditModal from 'modules/admin/modules/threeSixtyCampaign/components/UserEditModal'
import ToolsDropdown from '../ToolsDropdown'
import EvaluatorTable from './EvaluatorTable/EvaluatorTable'
import CreateEvaluatorsDropdown from './CreateEvaluatorsDropdown'
import CreateEvaluatorModal from './CreateEvaluatorModal'
import Pagination from '../../../../components/Pagination'
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
  searchTerm,
  match: {
    params: { campaignId },
  },
  match,
}) {
  useEffect(() => {
    fetchEvaluators(campaignId, page, searchTerm)
  }, [page])

  const curriedFetchEvaluators = _.curry(fetchEvaluators)

  return (
    <>
      <Row justify="space-between">
        <Col span={4} className="pll">
          <UserOutlined />
          <span className="mlm">{`${total} Evaluators`}</span>
        </Col>
        <Col span={20} className="text-align-r">
          <SearchInput
            onChange={curriedFetchEvaluators(campaignId)}
            path="/participants/evaluators"
            searchTerm={searchTerm}
          />
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
            editUser={editUser}
            onCloseParticipantModal={() => fetchEvaluators(campaignId, page, searchTerm)}
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
