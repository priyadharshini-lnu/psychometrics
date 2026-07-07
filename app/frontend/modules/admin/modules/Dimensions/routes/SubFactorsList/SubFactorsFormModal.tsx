import React, { useState, useCallback, useEffect } from 'react'
import {
  Select, Form, InputNumber,
} from 'antd'
import { useParams } from 'react-router-dom'
import _ from 'lodash'
import { SubFactors, SubFactorsTR } from '~/modules/admin/modules/client/core/subFactors'
import ResourceFormModal from '~/components/ResourceFormModal'
import { useResources } from '~/hooks/useResources'
import { Factor, FactorSearchTR } from '~/modules/admin/modules/campaigns/core/factors'
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
  const [state, setState] = useState({
    data: [] as Factor[], requests: {}, meta: {}, query: {},
  })

  const resourceName = getResourceName(slug)

  const resource = useResources<SubFactors>(
    resourceName,
    {
      basePath: `dimensions/${dimensionId}/${slug}/${tagId}/`,
      responseType: SubFactorsTR,
    },
  )

  const { data: factors, fetch: search } = useResources<Factor>('factors', {
    basePath: `dimensions/${dimensionId}/`,
    responseType: FactorSearchTR,
    stateManager: {
      state, setState,
    },
  })

  const searchFactor = useCallback(_.debounce((value) => {
    search({
      apiConfig: {
        filter: { search_query: value },
      },
    })
  }, 300), [])

  useEffect(() => {
    search()
  }, [])

  const factorOptions = factors.map(({ id, name }) => ({ value: id, label: name }))
  const selectedFactorId = (subFact as SubFactors & { factorId?: string })?.factorId
  const selectOptions = selectedFactorId
    && subFact?.factorName
    && !factorOptions.some(({ value }) => value === selectedFactorId)
    ? [{ value: selectedFactorId, label: subFact.factorName }, ...factorOptions]
    : factorOptions

  const createSubFactors = (data: SubFactors) => resource.createResource(data)

  return (
    <ResourceFormModal
      resourceName={resourceName}
      resource={subFact}
      readableResourceName={I18n.t('admin.factors_index_title')}
      showSuccessMessages
      close={close}
      onSuccessfulSubmission={() => {
        parentResource.fetch()
      }}
      storeManager={{ form }}
      scrollToFirstError
      modalProps={{ width: 720 }}
      request={{ createResource: createSubFactors, updateResource: resource.updateResource }}
    >
      {() => (
        <>
          <Form.Item
            name="factorId"
            label={I18n.t('admin.scoring_factor')}
          >
            <Select
              showSearch={{ onSearch: searchFactor, filterOption: false }}
              placeholder={I18n.t('admin.factors_form_search_factors')}
              options={selectOptions}
            />
          </Form.Item>
          <Form.Item
            name="predicate"
            label={I18n.t('admin.factors_form_predicate')}
          >
            <Select
              options={[
                { value: 'equal_to', label: '==' },
                { value: 'not_equal_to', label: '!=' },
                { value: 'less_then', label: '<' },
                { value: 'less_then_or_equal', label: '<=' },
                { value: 'greater_then', label: '>' },
                { value: 'greater_then_or_equal', label: '>=' },
              ]}
            />
          </Form.Item>
          <Form.Item
            name="value"
            label={I18n.t('admin.factors_form_value')}
          >
            <InputNumber />
          </Form.Item>
          <Form.Item
            name="position"
            label={I18n.t('admin.occupations_factors_list_position')}
          >
            <InputNumber />
          </Form.Item>
          <Form.Item
            name="weight"
            label={I18n.t('admin.occupations_factors_list_weight')}
          >
            <InputNumber />
          </Form.Item>
        </>
      )}
    </ResourceFormModal>
  )
}
