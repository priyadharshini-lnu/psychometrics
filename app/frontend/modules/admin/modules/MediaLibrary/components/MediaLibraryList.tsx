import React from 'react'
import { Resource } from '~/modules/admin/components/Resource'
import { useDocumentTitle } from '~/hooks/useDocumentTitle'
import MediaLibraryTable from './MediaLibraryTable'

const { I18n } = window

const MediaLibraryList: React.FC = () => {
  useDocumentTitle(I18n.t('admin.media_library_page_title'))
  const baseApiConfig = {
    trackUrl: true,
    apiConfig: {
      include: ['owner'],
      include_meta: ['ancestors'],
      include_resource_meta: ['permissions'],
    },
  }

  return (
    <Resource config={baseApiConfig} name="libraries">
      <MediaLibraryTable />
    </Resource>
  )
}

export default MediaLibraryList
