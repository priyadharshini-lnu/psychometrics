
import React from 'react'
import { connect, ConnectedProps } from 'react-redux'
import {
  Button,
} from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useParams } from 'react-router-dom'
import { Resource } from '~/modules/admin/components/Resource'
import { LicenseTR } from '~/modules/admin/modules/client/core/licenses'
import { RootState } from '~/modules/admin/core/rootReducers'
import Modals from '~/modules/admin/components/Modals'
import { openModal } from '~/modules/admin/core/ui/modals'
import { get as getCurrentUser, isSuperAdmin } from '~/core/currentUser'
import { LicenseFormModal } from './LicenseFormModal'
import { ClientLicensesTable } from './LicenseTable'
import Breadcrumb from '~/modules/admin/modules/campaigns/components/Breadcrumb'

const { I18n } = window

const MODALS = {
  LicenseFormModal,
}

const connecter = connect(
  (state: RootState) => ({
    currentUser: getCurrentUser(state),
  }),
  {
    openModal,
  },
)

export type PropsFromRedux = ConnectedProps<typeof connecter>
type Props = PropsFromRedux

const LicenseListComponent: React.FC<Props> = ({
  currentUser, openModal,
}) => {
  const { clientId } = useParams<{ clientId: string }>()
  const config = {
    trackUrl: true,
    responseType: LicenseTR,
    basePath: `clients/${clientId}`,
    apiConfig: {
      include: ['report_family'],
      include_meta: ['permissions'],
      fields: { report_families: ['id', 'name'] },
    },
  }

  return (
    <>
      <Breadcrumb
        request={{
          fields: ['client'],
          data: {
            clientId: parseInt(clientId, 10),
          },
        }}
        crumbs={[
          {
            link: () => '/administration',
            label: () => I18n.t('administration.clients.tenancies'),
          },
          {
            link: () => `/administration/clients/${clientId}/projects`,
            label: state => state.client.name,
          },
          {
            label: () => I18n.t('administration.breadcrumbs.licenses'),
          },
        ]}
      />
      <Resource config={config} name="licenses">
        <Resource.Filter placeholder="Search" name="report_family_name_cont">
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
        </Resource.Filter>
        <ClientLicensesTable />
        <Modals modals={MODALS} />
      </Resource>
    </>
  )
}

export const LicenseList = connecter(LicenseListComponent)
