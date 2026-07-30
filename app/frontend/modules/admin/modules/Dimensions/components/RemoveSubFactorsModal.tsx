import React from 'react'
import { message } from 'antd'
import { useParams } from 'react-router-dom'
import AnswerableConfirmationModal from '~/components/AnswerableConfirmationModal'
import { SubFactors, SubFactorsTR } from '~/modules/admin/modules/client/core/subFactors'
import { SafeHTML } from '~/components/SafeHTML'
import { useResources } from '~/hooks/useResources'

const { I18n } = window

export interface Props {
  close(): void
  subFact: SubFactors
  slug: string
  occupationId?: number | null
  onSuccessfulRemoval?(): void
}

const getResourceName = (slug: string) => {
  if (slug === 'occupations') return 'occupations_factors'
  if (slug === 'innovation_styles') return 'innovation_styles_factors'
  return 'factors'
}

export const RemoveSubFactorsModal: React.FC<Props> = ({
  close, subFact, slug, occupationId, onSuccessfulRemoval,
}) => {
  const { dimensionId, tagId } = useParams() as { dimensionId: string, tagId: string }

  const resourceName = getResourceName(slug)

  const resource = useResources<SubFactors>(
    resourceName,
    {
      basePath: slug === 'occupations'
        ? `dimensions/${dimensionId}/occupations/${occupationId}/`
        : `dimensions/${dimensionId}/${slug}/${tagId}/`,
      responseType: SubFactorsTR,
    },
  )

  const { id, name, factorName } = subFact

  const displayName = factorName || name || ''

  const handleOnConfirm = () => resource.removeResource(id).then(() => {
    message.info(I18n.t('admin.factors_resource_removal_success', { name: displayName }))
    close()
    onSuccessfulRemoval && onSuccessfulRemoval()
  }).catch((error) => {
    message.error(error)
  })

  return (
    <AnswerableConfirmationModal
      requiredAnswer={displayName}
      warningMessage={<SafeHTML html={I18n.t('admin.factors_resource_confirmations_delete_body')} />}
      confirmationMessage={I18n.t('admin.scoring_factor_removal_confirmation')}
      onConfirm={handleOnConfirm}
      onCancel={close}
      getContainer={false}
    />
  )
}
