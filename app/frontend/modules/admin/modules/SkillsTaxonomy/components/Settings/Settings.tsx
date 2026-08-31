import React from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { useParams } from 'react-router-dom'
import { getFeatures } from '~/core/config'
import { RootState } from '~/core/reducers'
import { Tabs } from '../Tabs'
import { TaxonomyImport } from './TaxonomyImport'
import { DocumentTitle } from '~/components/DocumentTitle'

const { I18n } = window

const connecter = connect(
  (state: RootState) => ({
    features: getFeatures(state),
  }),
)

type PropsFromRedux = ConnectedProps<typeof connecter>

const Settings: React.FC<PropsFromRedux> = ({ features }) => {
  const { projectId } = useParams()

  return (
    <>
      {!projectId && <DocumentTitle text={I18n.t('admin.tools')} />}
      { !projectId && <Tabs featureFlags={features} />}
      <TaxonomyImport />
    </>
  )
}

export default connecter(Settings)
