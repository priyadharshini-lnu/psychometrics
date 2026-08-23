import { useEffect } from 'react'
import _ from 'lodash'
import { Flex } from 'antd'
import { useParams, useSearchParams } from 'react-router-dom'
import UserEditModal from '~/modules/admin/modules/threeSixtyCampaign/components/UserEditModal'
import { TableLayout } from '~/modules/admin/components/TableLayout'
import ToolsDropdown from '../ToolsDropdown'
import { Manage } from '../Manage'
import EvaluatorTable from './EvaluatorTable/EvaluatorTable'
import CreateEvaluatorsDropdown from './CreateEvaluatorsDropdown'
import CreateEvaluatorModal from './CreateEvaluatorModal'
import settings from '../../../settings'
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
  const [params, setParams] = useSearchParams()
  const page = Number(params.get('page')) || 1

  useEffect(() => {
    fetchEvaluators(campaignId, page, searchTerm)
  }, [page])

  const curriedFetchEvaluators = _.curry(fetchEvaluators)

  const changePage = (nextPage) => {
    params.set('page', nextPage)
    setParams(params)
  }

  return (
    <>
      <TableLayout
        title={I18n.t('admin.evaluators_title')}
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
              onChange={curriedFetchEvaluators(campaignId)}
              path="/participants/evaluators"
              searchTerm={searchTerm}
              style={{ marginRight: 0 }}
            />
            <Manage />
            {!template && <ToolsDropdown permissions={permissions} />}
            <CreateEvaluatorsDropdown template={template} permissions={permissions} />
          </Flex>
        )}
        table={(
          <EvaluatorTable
            campaignId={campaignId}
            openModal={openModal}
            evaluators={evaluators}
            editUser={editUser}
            onCloseParticipantModal={() => fetchEvaluators(campaignId, page, searchTerm)}
            removeUser={removeUser}
          />
        )}
      />
      <CreateEvaluatorModal />
      <EvaluatorImportModal />
      <UserEditModal />
    </>
  )
}
