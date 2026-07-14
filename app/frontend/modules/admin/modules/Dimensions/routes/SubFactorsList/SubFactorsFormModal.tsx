import React, { useState } from 'react'
import {
  Form,
} from 'antd'
import { useParams } from 'react-router-dom'
import { SubFactors, SubFactorsTR } from '~/modules/admin/modules/client/core/subFactors'
import { ResourceFormModalComponent } from '~/components/ResourceFormModal'
import { useResources } from '~/hooks/useResources'
import { SubFactorsForm } from '~/modules/admin/modules/Dimensions/components/SubFactorsForm'
import { useResourceContext } from '~/modules/admin/components/Resource'

type Props = {
  close(): void
  subFact?: SubFactors
  slug: string
}

const { I18n } = window

const getResourceName = (slug: string) => {
  if (slug === 'occupations') return 'occupations_factors'
  if (slug === 'innovation_styles') return 'innovation_styles_factors'
  return 'factors'
}

export const SubFactorsFormModal: React.FC<Props> = ({ close, subFact, slug }) => {
  const { dimensionId, tagId } = useParams() as { dimensionId: string, tagId: string }
  const { resource: parentResource } = useResourceContext<SubFactors>()
  const [form] = Form.useForm()

  const [resourceStatus, setResourceStatus] = useState<string | null>(null)

  const handleSuccessfulSubmission = () => {
    parentResource.fetch()
    close()
  }

  const resourceName = getResourceName(slug)

  const resource = useResources<SubFactors>(
    resourceName,
    {
      basePath: `dimensions/${dimensionId}/${slug}/${tagId}/`,
      responseType: SubFactorsTR,
    },
  )

  const createSubFactors = (data: SubFactors) => resource.createResource(data)

  return (
    <ResourceFormModalComponent
      resourceName={resourceName}
      resource={subFact}
      readableResourceName={I18n.t('admin.factors_index_title')}
      showSuccessMessages
      close={close}
      storeManager={{ form }}
      scrollToFirstError
      modalProps={{ width: 720 }}
      request={{ createResource: createSubFactors, updateResource: resource.updateResource }}
      resourceStatus={resourceStatus}
      form={form}
    >
      <SubFactorsForm
        subFact={subFact}
        slug={slug}
        form={form}
        onStatusChange={setResourceStatus}
        onSuccessfulSubmission={handleSuccessfulSubmission}
      />
    </ResourceFormModalComponent>
  )
}
