import _ from 'lodash'
import { useEffect } from 'react'
import { Col, Row } from 'antd'
import { useParams, useSearchParams } from 'react-router-dom'
import { UserOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import UserEditModal from '~/modules/admin/modules/threeSixtyCampaign/components/UserEditModal'
import ToolsDropdown from '../ToolsDropdown'
import { Manage } from '../Manage'
import EvaluatorTable from '../EvaluatorList/EvaluatorTable/EvaluatorTable'
import Pagination from '../../../components/Pagination'
import SearchInput from '../SearchInput'

export default function ManagerList ({
  fetchManagers,
  managers,
  openModal,
  editUser,
  removeUser,
  total,
  permissions,
  searchTerm,
  template,
}) {
  const { campaignId } = useParams()
  const [params] = useSearchParams()
  const page = params.get('page') || 1

  useEffect(() => {
    fetchManagers(campaignId, page, searchTerm)
  }, [page])

  const curriedFetchManagers = _.curry(fetchManagers)

  return (
    <>
      <Row justify="space-between">
        <Col span={4} className="pll">
          <UserOutlined />
          <span className="mlm">
            {`${total}
          ${I18n.t('admin.managers_title')}`}
          </span>
        </Col>
        <Col span={20} className="text-align-r">
          <SearchInput
            onChange={curriedFetchManagers(campaignId)}
            path="/participants/managers"
            searchTerm={searchTerm}
          />
          <Manage />
          {!template && <ToolsDropdown permissions={permissions} />}
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <EvaluatorTable
            campaignId={campaignId}
            openModal={openModal}
            evaluators={managers}
            editUser={editUser}
            onCloseParticipantModal={() => fetchManagers(campaignId, page, searchTerm)}
            removeUser={removeUser}
          />
          <div className="pm">
            <Pagination total={total} fetch={curriedFetchManagers(campaignId)} path="/participants/managers" />
          </div>
        </Col>
      </Row>
      <UserEditModal />
    </>
  )
}
