import React, { useState, useCallback } from 'react'
import {
  Select, Form, InputNumber, Button,
  Spin, GetProps,
} from 'antd'
import { FormInstance } from 'antd/es/form'
import { useParams } from 'react-router-dom'
import _ from 'lodash'
import { SubFactors, SubFactorsTR } from '~/modules/admin/modules/client/core/subFactors'
import ResourceForm from '~/components/ResourceForm'
import { Status } from '~/components/ResourceForm/constants'
import { useResources } from '~/hooks/useResources'
import { Factor, FactorSearchTR } from '~/modules/admin/modules/campaigns/core/factors'

type SelectOptions = GetProps<typeof Select>['options']

type Props = {
  subFact?: SubFactors
  slug: string
  showSubmitButton?: boolean
  onStatusChange(status: string | null): void
  onSuccessfulSubmission(data: SubFactors): void
  occupationId?: number | null
  occupationConditionSetId?: string | null
  form?: FormInstance
}

const { I18n } = window

const getResourceName = (slug: string) => {
  if (slug === 'occupations') return 'occupations_factors'
  if (slug === 'innovation_styles') return 'innovation_styles_factors'
  return 'factors'
}

export const SubFactorsForm: React.FC<Props> = ({
  subFact, slug, showSubmitButton, onStatusChange, onSuccessfulSubmission, occupationId, occupationConditionSetId,
  form: providedForm,
}) => {
  const { dimensionId, tagId } = useParams() as { dimensionId: string, tagId: string }
  let tagResourceId = tagId
  const [ownForm] = Form.useForm()
  const form = providedForm || ownForm
  const [state, setState] = useState({
    data: [] as Factor[], requests: {}, meta: {}, query: {},
  })
  const initialFactorOptionRef = React.useRef<SelectOptions | null>(subFact ? [{
    value: subFact.factorId,
    label: subFact.factorName,
  }] : null)

  const resourceName = getResourceName(slug)
  if (resourceName === 'occupations_factors') {
    tagResourceId = String(occupationId)
  }
  const resource = useResources<SubFactors>(
    resourceName,
    {
      basePath: `dimensions/${dimensionId}/${slug}/${tagResourceId}/`,
      responseType: SubFactorsTR,
    },
  )

  const { data: factors, fetch: search, isLoading: isFactorsLoading } = useResources<Factor>('factors', {
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

  const createSubFactors = (data: SubFactors) => resource.createResource(data)

  return (
    <ResourceForm
      resourceName={resourceName}
      resource={subFact}
      readableResourceName={I18n.t('admin.factors_index_title')}
      showSuccessMessages
      storeManager={{ form }}
      scrollToFirstError
      request={{ createResource: createSubFactors, updateResource: resource.updateResource }}
      onStatusChange={onStatusChange}
      onSuccessfulSubmission={onSuccessfulSubmission}
      transformValues={
        occupationConditionSetId ? values => ({
          ...values,
          ConditionSetId: occupationConditionSetId,
        }) : undefined}
      formProps={{ requiredMark: 'optional' }}
    >
      {({ status, isEdit }) => (
        <>
          <Form.Item
            name="factorId"
            label={I18n.t('admin.scoring_factor')}
            rules={[{ required: true }]}
          >
            <Select
              showSearch={{
                onSearch: (value) => {
                  initialFactorOptionRef.current = null
                  searchFactor(value)
                },
                filterOption: false,
              }}
              placeholder={I18n.t('admin.factors_form_search_factors')}
              options={initialFactorOptionRef.current
                ? initialFactorOptionRef.current : factors.map(({ id, name }) => ({ value: id, label: name }))}
              loading={isFactorsLoading('fetch')}
              notFoundContent={isFactorsLoading('fetch') ? <Spin size="small" /> : I18n.t('shared.no_results_found')}
            />
          </Form.Item>
          <Form.Item
            name="predicate"
            label={I18n.t('admin.factors_form_predicate')}
            rules={[{ required: true }]}
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
            rules={[{ required: true }]}
          >
            <InputNumber />
          </Form.Item>
          <Form.Item
            name="position"
            label={I18n.t('admin.occupations_factors_list_position')}
            rules={[{ required: true }]}
          >
            <InputNumber />
          </Form.Item>
          <Form.Item
            name="weight"
            label={I18n.t('admin.occupations_factors_list_weight')}
            rules={[{ required: true }]}
          >
            <InputNumber />
          </Form.Item>
          {showSubmitButton && (
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={status === Status.Saving}
              >
                {isEdit ? I18n.t('shared.update') : I18n.t('shared.add')}
              </Button>
            </Form.Item>
          )}
        </>
      )}
    </ResourceForm>
  )
}
