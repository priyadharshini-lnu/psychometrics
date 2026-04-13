import React from 'react'
import { Resource } from '~/modules/admin/components/Resource'
import MediaLibraryTable from './MediaLibraryTable'

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
    <Resource config={baseApiConfig} name="libraries">
      <MediaLibraryTable />
    </Resource>
  )
}

export default MediaLibraryList
