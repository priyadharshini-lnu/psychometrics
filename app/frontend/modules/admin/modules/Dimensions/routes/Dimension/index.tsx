import React, { useEffect, useMemo } from 'react'
import { Menu } from 'antd'
import { ItemType } from 'antd/es/menu/interface'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import RouteList from '~/components/RouteList'
import routeUtils from '~/utils/route'
import settings from '../../../../settings'
import { useResources } from '~/hooks/useResources'
import { DimensionTR, Dimension } from '~/modules/admin/modules/client/core/dimensions'
import FactorsList from './FactorsList'
import OccupationsList from './OccupationsList'
import InnovationStylesList from './InnovationStylesList'
import Breadcrumb from '~/modules/admin/modules/campaigns/components/Breadcrumb'

const { I18n } = window

const DimensionComponent: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { dimensionId } = useParams() as { dimensionId: string }
  const prefix = `${settings.urlPrefix}/dimensions/:dimensionId`

  const { fetchSingle, getResource } = useResources<Dimension>('dimensions', {
    responseType: DimensionTR,
    apiConfig: { include: ['owner'] },
  })

  useEffect(() => {
    if (dimensionId) fetchSingle({ id: dimensionId })
  }, [dimensionId])

  const dimensions = getResource(dimensionId)

  const menuItems: ItemType[] = useMemo(() => {
    const items: ItemType[] = [
      { key: '/factors', label: I18n.t('administration.navigation.factors') },
    ]
    if (dimensions?.occupationsEnabled) {
      items.push({ key: '/occupations', label: I18n.t('administration.navigation.occupations') })
    }
    if (dimensions?.innovationStylesEnabled) {
      items.push({ key: '/innovation_styles', label: I18n.t('administration.navigation.innovation_styles') })
    }
    return items
  }, [dimensionId, dimensions])

  const activePath = useMemo(() => {
    if (location.pathname.includes('/factors')) return '/factors'
    if (location.pathname.includes('/occupations')) return '/occupations'
    if (location.pathname.includes('/innovation_styles')) return '/innovation_styles'
    return '/factors'
  }, [location.pathname])

  const breadcrumbTitle = useMemo(() => (
    {
      '/factors': I18n.t('administration.navigation.factors'),
      '/occupations': I18n.t('administration.navigation.occupations'),
      '/innovation_styles': I18n.t('administration.navigation.innovation_styles'),
    }[activePath] || I18n.t('administration.navigation.factors')
  ), [activePath])

  if (!dimensions) return null

  return (
    <div>
      <Breadcrumb
        crumbs={[
          { link: () => '/admin', label: () => I18n.t('users.dashboard') },
          { link: () => '/admin/dimensions', label: () => I18n.t('administration.dimensions.index.title') },
          { label: () => dimensions.name },
          { label: () => breadcrumbTitle },
        ]}
      />
      <Menu
        items={menuItems}
        onSelect={({ key }) => routeUtils.moveTo(navigate, prefix, key)}
        selectedKeys={[activePath]}
        mode="horizontal"
      />
      <RouteList
        routes={[
          { redirect: true, from: '', to: 'factors' },
          { path: '/factors', component: <FactorsList /> },
          { path: '/occupations', component: <OccupationsList /> },
          { path: '/innovation_styles', component: <InnovationStylesList /> },
        ]}
        urlPrefix=""
      />
    </div>
  )
}

export default DimensionComponent
