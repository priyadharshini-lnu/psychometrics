import React, { useEffect, useMemo, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import Breadcrumb from '~/modules/admin/modules/campaigns/components/Breadcrumb'
import { useResources } from '~/hooks/useResources'
import { DimensionTR, Dimension } from '~/modules/admin/modules/client/core/dimensions'
import { OccupationTR, Occupation } from '~/modules/admin/modules/campaigns/core/occupations'
import { InnovationStylesTR, InnovationStyles } from '~/modules/admin/modules/campaigns/core/innovationStyles'

const { I18n } = window

type ResourceType = 'occupations' | 'innovation_styles'

interface BreadcrumbItem {
  link?: () => string;
  label: () => string;
}

const RESOURCE_CONFIG: Record<ResourceType, {
  titleKey: string
  factorsLabelKey: string
}> = {
  occupations: {
    titleKey: 'admin.occupations_index_title',
    factorsLabelKey: 'admin.navigation_factors',
  },
  innovation_styles: {
    titleKey: 'admin.innovation_styles_index_title',
    factorsLabelKey: 'admin.navigation_factors',
  },
}

export const SubFactorsBreadcrumb: React.FC = () => {
  const { dimensionId, tagId, slug } = useParams() as { dimensionId: string, tagId: string, slug: string }

  const { fetchSingle: fetchDimension, getResource: getDimension } = useResources<Dimension>('dimensions', {
    responseType: DimensionTR,
    apiConfig: { include: ['owner'] },
  })

  const { fetchSingle: fetchOccupation, getResource: getOccupation } = useResources<Occupation>('occupations', {
    basePath: `dimensions/${dimensionId}/`,
    responseType: OccupationTR,
  })

  const {
    fetchSingle: fetchInnovationStyle, getResource: getInnovationStyle,
  } = useResources<InnovationStyles>('innovation_styles', {
    basePath: `dimensions/${dimensionId}/`,
    responseType: InnovationStylesTR,
  })

  const dimension = getDimension(dimensionId)
  const occupation = getOccupation(tagId)
  const innovationStyle = getInnovationStyle(tagId)

  const fetchDimensionMemoized = useCallback(() => {
    if (dimensionId && !dimension) fetchDimension({ id: dimensionId })
  }, [dimensionId])

  const fetchResource = useCallback(() => {
    if (!tagId || !dimensionId) return

    switch (slug) {
      case 'occupations':
        if (!occupation) fetchOccupation({ id: tagId })
        break
      case 'innovation_styles':
        if (!innovationStyle) fetchInnovationStyle({ id: tagId })
        break
      default:
        break
    }
  }, [slug, tagId, dimensionId])

  useEffect(fetchDimensionMemoized, [fetchDimensionMemoized])
  useEffect(fetchResource, [fetchResource])

  const crumbs = useMemo(() => {
    const baseCrumbs: BreadcrumbItem[] = [
      { link: () => '/admin', label: () => I18n.t('admin.dashboard') },
      { link: () => '/admin/dimensions', label: () => I18n.t('admin.dimensions_index_title') },
    ]

    if (dimension) {
      baseCrumbs.push({ label: () => dimension.name })
    }

    if (slug in RESOURCE_CONFIG) {
      const config = RESOURCE_CONFIG[slug]
      const resource = slug === 'occupations' ? occupation : innovationStyle

      baseCrumbs.push(
        {
          link: () => `/admin/dimensions/${dimensionId}/${slug}`,
          label: () => I18n.t(config.titleKey),
        },
        { label: () => resource?.name || '' },
        { label: () => I18n.t(config.factorsLabelKey) },
      )
    }

    return baseCrumbs
  }, [dimension, occupation, innovationStyle, dimensionId, slug])

  return <Breadcrumb crumbs={crumbs} />
}
