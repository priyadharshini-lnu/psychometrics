import React from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { useParams } from 'react-router-dom'
import { getFeatures } from '~/core/config'
import { RootState } from '~/core/reducers'
import { Tabs } from '../Tabs'
import Breadcrumb from '~/modules/admin/modules/campaigns/components/Breadcrumb'
import { SettingsHeader } from './SettingsHeader'
import { openModal } from '~/modules/admin/core/ui/modals'
import Modals from '~/modules/admin/components/Modals'
import { TaxonomyImportModal } from './TaxonomyImportModal'

const MODALS = {
  TaxonomyImportModal,
}

const connecter = connect(
  (state: RootState) => ({
    features: getFeatures(state),
  }),
  {
    openModal,
  },
)

type PropsFromRedux = ConnectedProps<typeof connecter>

const { I18n } = window

const Settings: React.FC<PropsFromRedux> = ({ features, openModal }) => {
  const { projectId } = useParams()

  return (
    <>
      {!projectId && (
        <Breadcrumb
          crumbs={[
            {
              link: () => '/admin',
              label: () => I18n.t('users.dashboard'),
            },
            {
              label: () => I18n.t('administration.navigation.skills_taxonomy'),
            },
          ]}
        />
      )}
      { !projectId && <Tabs featureFlags={features} />}
      <SettingsHeader openModal={openModal} />
      <Modals modals={MODALS} />
    </>
  )
}

export default connecter(Settings)
