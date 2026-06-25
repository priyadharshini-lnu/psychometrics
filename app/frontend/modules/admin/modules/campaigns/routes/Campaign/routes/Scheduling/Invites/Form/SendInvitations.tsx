import { useEffect, useState, FC } from 'react'
import {
  Button, Select,
  Form, Row, Col, Space, Input,
} from 'antd'
import { FormInstance } from 'antd/es/form'
import _ from 'lodash'
import { Panel } from '~/glint/components/Panel/Panel'
import { type Errors } from './BaseInfo'
import styles from './Form.less'

const { I18n } = window

type Props = {
  form: FormInstance
  prev: () => void
  submit: () => void
  errors: Errors | null
  onCancel?: () => void
  isLoading?: boolean
}

export const SendInvitation: FC<Props> = ({
  form,
  prev,
  submit,
  errors,
  onCancel,
  isLoading,
}) => {
  const allowedLanguages = form.getFieldValue('languagesAllowed')
  const [selectedLang, setSelectedLang] = useState<string>('')
  const [languages, setLanguages] = useState<{
    [key: string]: { locale: string, name: string, title: string, description: string }
  }>({
    en: {
      locale: 'en',
      name: 'English',
      title: '',
      description: '',
    },
  })

  useEffect(() => {
    form.setFieldValue('translations', _.map(languages, v => v))
  }, [languages])

  const addLang = () => {
    if (!selectedLang) return
    setLanguages({
      ...languages,
      [selectedLang]: {
        locale: selectedLang,
        name: I18n.t(`languages.${selectedLang}`),
        title: '',
        description: '',
      },
    })
  }

  const handleCancel = () => {
    onCancel && onCancel()
  }

  let index = -1
  return (
    <div>
      <Form layout="vertical" form={form}>
        {_.map(languages, (lang, code) => {
          index += 1
          return (
            <Panel
              key={code}
              collapsible
              title={I18n.t('admin.invite_send_invites_title',
                { lang: I18n.t(`languages.${lang.locale}`) })}
              description={I18n.t('shared.description')}
            >
              <Row>
                <Col sm={24} md={12} lg={8}>
                  <Form.Item
                    label={I18n.t('admin.invite_send_invites_invitation_title')}
                    validateStatus={errors?.[`translations/${index}/title`] ? 'error' : undefined}
                    hasFeedback={!!errors?.[`translations/${index}/title`]}
                    help={errors?.[`translations/${index}/title`]?.title}
                  >
                    <Input onChange={e => setLanguages({
                      ...languages,
                      [code]: {
                        ...languages[code],
                        title: e.currentTarget.value,
                      },
                    })}
                    />
                  </Form.Item>

                  <Form.Item
                    label={I18n.t('shared.description')}
                    validateStatus={errors?.[`translations/${index}/description`] ? 'error' : undefined}
                    hasFeedback={!!errors?.[`translations/${index}/description`]}
                    help={errors?.[`translations/${index}/description`]?.title}
                  >
                    <Input.TextArea onChange={e => setLanguages({
                      ...languages,
                      [code]: {
                        ...languages[code],
                        description: e.currentTarget.value,
                      },
                    })}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Panel>
          )
        })}

        {allowedLanguages?.length > 0 ? (
          <Panel
            title={I18n.t('admin.invite_send_invites_add_language')}
            description={I18n.t('admin.invite_send_invites_add_description')}
          >
            <Row>
              <Col sm={24} md={12} lg={8}>
                <Form.Item
                  name="add_lang"
                  label={I18n.t('admin.invite_send_invites_input_label')}
                >
                  <Row gutter={12}>
                    <Col flex="1">
                      <Select
                        placeholder={I18n.t('admin.invite_send_invites_input_placeholder')}
                        options={allowedLanguages.map(lang => (
                          {
                            value: lang,
                            label: I18n.t(`languages.${lang}`),
                          }
                        ))}
                        onChange={value => setSelectedLang(value)}
                      />
                    </Col>
                    <Button type="primary" onClick={addLang}>
                      {I18n.t('shared.add')}
                    </Button>
                  </Row>
                </Form.Item>
              </Col>
            </Row>
          </Panel>
        ) : null}
      </Form>

      <div className={styles.footer}>
        <Space>
          {
            onCancel && (
              <Button onClick={handleCancel} disabled={isLoading}>
                {I18n.t('shared.cancel')}
              </Button>
            )
          }
          <Button disabled={isLoading} onClick={prev}>{I18n.t('shared.back')}</Button>
          <Button
            loading={isLoading}
            type="primary"
            onClick={submit}
          >
            {I18n.t('admin.invite_save')}
          </Button>
        </Space>
      </div>
    </div>
  )
}
