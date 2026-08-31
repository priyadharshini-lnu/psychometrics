
import React from 'react'
import { connect, ConnectedProps } from 'react-redux'
import {
  Button,
} from 'antd'
import { useParams } from 'react-router-dom'
import { PlusOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { Resource } from '~/modules/admin/components/Resource'
import { TABLE_SETTINGS_KEYS } from '~/modules/admin/components/Resource/settingsKeys'
import { LicenseTR } from '~/modules/admin/modules/client/core/licenses'
import { RootState } from '~/modules/admin/core/rootReducers'
import Modals from '~/modules/admin/components/Modals'
import { openModal } from '~/modules/admin/core/ui/modals'
import { get as getCurrentUser, isSuperAdmin } from '~/core/currentUser'
import { LicenseFormModal } from './LicenseFormModal'
import { ClientLicensesTable } from './LicenseTable'

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

const LicenseList: React.FC<Props> = ({
  currentUser, openModal,
}) => {
  const { clientId } = useParams() as { clientId: string }
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
      <Resource
        title={I18n.t('admin.licenses')}
        config={config}
        name="licenses"
        settingsKey={TABLE_SETTINGS_KEYS.clientLicenses}
      >
        <Resource.Filter
          placeholder={I18n.t('common.actions.search')}
          name="report_family_name_cont"
        >
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

export default connecter(LicenseList)
