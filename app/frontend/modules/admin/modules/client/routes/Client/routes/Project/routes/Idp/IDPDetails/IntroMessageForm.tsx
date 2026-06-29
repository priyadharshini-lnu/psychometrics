import {
  useState, useEffect, FC,
} from 'react'
import {
  Row, Col, Typography, Select, Form, Flex, message, Button, Space,
} from 'antd'
import { useParams } from 'react-router-dom'
import Editor from '~/components/Editor'
import {
  Idp, IdpTR, IntroMessageTR,
} from '~/modules/admin/modules/client/core/idp'
import { SafeHTML } from '~/components/SafeHTML'
import { useResources } from '~/hooks/useResources'

const { I18n } = window

interface Props {
  idp: Idp,
  fetch: () => void,
}

export const IntroMessageForm: FC<Props> = ({ idp, fetch }) => {
  const { projectId } = useParams() as { projectId: string }
  const [referenceLocale, setReferenceLocale] = useState('')
  const [htmlContent, setHTMLContent] = useState('')

  const { availableLocales } = I18n
  const [form] = Form.useForm()

  const baseApiConfig = {
    basePath: `projects/${projectId}`,
    trackUrl: true,
    responseType: IdpTR,
    apiConfig: {
      fields: {
        skills: ['id', 'name', 'skill_type', 'project_id'],
      },
      include: ['skills', 'report'],
    },
  }

  const {
    collectionAction, memberAction,
  } = useResources<Idp>('idp_templates', baseApiConfig)

  const fetchInstructionsBasedOnLanguage = (lang, callback) => {
    collectionAction({
      method: 'get',
      action: `${idp.id}`,
      apiConfig: {
        query: {
          locale: lang,
        },
      },
      responseType: IntroMessageTR,
    }).then((res) => {
      callback(res)
    })
  }

  const handleSubmit = async () => {
    const values = await form.validateFields()

    memberAction({
      id: idp.id,
      action: 'update_instructions',
      method: 'post',
      body: {
        instructions: {
          content: values.instructions,
        },
        locale: values.locale,
      },
      apiConfig: {},
      responseType: IntroMessageTR,
    }).then(() => {
      message.success(I18n.t('admin.idp_intro_message_success'))
      fetch()
    })
  }

  const instructions = Form.useWatch('instructions', form)

  useEffect(() => {
    if (idp) {
      form.setFieldsValue({
        instructions: idp.instructions.content,
      })
    }
  }, [])

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{
        instructions: idp.instructions.content,
      }}
    >
      <Space orientation="vertical">
        <Row>
          <Col span={24}>
            <div className="display-flex justify-content-space-between mt8">
              <Form.Item
                name="locale"
                label={I18n.t('admin.idp_locales')}
                initialValue="en"
              >
                <Select
                  style={{ width: 150 }}
                  onChange={(value) => {
                    fetchInstructionsBasedOnLanguage(value, (res) => {
                      form.setFieldsValue({
                        instructions: res.instructions.content,
                      })
                    })
                  }}
                  defaultValue="en"
                >
                  {availableLocales.map(locale => (
                    <Select.Option key={locale} value={locale}>{I18n.t(`languages.${locale}`)}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </div>
          </Col>
          <Col span={24}>
            <Flex vertical>
              <Form.Item name="instructions" noStyle />
              <Editor
                content={instructions || ''}
                handleContentChange={(value) => {
                  form.setFieldValue('instructions', value)
                }}
              />

              {idp.instructions.content && (
                <>
                  <div>
                    <Flex vertical className="mt16">
                      <Typography.Text style={{
                        fontWeight: 600,
                      }}
                      >
                        {I18n.t('admin.idp_reference_locale')}
                      </Typography.Text>
                      <Select
                        style={{ width: 150 }}
                        onChange={(value) => {
                          setReferenceLocale(value)
                          fetchInstructionsBasedOnLanguage(value, (res) => {
                            setHTMLContent(res.instructions.content)
                          })
                        }}
                        defaultValue=""
                        className="mb8 mt8"
                        placeholder={I18n.t('select')}
                      >
                        <Select.Option value="">
                          {I18n.t('common.text.none')}
                        </Select.Option>
                        {idp.availableLocales.map(locale => (
                          <Select.Option key={locale} value={locale}>
                            {I18n.t(`languages.${locale}`)}
                          </Select.Option>
                        ))}
                      </Select>
                    </Flex>
                  </div>

                  {referenceLocale && (
                    <div style={{
                      border: '1px solid #CCCCCC',
                      borderRadius: '10px',
                      flex: 1,
                    }}
                    >
                      <SafeHTML
                        html={htmlContent}
                        config="adminRichText"
                        className="m16"
                      />
                    </div>
                  )}
                </>
              )}
            </Flex>
          </Col>

        </Row>
        <Button
          key="submit"
          type="primary"
          onClick={handleSubmit}
        >
          {I18n.t('shared.update')}
        </Button>
      </Space>
    </Form>
  )
}

export default IntroMessageForm
