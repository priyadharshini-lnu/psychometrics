import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import Breadcrumb from '~/modules/admin/modules/campaigns/components/Breadcrumb'
import { NormTR, Norm } from '~/modules/admin/modules/client/core/norms'
import { useResources } from '~/hooks/useResources'

const { I18n } = window

export const NormsEditorBreadcrumb: React.FC = () => {
  const { normId } = useParams() as { normId: string}

  const { fetchSingle: fetchNorm, getResource: getNorm, isLoading } = useResources<Norm>('norms', {
    trackUrl: true,
    responseType: NormTR,
    apiConfig: {
      include: ['dimension', 'updated_by', 'owner'],
      include_meta: ['permissions'],
      include_resource_meta: ['permissions'],
    },
  })

  useEffect(() => {
    fetchNorm({ id: normId })
  }, [normId])

  const norm = getNorm(normId)

  return (
    !isLoading('fetch') ? (
      <Breadcrumb
        crumbs={[
          {
            link: () => '/admin',
            label: () => I18n.t('admin.dashboard'),
          },
          {
            link: () => '/admin/norms',
            label: () => I18n.t('admin.norms'),
          },
          {
            label: () => norm?.name,
          },
          {
            label: () => I18n.t('admin.breadcrumbs_norms_editor'),
          },
        ]}
      />
    ) : null
  )
}
