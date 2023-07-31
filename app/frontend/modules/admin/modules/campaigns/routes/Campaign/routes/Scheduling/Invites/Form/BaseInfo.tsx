import { useState } from 'react'
import {
  Button, Select, Switch,
  Form, Row, Col, Space,
} from 'antd'
import { Panel } from '~/glint/components/Panel/Panel'
import styles from './Form.less'

const { I18n } = window

export const BaseInfoForm = ({ form, next }) => {
  const [preferredLang, setPreferredLang] = useState(form.getFieldValue('allowPreferedLanguage'))
  const changePreferredLang = (checked) => {
    form.setFieldValue('allowPreferedLanguage', checked)
    setPreferredLang(checked)
  }
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
                name="assessment_centers"
                label={I18n.t('workshop_invite.basic_info.assessment_centers')}
              >
                <Select
                  showSearch
                  placeholder={I18n.t('workshop_invite.basic_info.assessment_centers_placeholder')}
                  options={[]}
                />
              </Form.Item>
              <Form.Item name="allowPreferedLanguage" valuePropName="checked">
                <Space>
                  <Switch
                    onChange={checked => changePreferredLang(checked)}
                  />
                  {I18n.t('workshop_invite.basic_info.prefered_language')}
                </Space>
              </Form.Item>
              {preferredLang
              && (
              <Form.Item
                name="prefered_language"
                label={I18n.t('workshop_invite.basic_info.prefered_language')}
              >
                <Select
                  showSearch
                  defaultValue="en"
                  placeholder={I18n.t('workshop_invite.basic_info.prefered_language_placeholder')}
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
