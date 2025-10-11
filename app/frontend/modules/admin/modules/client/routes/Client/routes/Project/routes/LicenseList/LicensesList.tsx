
import React from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { useParams } from 'react-router-dom'
import { Resource } from '~/modules/admin/components/Resource'
import { LicenseTR } from '~/modules/admin/modules/client/core/licenses'
import { RootState } from '~/modules/admin/core/rootReducers'
import { openModal } from '~/modules/admin/core/ui/modals'
import Modals from '~/modules/admin/components/Modals'
import { LicenseFormModal } from './LicenseFormModal'
import { ClientLicensesTable } from './LicenseTable'
import { fetchSingle as fetchProject } from '~/modules/admin/modules/client/core/projects'


const MODALS = {
  LicenseFormModal,
}

const connecter = connect(
  (state: RootState) => ({
    project: state.project,
  }),
  {
    fetchProject, openModal
  },
)

export type PropsFromRedux = ConnectedProps<typeof connecter>
type Props = PropsFromRedux

const LicenseList: React.FC<Props> = ({ openModal }) => {
  const { projectId } = useParams() as { projectId: string }
  const config = {
    trackUrl: true,
    responseType: LicenseTR,
    basePath: `projects/${projectId}`,
    apiConfig: {
      // include: ['report_family'],
      include_meta: ['permissions'],
      // fields: { report_families: ['id', 'name'] },
    },
  }

  return (
    <>
      <Resource config={config} name="licenses">
        <ClientLicensesTable />
        <Modals modals={MODALS} />
      </Resource>
    </>
  )
}

export default connecter(LicenseList)
