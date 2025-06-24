import { FC, useEffect, useState } from 'react'
import {
  Col, Row, Form, Input, Radio, Checkbox, Button, Upload, Image, Flex, Card,
  FormInstance,
} from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import _ from 'lodash'
import { LangDropdown } from '~/components/LangDropdown'
import {
  Idp,
} from '~/modules/admin/modules/client/core/idp'


const LOGO_TYPE = {
  both: 'both',
  mercer_only: 'mercer_only',
  client_only: 'client_only',
  none: 'none',
}

const FIELDS = [
  'name',
  'role',
  'assigned_data',
  'division',
  'review_date',
  'publish_date',
  'completion_date',
]

const { I18n } = window

interface AppearanceTabProps {
  idp?: Idp,
  form: FormInstance
}

export const AppearanceTab: FC<AppearanceTabProps> = ({ idp, form }) => {
  const [lang, setLang] = useState(I18n.locale)
  const [translations, setTranslations] = useState(idp?.translations || {})

  const changeTitle = (e) => {
    setTranslations({
      ...translations,
      [lang]: {
        ...translations[lang],
        titleText: e.target.value,
      },
    })
  }
  const changeSubtitle = (e) => {
    setTranslations({
      ...translations,
      [lang]: {
        ...translations[lang],
        subtitleText: e.target.value,
      },
    })
  }

  useEffect(() => {
    setTranslations(idp?.translations || {})
  }, [idp])

  useEffect(() => {
    form.setFieldValue('translations', translations)
  }, [translations])

  return (
    <Row gutter={16}>
      <Col xs={24} md={12}>
        <Form.Item name="logoType" label={I18n.t('administration.idp.logo_type_label')}>
          <Radio.Group>
            <Flex vertical>
              {_.map(LOGO_TYPE, (type, key) => (
                <Radio key={key} value={type}>
                  {I18n.t(`administration.idp.logo_type.${key}`)}
                </Radio>
              ))}
            </Flex>
          </Radio.Group>
        </Form.Item>
        <Card className="p-4" bodyStyle={{ padding: 0 }}>

          <Form.Item
            name="background"
            label={I18n.t('administration.idp.background_image')}
          >
            <Upload
              listType="picture"
              maxCount={1}
              accept=".jpeg, .jpg, .png, .svg, .gif, .bmp, image/jpeg, image/png, image/svg+xml"
              beforeUpload={() => false}
            >
              <Button icon={<UploadOutlined />}>
                {I18n.t('administration.projects.design_settings.logo_upload')}
              </Button>
            </Upload>
            {idp?.background && <Image className="mt-4" height={100} src={idp?.background} />}
          </Form.Item>
          {idp?.background && (
            <Form.Item
              name="removeBackground"
              valuePropName="checked"
              noStyle
            >
              <Checkbox disabled={!idp?.background}>
                {I18n.t('administration.idp.remove')}
              </Checkbox>
            </Form.Item>
          )}
        </Card>
        <Card className="p-4" bodyStyle={{ padding: 0 }}>
          <Form.Item
            name="clientLogo"
            label={I18n.t('administration.idp.logo_image')}
          >
            <Upload
              listType="picture"
              maxCount={1}
              accept=".jpeg, .jpg, .png, .svg, .gif, .bmp, image/jpeg, image/png, image/svg+xml"
              beforeUpload={() => false}
            >
              <Button icon={<UploadOutlined />}>
                {I18n.t('administration.projects.design_settings.logo_upload')}
              </Button>
            </Upload>
            {idp?.clientLogo && <Image className="mt-4" height={100} src={idp?.clientLogo} />}
          </Form.Item>
          {idp?.clientLogo && (
            <Form.Item
              name="removeClientLogo"
              valuePropName="checked"
              noStyle
            >
              <Checkbox disabled={!idp?.clientLogo}>
                {I18n.t('administration.idp.remove')}
              </Checkbox>
            </Form.Item>
          )}
        </Card>
      </Col>
      <Col xs={24} md={12}>
        <Flex justify="flex-end">
          <LangDropdown
            currentLocale={lang}
            locales={I18n.availableLocales}
            onChange={lang => setLang(lang)}
            useLoading={false}
          />
        </Flex>
        <Form.Item label={I18n.t('administration.idp.title_text')}>
          <Input onChange={changeTitle} value={translations[lang]?.titleText || ''} />
        </Form.Item>
        <Form.Item label={I18n.t('administration.idp.subtitle_text')}>
          <Input onChange={changeSubtitle} value={translations[lang]?.subtitleText || ''} />
        </Form.Item>

        <Form.Item name="fields" label={I18n.t('administration.idp.fields_label')}>
          <Checkbox.Group>
            <Row>
              {FIELDS.map(field => (
                <Col xs={12} key={field}>
                  <Checkbox value={field}>
                    {I18n.t(`administration.idp.fields.${field}`)}
                  </Checkbox>
                </Col>
              ))}
            </Row>
          </Checkbox.Group>
        </Form.Item>
        <Form.Item name="showReflections" valuePropName="checked">
          <Checkbox>
            {I18n.t('administration.idp.show_reflections')}
          </Checkbox>
        </Form.Item>
      </Col>
    </Row>
  )
}
