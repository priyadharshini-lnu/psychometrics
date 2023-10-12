import React from 'react'
import {
  Form, Input, Select, Spin,
} from 'antd'
import cs from 'classnames'
import { FormInstance } from 'antd/lib/form'
import { useResources } from '~/hooks/useResources'
import { Assessment, LinkedAssessment, CATEGORIES } from '~/modules/admin/modules/client/core/assessments'
import { Dimension } from '~/modules/admin/modules/client/core/dimensions'
import { Client } from '~/modules/admin/modules/client/core/clients'
import { ExternalAssessmentFields } from './ExternalAssessmentFields'

const { TextArea } = Input

const { I18n } = window

interface Props {
  assessment?: Assessment
  form: FormInstance
}

type OptionsType = {
  id: string
  name: string
}

export const BaseFormFields: React.FC<Props> = ({ assessment, form }) => {
  const {
    data: dimensions, fetch: fetchDimensions, isLoading: isDimensionsLoading,
  } = useResources<Dimension>('dimensions')
  const {
    data: clients, fetch: fetchClients, isLoading: isClientsLoading,
  } = useResources<Client>('clients')
  const {
    data: assessments, fetch: fetchAssessments, isLoading: isAssessmentsLoading,
  } = useResources<LinkedAssessment>('assessments')

  const type = Form.useWatch('type', form)
  const category = Form.useWatch('category', form)

  const getDimensions = (): OptionsType[] => {
    if (!assessment || !assessment.dimension || dimensions.find(d => assessment?.dimension?.id === d.id)) {
      return dimensions
    }

    return [...dimensions, assessment.dimension]
  }

  const getClients = (): OptionsType[] => {
    if (!assessment || !assessment.owner || clients.find(d => assessment?.owner?.id === d.id)) {
      return clients
    }

    return [...clients, assessment.owner]
  }

  const getAssessments = (): OptionsType[] => {
    if (!assessment || !assessment.linkedAssessment
        || assessments.find(d => assessment?.linkedAssessment?.id === d.id)) {
      return assessments
    }

    return [...assessments, assessment.linkedAssessment]
  }

  const ExternalAssessmentFieldsComponent = ExternalAssessmentFields[type]

  const getCategories = () => CATEGORIES.filter(c => !ExternalAssessmentFields[c])


  return (
    <>
      <Form.Item
        name="ownerId"
        label={I18n.t('common.column.owner')}
        initialValue={assessment?.owner?.id || null}
      >
        <Select
          showSearch
          onSearch={(value) => {
            fetchClients({
              apiConfig: { filter: { filterable_fields: value }, fields: { clients: ['name'] } },
            })
          }}
          notFoundContent={isClientsLoading('fetch') ? <Spin size="small" /> : null}
          filterOption={false}
        >
          <Select.Option>TTE</Select.Option>
          {getClients().map(({ id, name }) => (
            <Select.Option key={id} value={id}>{name}</Select.Option>
          ))}
        </Select>
      </Form.Item>
      {ExternalAssessmentFieldsComponent && <ExternalAssessmentFieldsComponent form={form} assessment={assessment} />}
      <Form.Item
        name="name"
        label={I18n.t('common.column.name')}
        rules={[{ required: true }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="description"
        label={I18n.t('common.column.description')}
      >
        <TextArea />
      </Form.Item>
      <Form.Item name="timing" label={I18n.t('common.column.timing')}>
        <TextArea />
      </Form.Item>
      <Form.Item
        name="category"
        className={cs({ hidden: !!ExternalAssessmentFieldsComponent })}
        label={I18n.t('common.column.category')}
        rules={[{ required: true }]}
      >
        <Select>
          {getCategories().map(
            c => <Select.Option key={c} value={c}>{I18n.t(`assessments.fields.category.${c}`)}</Select.Option>,
          )}
        </Select>
      </Form.Item>
      {category === 'assessor_form' && (
        <Form.Item
          name="linkedAssessmentId"
          label={I18n.t('common.column.linked_assessment')}
        >
          <Select
            showSearch
            onSearch={(value) => {
              fetchAssessments({
                apiConfig: {
                  filter: {
                    filterable_fields: value,
                    category_in: ['psychometric', 'agile', 'case_study'],
                    archived_eq: 'false',
                  },
                  fields: { assessments: ['name'] },
                },
              })
            }}
            notFoundContent={isAssessmentsLoading('fetch') ? <Spin size="small" /> : null}
            filterOption={false}
          >
            {getAssessments().map(({ id, name }) => <Select.Option key={id} value={id}>{name}</Select.Option>)}
          </Select>
        </Form.Item>
      )}
      <Form.Item
        name="dimensionId"
        label={I18n.t('common.column.dimension')}
        rules={[{ required: true }]}
      >
        <Select
          showSearch
          onSearch={(value) => {
            fetchDimensions({
              apiConfig: { filter: { filterable_fields: value }, fields: { dimensions: ['name'] } },
            })
          }}
          notFoundContent={isDimensionsLoading('fetch') ? <Spin size="small" /> : null}
          filterOption={false}
        >
          {getDimensions().map(({ id, name }) => (
            <Select.Option key={id} value={id}>{name}</Select.Option>
          ))}
        </Select>
      </Form.Item>
    </>
  )
}
