import React, { useCallback } from 'react'
import {
  Form, Input, Select, Spin,
} from 'antd'
import cs from 'classnames'
import { FormInstance } from 'antd/es/form'
import { Tag } from 'modules/admin/core/tags'
import _ from 'lodash'
import { connect } from 'react-redux'
import { useResources } from '~/hooks/useResources'
import {
  Assessment, LinkedAssessment, UPDATABLE_CATEGORIES, CREATABLE_CATEGORIES,
} from '~/modules/admin/modules/client/core/assessments'
import { Dimension } from '~/modules/admin/modules/client/core/dimensions'
import { Client } from '~/modules/admin/modules/client/core/clients'
import { ExternalAssessmentFields } from './ExternalAssessmentFields'
import { TaggableResourceType } from '~/modules/admin/components/Resource/TagFilter/constants'
import { RootState } from '~/modules/admin/core/rootReducers'
import { get as getCurrentUser, isSuperAdmin } from '~/core/currentUser'

const { TextArea } = Input

const { I18n } = window

const MAX_TAG_BATCH_SIZE = 100

const connecter = connect(
  (state: RootState) => ({
    currentUser: getCurrentUser(state),
  }),
)

interface Props {
  assessment?: Assessment
  form: FormInstance
  showTranslatableFields?: boolean
  handleAssessmentSelect?(value: string) : void
  currentUser
}

type OptionsType = {
  id: string
  name: string
}

