import React, { useEffect, useState } from 'react'
import {
  Button, Select, Switch, Alert,
  Form, Row, Col, Space, Tag, FormInstance, Input,
} from 'antd'
import _ from 'lodash'
import { useParams } from 'react-router-dom'
import { useDebouncedCallback } from 'use-debounce'
import { connect, ConnectedProps } from 'react-redux'

import { RootState } from '~/modules/admin/core/rootReducers'
import { Panel } from '~/glint/components/Panel/Panel'
import { Workshop } from '~/modules/admin/modules/campaigns/core/workshop'
import { useResources } from '~/hooks/useResources'
import styles from './Form.less'

const { I18n } = window

export interface Errors {
  [key:string] : {
    title: string
    details?: string
  }
}

interface OwnProps {
  form: FormInstance
  next: () => void
  prev?: () => void
  onCancel?: () => void
  workshops?: Workshop[]
  errors: Errors | null
}

interface AssessmentCenterGroup {
  id: string
  name: string
}

const connector = connect(
  (state: RootState) => ({
    availableLocales: state.config.availableLocales,
  }),
  {},
)
type PropsFromRedux = ConnectedProps<typeof connector>
type Props = OwnProps & PropsFromRedux

export const BaseInfoFormComponent: React.FC<Props> = ({
  form, next, onCancel, prev, workshops, errors, availableLocales,
}) => {
  const params = useParams() as {campaignId: string}
  const [preferredLang, setPreferredLang] = useState(form.getFieldValue('allowLanguagePreference'))
  const [allowNeurodiversityOption, setAllowNeurodiversityOption] = useState(
    form.getFieldValue('allowNeurodiversityOption'),
  )
  const [, setSelectedWorkshops] = useState([])
  const [searchValue, setSearchValue] = useState('')
  const [assessmentCenterGroups, setAssessmentCenterGroups] = useState<AssessmentCenterGroup[]>([])
  const {
    data: assessmentCenters, setData, getResource, fetch: fetchWorkshops,
  } = useResources<Workshop>('workshops', {
    basePath: `campaigns/${params.campaignId}`,
  })

  useEffect(() => {
    if (workshops && workshops.length > 0) {
      form.setFieldValue('workshopIds', [...workshops])
      setSelectedWorkshops(form.getFieldValue('workshopIds'))

      // Set the campaignAssessmentGroupId if it exists in the first workshop
      if (workshops[0].campaignAssessmentGroupId) {
        form.setFieldValue('campaignAssessmentGroupId', workshops[0].campaignAssessmentGroupId)
      }
    }
  }, [workshops])

  const {
    collectionAction: assessmentGroupsAction,
  } = useResources<AssessmentCenterGroup>(
    'campaign_assessment_groups',
    {
      basePath: `campaigns/${params.campaignId}`,
    },
  )

  useEffect(() => {
    assessmentGroupsAction({
      action: '',
      method: 'get',
      apiConfig: {
        filter: { group_type_eq: '1' },
      },
    })
      .then((response) => {
        const groups = response as AssessmentCenterGroup[]
        setAssessmentCenterGroups(groups)
        if (!form.getFieldValue('campaignAssessmentGroupId') && groups.length === 1) {
          form.setFieldValue('campaignAssessmentGroupId', groups[0].id)
        }
      })
      .catch((error) => {
        console.error('Failed to load assessment center groups:', error)
      })
  }, [params.campaignId])

  const changePreferredLang = (checked) => {
    form.setFieldValue('allowLanguagePreference', checked)
    if (!checked) {
      form.setFieldValue('languagesAllowed', [])
    }
    setPreferredLang(checked)
  }
  const changeNeuroDiversityOption = (checked) => {
    form.setFieldValue('allowNeurodiversityOption', checked)
    setAllowNeurodiversityOption(checked)
  }

  const changeWorkshops = (value) => {
    const values = form.getFieldValue('workshopIds') || []
    setSearchValue('')
    setData([])
    if (_.find(values, { id: value })) { return }

    form.setFieldValue('workshopIds', [...values, getResource(value)])
    setSelectedWorkshops(form.getFieldValue('workshopIds'))
  }

  const removeWorkshop = (id) => {
    const values = form.getFieldValue('workshopIds') || []
    form.setFieldValue('workshopIds', values.filter(w => w.id !== id && w))
    setSelectedWorkshops(form.getFieldValue('workshopIds'))
  }

  const searchWorkshops = useDebouncedCallback(() => {
    if (!searchValue) { return }
    if (!form.getFieldValue('campaignAssessmentGroupId')) { return }

    fetchWorkshops({
      apiConfig: {
        filter: {
          date_filter: 'upcoming',
          search_query: searchValue,
          campaign_assessment_group_id_eq: form.getFieldValue('campaignAssessmentGroupId'),
        },
      },
    })
  }, 200)

  const handleAssessmentGroupChange = (value: string) => {
    form.setFieldValue('campaignAssessmentGroupId', value)
    form.setFieldValue('workshopIds', [])
    setSelectedWorkshops([])
    setSearchValue('')
    setData([])

    fetchWorkshops({
      apiConfig: {
        filter: {
          date_filter: 'upcoming',
          campaign_assessment_group_id_eq: value,
        },
      },
    })
  }

  const handleCancel = () => {
    onCancel?.()
  }

  const handleFormFinish = () => {
    const selectedWorkshops = form.getFieldValue('workshopIds') || []
    if (selectedWorkshops.length === 0) {
      form.setFields([{
        name: 'workshops',
        errors: [I18n.t('admin.invite_basic_info_required_error')],
      }])
      return
    }
    next()
  }

  const handleNext = () => {
    form.submit()
  }

  return (
    <div>
      <Panel
        title={I18n.t('admin.invite_basic_info_title')}
        description={I18n.t('admin.invite_basic_info_description')}
      >
        <Row>
          <Col sm={24} md={12} lg={8}>
            <Form
              layout="vertical"
              form={form}
              validateMessages={{
                required: I18n.t('admin.invite_basic_info_required_error'),
              }}
              onFinish={handleFormFinish}
              requiredMark={false}
            >
              <Form.Item
                name="campaignAssessmentGroupId"
                label={I18n.t('admin.assessment_center_group')}
                rules={[{ required: true }]}
              >
                <Select
                  disabled={workshops && (workshops.length > 0)}
                  placeholder={
                    I18n.t('admin.assessment_center_group_placeholder')}
                  onChange={handleAssessmentGroupChange}
                >
                  {_.map(assessmentCenterGroups, (assessmentCenterGroup: AssessmentCenterGroup) => (
                    <Select.Option key={assessmentCenterGroup.id} value={assessmentCenterGroup.id}>
                      {assessmentCenterGroup.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                name="workshops"
                label={I18n.t('admin.invite_basic_info_assessment_centers')}
              >
                <Row gutter={[16, 16]}>
                  {errors?.workshopIds && (
                    <Col span={24}>
                      <Alert
                        message="Error"
                        description={errors.workshopIds.title}
                        type="error"
                      />
                    </Col>
                  )}
                  <Col span={24}>
                    <div className={styles.hint}>
                      {I18n.t('admin.invite_basic_info_assessment_centers_hint')}
                    </div>
                    <Select
                      disabled={workshops && (workshops.length > 0)}
                      showSearch={{
                        filterOption: false,
                        searchValue,
                        onSearch: (value) => {
                          setSearchValue(value)
                          searchWorkshops()
                        },
                      }}
                      placeholder={
                        I18n.t('admin.invite_basic_info_assessment_centers_placeholder')
                      }
                      options={assessmentCenters.map(workshop => ({
                        label: workshop.name, value: workshop.id,
                      }))}
                      onSelect={changeWorkshops}
                      value={null}
                    />
                  </Col>
                  <Col span={24}>
                    {(form.getFieldValue('workshopIds') || []).map(workshop => (
                      <Tag
                        key={workshop.id}
                        closable={!(workshops && workshops.length > 0)}
                        onClose={() => removeWorkshop(workshop.id)}
                      >
                        {workshop.name}
                      </Tag>
                    ))}
                  </Col>
                </Row>
              </Form.Item>
              <Form.Item name="allowLanguagePreference" valuePropName="checked">
                <Space>
                  <Switch
                    onChange={checked => changePreferredLang(checked)}
                    checked={preferredLang}
                  />
                  {I18n.t('admin.invite_basic_info_allow_preferred_language')}
                </Space>
              </Form.Item>
              {preferredLang
              && (
                <Form.Item
                  name="languagesAllowed"
                  label={I18n.t('admin.invite_basic_info_preferred_language')}
                  rules={[{ required: true }]}
                >
                  <Select
                    showSearch
                    mode="multiple"
                    optionFilterProp="children"
                  >
                    {availableLocales.map(locale => (
                      <Select.Option key={locale} value={locale}>
                        {I18n.t(`languages.${locale}`)}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              )
              }
              <Form.Item name="allowNeurodiversityOption" valuePropName="checked">
                <Space>
                  <Switch
                    onChange={checked => changeNeuroDiversityOption(checked)}
                    checked={allowNeurodiversityOption}
                  />
                  {I18n.t('admin.invite_basic_info_neurodiversity')}
                </Space>
              </Form.Item>
              <Form.Item
                label={I18n.t('shared.name')}
                name="name"
              >
                <Input
                  placeholder={I18n.t('admin.invite_name_placeholder')}
                />
              </Form.Item>
            </Form>
          </Col>
        </Row>
      </Panel>
      <div className={styles.footer}>
        <Space>
          {
            onCancel && (
              <Button onClick={handleCancel}>
                {I18n.t('shared.cancel')}
              </Button>
            )
          }
          {prev && <Button onClick={prev}>{I18n.t('shared.back')}</Button>}
          <Button type="primary" onClick={handleNext}>{I18n.t('shared.next')}</Button>
        </Space>
      </div>
    </div>
  )
}

export const BaseInfoForm = connector(BaseInfoFormComponent)
