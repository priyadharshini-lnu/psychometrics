import _ from 'lodash'
import { useEffect } from 'react'
import { Col, Row } from 'antd'
import { UserOutlined } from '@ant-design/icons'
import { useParams } from 'react-router-dom'
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
  page,
  searchTerm,
}) {
  const { campaignId } = useParams()
  useEffect(() => {
    fetchManagers(campaignId, page, searchTerm)
  }, [page])

  const curriedFetchManagers = _.curry(fetchManagers)

  return (
    <>
      <Row justify="space-between">
        <Col span={4} className="pll">
          <UserOutlined />
          <span className="mlm">{`${total} Managers`}</span>
        </Col>
        <Col span={20} className="text-align-r">
          <SearchInput
            onChange={curriedFetchManagers(campaignId)}
            path="/participants/managers"
            searchTerm={searchTerm}
          />
          <Manage />
          <ToolsDropdown permissions={permissions} />
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