const BaseFormFieldsComp: React.FC<Props> = ({
  assessment, form, showTranslatableFields, handleAssessmentSelect, currentUser,
}) => {
  const { availableLocales } = I18n
  const {
    data: dimensions, fetch: fetchDimensions, isLoading: isDimensionsLoading,
  } = useResources<Dimension>('dimensions')
  const {
    data: tags, fetch: fetchTags, isLoading: isTagsLoading,
  } = useResources<Tag>('tags', { apiConfig: { query: { taggable_resource_type: TaggableResourceType.Assessment } } })
  const {
    data: clients, fetch: fetchClients, isLoading: isClientsLoading,
  } = useResources<Client>('clients')
  const {
    data: assessments, fetch: fetchAssessments, isLoading: isAssessmentsLoading,
  } = useResources<LinkedAssessment>('assessments')


  const type = Form.useWatch('type', form)
  const category = Form.useWatch('category', form)
  const ownerId = Form.useWatch('ownerId', form)
  const selectedOwnerId = ownerId ?? assessment?.owner?.id

  const getDimensions = (): OptionsType[] => {
    if (!assessment || !assessment.dimension || dimensions.find(d => assessment?.dimension?.id === d.id)) {
      return dimensions
    }

    return [...dimensions, assessment.dimension]
  }

  const getClients = (): OptionsType[] => {
    if (assessment) {
      return assessment?.owner ? [assessment.owner] : []
    }

    return clients
  }

  const getAssessments = (): OptionsType[] => {
    if (!assessment || !assessment.linkedAssessment
        || assessments.find(d => assessment?.linkedAssessment?.id === d.id)) {
      return assessments
    }

    return [...assessments, assessment.linkedAssessment]
  }

  const ExternalAssessmentFieldsComponent = ExternalAssessmentFields[type]
  const categories = assessment ? UPDATABLE_CATEGORIES : CREATABLE_CATEGORIES
  const isCategoryHidden = () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    assessment && assessment.category && !categories.includes(assessment.category)
    if (assessment) {
      return !categories.includes(assessment.category)
    }
    return !!ExternalAssessmentFieldsComponent
  }

  const debouncedFetchTags = useCallback(_.debounce((value) => {
    fetchTags({
      apiConfig: {
        filter: { name_cont: value },
        fields: { tags: ['name'] },
        page: {
          size: MAX_TAG_BATCH_SIZE,
        },
      },
    })
  }, 300), [])


  return (
    <>
      <Form.Item
        name="ownerId"
        label={I18n.t('shared.owner')}
        initialValue={assessment?.owner?.id || null}
      >
        <Select
          showSearch={!assessment ? {
            filterOption: false,
            onSearch: (value) => {
              fetchClients({
                apiConfig: { filter: { filterable_fields: value }, fields: { clients: ['name'] } },
              })
            },
          } : false}
          notFoundContent={isClientsLoading('fetch') ? <Spin size="small" /> : I18n.t('shared.no_results_found')}
        >
          {isSuperAdmin(currentUser) && <Select.Option>{I18n.t('admin.platform_owner')}</Select.Option>}
          {getClients().map(({ id, name }) => (
            <Select.Option key={id} value={id}>{name}</Select.Option>
          ))}
        </Select>
      </Form.Item>
      {ExternalAssessmentFieldsComponent && (
        <ExternalAssessmentFieldsComponent
          form={form}
          assessment={assessment}
          handleAssessmentSelect={handleAssessmentSelect}
        />
      )}
      {showTranslatableFields
        && (
          <>
            <Form.Item
              name="name"
              label={I18n.t('shared.name')}
              rules={[{ required: true }]}
            >
              <Input name="assessment_name" />
            </Form.Item>
            <Form.Item
              name="description"
              label={I18n.t('shared.description')}
            >
              <TextArea />
            </Form.Item>
            <Form.Item name="timing" label={I18n.t('common.column.timing')}>
              <TextArea />
            </Form.Item>
          </>
        )
      }
      <Form.Item
        name="category"
        className={cs({ hidden: isCategoryHidden() })}
        label={I18n.t('shared.category')}
        rules={[{ required: true }]}
      >
        <Select>
          {categories.map(
            c => (
              <Select.Option key={c} value={c}>
                {I18n.t(`admin.${c}`)}
              </Select.Option>
            ),
          )}
        </Select>
      </Form.Item>
      {category === 'assessor_form' && (
        <Form.Item
          name="linkedAssessmentId"
          label={I18n.t('shared.linked_assessment')}
        >
          <Select
            showSearch={{
              filterOption: false,
              onSearch: (value) => {
                fetchAssessments({
                  apiConfig: {
                    filter: {
                      filterable_fields: value,
                      category_in: ['psychometric', 'agile', 'case_study', 'organisational', 'meeting'],
                      archived_eq: 'false',
                    },
                    fields: { assessments: ['name'] },
                  },
                })
              },
            }}
            notFoundContent={isAssessmentsLoading('fetch') ? <Spin size="small" /> : I18n.t('shared.no_results_found')}
            allowClear
          >
            {getAssessments().map(({ id, name }) => <Select.Option key={id} value={id}>{name}</Select.Option>)}
          </Select>
        </Form.Item>
      )}
      <Form.Item
        name="dimensionId"
        label={I18n.t('shared.dimension')}
        rules={[{ required: true }]}
      >
        <Select
          showSearch={{
            filterOption: false,
            onSearch: (value) => {
              fetchDimensions({
                apiConfig: {
                  filter: {
                    filterable_fields: value,
                    owner_id: selectedOwnerId,
                  },
                  fields: { dimensions: ['name'] },
                },
              })
            },
          }}
          notFoundContent={isDimensionsLoading('fetch') ? <Spin size="small" /> : I18n.t('shared.no_results_found')}
        >
          {getDimensions().map(({ id, name }) => (
            <Select.Option key={id} value={id}>{name}</Select.Option>
          ))}
        </Select>
      </Form.Item>
      {type === 'common' && (
        <Form.Item
          name="defaultLanguage"
          label={I18n.t('common.column.default_language')}
          initialValue={assessment?.defaultLanguage || 'en'}
        >
          <Select disabled={!!assessment}>
            {availableLocales.map(locale => (
              <Select.Option key={locale} value={locale}>{I18n.t(`languages.${locale}`)}</Select.Option>
            ))}
          </Select>
        </Form.Item>
      )}
      <Form.Item
        name="tagList"
        label={I18n.t('shared.tags')}
      >
        <Select
          mode="tags"
          style={{ width: '100%' }}
          placeholder={I18n.t('shared.tags')}
          showSearch={{
            filterOption: false,
            onSearch: (value) => {
              debouncedFetchTags(value)
            },
          }}
          notFoundContent={isTagsLoading('fetch') ? <Spin size="small" /> : I18n.t('shared.no_results_found')}
        >
          {tags.map(({ name }) => (
            <Select.Option key={name} value={name}>{name}</Select.Option>
          ))}
        </Select>
      </Form.Item>
    </>
  )
}

export const BaseFormFields = connecter(BaseFormFieldsComp)
