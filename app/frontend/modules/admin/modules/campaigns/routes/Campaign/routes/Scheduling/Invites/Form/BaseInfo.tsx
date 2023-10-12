import React, { useEffect, useState } from 'react'
import {
  Button, Select, Switch, Alert,
  Form, Row, Col, Space, Tag, FormInstance,
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
  const params = useParams<{campaignId: string}>()
  const [preferredLang, setPreferredLang] = useState(form.getFieldValue('allowLanguagePreference'))
  const [allowNeurodiversityOption, setAllowNeurodiversityOption] = useState(
    form.getFieldValue('allowNeurodiversityOption'),
  )
  const [, setSelectedWorkshops] = useState([])
  const [searchValue, setSearchValue] = useState('')
  const {
    data: assessmetnCenters, setData, getResource, fetch: fetchWorkshops,
  } = useResources<Workshop>('workshops', {
    basePath: `campaigns/${params.campaignId}`,
  })

  useEffect(() => {
    if (workshops) {
      form.setFieldValue('workshopIds', [...workshops])
      setSelectedWorkshops(form.getFieldValue('workshopIds'))
    }
  }, [workshops])

  const changePreferredLang = (checked) => {
    form.setFieldValue('allowLanguagePreference', checked)
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

    fetchWorkshops({
      apiConfig: {
        filter: {
          search_query: searchValue,
        },
      },
    })
  }, 200)

  const handleCancel = () => {
    onCancel?.()
  }

  const handleFormFinish = () => {
    next()
  }

  const handleNext = () => {
    form.submit()
  }

  return (
    <div>
      <Panel
        title={I18n.t('administration.assessment_center.invite.basic_info.title')}
        description={I18n.t('administration.assessment_center.invite.basic_info.description')}
      >
        <Row>
          <Col sm={24} md={12} lg={8}>
            <Form
              layout="vertical"
              form={form}
              validateMessages={{
                required: I18n.t('administration.assessment_center.invite.basic_info.required_error'),
              }}
              onFinish={handleFormFinish}
              requiredMark={false}
            >
              <Form.Item
                name="workshops"
                label={I18n.t('administration.assessment_center.invite.basic_info.assessment_centers')}
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
                      {I18n.t('administration.assessment_center.invite.basic_info.assessment_centers_hint')}
                    </div>
                    <Select
                      disabled={workshops && (workshops.length > 0)}
                      showSearch
                      // eslint-disable-next-line max-len
                      placeholder={I18n.t('administration.assessment_center.invite.basic_info.assessment_centers_placeholder')}
                      options={assessmetnCenters.map(workshop => ({
                        label: workshop.name, value: workshop.id,
                      }))}
                      onSelect={changeWorkshops}
                      filterOption={false}
                      searchValue={searchValue}
                      value={null}
                      onSearch={(value) => {
                        setSearchValue(value)
                        searchWorkshops()
                      }}
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
                  {I18n.t('administration.assessment_center.invite.basic_info.allow_preferred_language')}
                </Space>
              </Form.Item>
              {preferredLang
              && (
                <Form.Item
                  name="languagesAllowed"
                  label={I18n.t('administration.assessment_center.invite.basic_info.preferred_language')}
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
                  {I18n.t('administration.assessment_center.invite.basic_info.neurodiversity')}
                </Space>
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
                {I18n.t('common.actions.cancel')}
              </Button>
            )
          }
          {prev && <Button onClick={prev}>{I18n.t('administration.assessment_center.invite.back')}</Button>}
          <Button type="primary" onClick={handleNext}>{I18n.t('administration.assessment_center.invite.next')}</Button>
        </Space>
      </div>
    </div>
  )
}

export const BaseInfoForm = connector(BaseInfoFormComponent)
