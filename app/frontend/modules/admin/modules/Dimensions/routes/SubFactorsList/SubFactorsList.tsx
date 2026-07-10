import React from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { useParams } from 'react-router-dom'
import Modals from '~/modules/admin/components/Modals'
import { openModal } from '~/modules/admin/core/ui/modals'
import { SubFactorsTR } from '~/modules/admin/modules/client/core/subFactors'
import { Resource } from '~/modules/admin/components/Resource'
import { SubFactorsFormModal } from './SubFactorsFormModal'
import { SubFactorsTable } from './SubFactorsTable'
import { SubFactorsFilter } from './SubFactorsFilter'
import { RemoveSubFactorsModal } from '~/modules/admin/modules/Dimensions/components/RemoveSubFactorsModal'
import { SubFactorsBreadcrumb } from './SubFactorsBreadcrumb'

const MODALS = {
  SubFactorsFormModal,
  RemoveSubFactorsModal,
}

const connecter = connect(
  () => ({
  }),
  {
    openModal,
  },
)

type PropsFromRedux = ConnectedProps<typeof connecter>

const SubFactorsList: React.FC<PropsFromRedux> = ({ openModal }) => {
  const { dimensionId, tagId, slug } = useParams() as { dimensionId: string, tagId: string, slug: string }

  const getResourceName = () => {
    if (slug === 'occupations') return 'occupations_factors'
    if (slug === 'innovation_styles') return 'innovation_styles_factors'
    return 'factors'
  }

  const resourceName = getResourceName()

  const config = {
    basePath: `dimensions/${dimensionId}/${slug}/${tagId}/`,
    trackUrl: true,
    responseType: SubFactorsTR,
  }

  return (
    <>
      <Resource config={config} name={resourceName}>
        <SubFactorsBreadcrumb />
        <SubFactorsFilter openModal={openModal} slug={slug} />
        <SubFactorsTable openModal={openModal} slug={slug} />
        <Modals modals={MODALS} />
      </Resource>
    </>
  )
}

export default connecter(SubFactorsList)
