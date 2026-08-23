import _ from 'lodash'
import { useEffect } from 'react'
import { Flex } from 'antd'
import { useParams, useSearchParams } from 'react-router-dom'
import UserEditModal from '~/modules/admin/modules/threeSixtyCampaign/components/UserEditModal'
import { TableLayout } from '~/modules/admin/components/TableLayout'
import ToolsDropdown from '../ToolsDropdown'
import { Manage } from '../Manage'
import EvaluatorTable from '../EvaluatorList/EvaluatorTable/EvaluatorTable'
import settings from '../../../settings'
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
  const [params, setParams] = useSearchParams()
  const page = Number(params.get('page')) || 1

  useEffect(() => {
    fetchManagers(campaignId, page, searchTerm)
  }, [page])

  const curriedFetchManagers = _.curry(fetchManagers)

  const changePage = (nextPage) => {
    params.set('page', nextPage)
    setParams(params)
  }

  return (
    <>
      <TableLayout
        title={I18n.t('admin.managers_title')}
        recordCount={total}
        pagination={{
          page,
          pageSize: settings.pageLimit,
          total,
          onChange: changePage,
        }}
        filters={(
          <Flex gap={8}>
            <SearchInput
              onChange={curriedFetchManagers(campaignId)}
              path="/participants/managers"
              searchTerm={searchTerm}
              style={{ marginRight: 0 }}
            />
            <Manage />
            {!template && <ToolsDropdown permissions={permissions} />}
          </Flex>
        )}
        table={(
          <EvaluatorTable
            campaignId={campaignId}
            openModal={openModal}
            evaluators={managers}
            editUser={editUser}
            onCloseParticipantModal={() => fetchManagers(campaignId, page, searchTerm)}
            removeUser={removeUser}
          />
        )}
      />
      <UserEditModal />
    </>
  )
}
