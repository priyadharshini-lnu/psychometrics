
import React from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { useParams } from 'react-router-dom'
import { Resource } from '~/modules/admin/components/Resource'
import { LicenseTR } from '~/modules/admin/modules/client/core/licenses'
import { RootState } from '~/modules/admin/core/rootReducers'
import { ClientLicensesTable } from './LicenseTable'
import { fetchSingle as fetchProject } from '~/modules/admin/modules/client/core/projects'
// const MODALS = {
//   LicenseFormModal,
// }

const connecter = connect(
  (state: RootState) => ({
    project: state.project,
  }),
  {
    fetchProject,
  },
)

export type PropsFromRedux = ConnectedProps<typeof connecter>
type Props = PropsFromRedux

const LicenseList: React.FC<Props> = () => {
  const { projectId } = useParams() as { projectId: string }
  const config = {
    trackUrl: true,
    responseType: LicenseTR,
    basePath: `projects/${projectId}`,
    apiConfig: {
      include: ['report_family'],
      include_meta: ['permissions'],
      fields: { report_families: ['id', 'name'] },
    },
  }

  return (
    <>
      <Resource config={config} name="licenses">
        {/* <Resource.Filter placeholder={I18n.t('common.actions.search')} name="report_family_name_cont">
          {isSuperAdmin(currentUser)
              && (
                <Button
                  type="primary"
                  disabled={false}
                  onClick={() => {
                    openModal('LicenseFormModal')
                  }}
                >
                  <PlusOutlined />
                  {I18n.t('frontend.clients.actions.create.create_license')}
                </Button>
              )}
        </Resource.Filter> */}
        <ClientLicensesTable />
      </Resource>
    </>
  )
}

export default connecter(LicenseList)
