import { useState } from 'react'
import {
  Button, Select, Switch,
  Form, Row, Col, Space, Tag,
} from 'antd'
import _ from 'lodash'
import { useParams } from 'react-router-dom'
import { useDebouncedCallback } from 'use-debounce/lib/index'
import { formatWorkshopDate } from '~/utils/workshop'
import { Panel } from '~/glint/components/Panel/Panel'
import { Workshop } from '~/modules/admin/modules/campaigns/core/workshop'
import { useResources } from '~/hooks/useResources'
import styles from './Form.less'

const { I18n } = window

export const BaseInfoForm = ({ form, next }) => {
  const params = useParams<{campaignId: string}>()
  const [preferredLang, setPreferredLang] = useState(form.getFieldValue('allowPreferredLanguage'))
  const [, setSelectedWorkshops] = useState([])
  const [searchValue, setSearchValue] = useState('')
  const {
    data: assessmetnCenters, setData, getResource, fetch: fetchWorkshops,
  } = useResources<Workshop>('workshops', {
    basePath: `campaigns/${params.campaignId}`,
  })

  const changePreferredLang = (checked) => {
    form.setFieldValue('allowPreferredLanguage', checked)
    setPreferredLang(checked)
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

  const [searchWorkshops] = useDebouncedCallback(() => {
    if (!searchValue) { return }

    fetchWorkshops({
      apiConfig: {
        filter: {
          search_query: searchValue,
        },
      },
    })
  }, 200)

  return (
    <div>
      <Panel
        title={I18n.t('workshop_invite.basic_info.title')}
        description={I18n.t('workshop_invite.basic_info.description')}
      >
        <Row>
          <Col sm={24} md={12} lg={8}>
            <Form layout="vertical" form={form}>
              <Form.Item
                name="workshops"
                label={I18n.t('workshop_invite.basic_info.assessment_centers')}
              >
                <Row gutter={[16, 16]}>
                  <Col span={24}>
                    <div className={styles.hint}>
                      {I18n.t('workshop_invite.basic_info.assessment_centers_hint')}
                    </div>
                    <Select
                      showSearch
                      placeholder={I18n.t('workshop_invite.basic_info.assessment_centers_placeholder')}
                      options={assessmetnCenters.map(workshop => ({
                        label: formatWorkshopDate(workshop.startTime), value: workshop.id,
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
                      <Tag closable onClose={() => removeWorkshop(workshop.id)}>
                        {formatWorkshopDate(workshop.startTime)}
                      </Tag>
                    ))}
                  </Col>
                </Row>
              </Form.Item>
              <Form.Item name="allowPreferredLanguage" valuePropName="checked">
                <Space>
                  <Switch
                    onChange={checked => changePreferredLang(checked)}
                  />
                  {I18n.t('workshop_invite.basic_info.preferred_language')}
                </Space>
              </Form.Item>
              {preferredLang
              && (
              <Form.Item
                name="preferred_language"
                label={I18n.t('workshop_invite.basic_info.preferred_language')}
              >
                <Select
                  showSearch
                  defaultValue="en"
                  placeholder={I18n.t('workshop_invite.basic_info.preferred_language_placeholder')}
                  options={[
                    { value: 'en', label: 'English' },
                    { value: 'ar', label: 'Arabic' },
                  ]}
                />
              </Form.Item>
              )
            }

              <Form.Item name="allowNeurodiversityOption" valuePropName="checked">
                <Space>
                  <Switch
                    onChange={checked => form.setFieldValue('allowNeurodiversityOption', checked)}
                  />
                  {I18n.t('workshop_invite.basic_info.neurodiversity')}
                </Space>
              </Form.Item>
            </Form>
          </Col>
        </Row>
      </Panel>
      <div className={styles.footer}>
        <Space>
          <Button type="primary" onClick={next}>{I18n.t('workshop_invite.next')}</Button>
        </Space>
      </div>
    </div>
  )
}
