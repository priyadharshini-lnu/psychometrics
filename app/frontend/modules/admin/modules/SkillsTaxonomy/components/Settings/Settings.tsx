import React from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { useParams } from 'react-router-dom'
import { getFeatures } from '~/core/config'
import { RootState } from '~/core/reducers'
import { Tabs } from '../Tabs'
import Breadcrumb from '~/modules/admin/modules/campaigns/components/Breadcrumb'
import { TaxonomyImport } from './TaxonomyImport'

const connecter = connect(
  (state: RootState) => ({
    features: getFeatures(state),
  }),
)

type PropsFromRedux = ConnectedProps<typeof connecter>

const { I18n } = window

const Settings: React.FC<PropsFromRedux> = ({ features }) => {
  const { projectId } = useParams()

  return (
    <>
      {!projectId && (
        <Breadcrumb
          crumbs={[
            {
              link: () => '/admin',
              label: () => I18n.t('admin.dashboard'),
            },
            {
              label: () => I18n.t('admin.navigation_skills_taxonomy'),
            },
          ]}
        />
      )}
      { !projectId && <Tabs featureFlags={features} />}
      <TaxonomyImport />
    </>
  )
}

export default connecter(Settings)
