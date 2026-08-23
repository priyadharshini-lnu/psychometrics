import React from 'react'
import { Resource } from '~/modules/admin/components/Resource'
import { TABLE_SETTINGS_KEYS } from '~/modules/admin/components/Resource/settingsKeys'
import { DocumentTitle } from '~/components/DocumentTitle'
import MediaLibraryTable from './MediaLibraryTable'

const { I18n } = window

const MediaLibraryList: React.FC = () => {
  const baseApiConfig = {
    trackUrl: true,
    apiConfig: {
      include: ['owner'],
      include_meta: ['ancestors'],
      include_resource_meta: ['permissions'],
    },
  }

  return (
    <>
      <DocumentTitle text={I18n.t('admin.media_library')} />
      <Resource
        title={I18n.t('admin.media_library')}
        config={baseApiConfig}
        name="libraries"
        settingsKey={TABLE_SETTINGS_KEYS.adminMediaLibrary}
      >
        <MediaLibraryTable />
      </Resource>
    </>
  )
}

export default MediaLibraryList
