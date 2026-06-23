import { useEffect } from 'react'
import _ from 'lodash'
import { Col, Row } from 'antd'
import { useParams, useSearchParams } from 'react-router-dom'
import { UserOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import UserEditModal from '~/modules/admin/modules/threeSixtyCampaign/components/UserEditModal'
import ToolsDropdown from '../ToolsDropdown'
import { Manage } from '../Manage'
import EvaluatorTable from './EvaluatorTable/EvaluatorTable'
import CreateEvaluatorsDropdown from './CreateEvaluatorsDropdown'
import CreateEvaluatorModal from './CreateEvaluatorModal'
import Pagination from '../../../components/Pagination'
import EvaluatorImportModal from './EvaluatorImportModal'
import SearchInput from '../SearchInput'

export default function EvaluatorList ({
  fetchEvaluators,
  evaluators,
  openModal,
  removeUser,
  editUser,
  total,
  permissions,
  searchTerm,
  template,
}) {
  const { campaignId } = useParams()
  const [params] = useSearchParams()
  const page = params.get('page') || 1

  useEffect(() => {
    fetchEvaluators(campaignId, page, searchTerm)
  }, [page])

  const curriedFetchEvaluators = _.curry(fetchEvaluators)

  return (
    <>
      <Row justify="space-between">
        <Col span={4} className="pll">
          <UserOutlined />
          <span className="mlm">
            {`${total}
          ${I18n.t('admin.evaluators_title')}`}
          </span>
        </Col>
        <Col span={20} className="text-align-r">
          <SearchInput
            onChange={curriedFetchEvaluators(campaignId)}
            path="/participants/evaluators"
            searchTerm={searchTerm}
          />
          <Manage />
          {!template && <ToolsDropdown permissions={permissions} />}
          <CreateEvaluatorsDropdown template={template} permissions={permissions} />
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
      <CreateEvaluatorModal />
      <EvaluatorImportModal />
      <UserEditModal />
    </>
  )
}
