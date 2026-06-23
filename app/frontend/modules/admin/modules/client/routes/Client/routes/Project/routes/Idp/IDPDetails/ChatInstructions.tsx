import {
  useState, useEffect, FC,
} from 'react'
import {
  Row, Col, Typography, Select, Form, message, Button, Space, Switch, Flex, Divider,
} from 'antd'
import { useParams } from 'react-router-dom'
import Editor from '~/components/Editor'
import {
  Idp, IdpTR, ChatInstructionsTR,
} from '~/modules/admin/modules/client/core/idp'
import { SafeHTML } from '~/components/SafeHTML'
import { useResources } from '~/hooks/useResources'

const { I18n } = window

interface Props {
  idp: Idp,
  fetch: () => void,
}

export const ChatInstructions: FC<Props> = ({ idp, fetch }) => {
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
    collectionAction, memberAction, updateResource,
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
      responseType: ChatInstructionsTR,
    }).then((res) => {
      callback(res)
    })
  }

  const handleSubmit = async () => {
    const values = await form.validateFields()

    memberAction({
      id: idp.id,
      action: 'update_chat_instructions',
      method: 'post',
      body: {
        chatInstructions: {
          content: values.chatInstructions,
        },
        locale: values.locale,
      },
      apiConfig: {},
      responseType: ChatInstructionsTR,
    }).then(() => {
      message.success(I18n.t('admin.chat_instructions_success'))
      fetch()
    }).catch(() => {

    })
  }

  const chatInstructions = Form.useWatch('chatInstructions', form)

  useEffect(() => {
    if (idp) {
      form.setFieldsValue({
        showChatInstructions: idp.showChatInstructions,
        chatInstructions: idp.chatInstructions.content,
      })
    }
  }, [])
  const onChange = async (value) => {
    try {
      form.setFieldsValue({
        showChatInstructions: value,
      })
      await updateResource({ id: idp.id, showChatInstructions: value })
    } catch (err) {
      message.error(err.base[0].title)
    }
  }
  return (
    <Flex vertical>

      <Form
        form={form}
        layout="vertical"
        initialValues={{
          showChatInstructions: idp.showChatInstructions,
          chatInstructions: idp.chatInstructions.content,
        }}
      >
        <Form.Item
          name="showChatInstructions"
          label="Enable Chat Instructions"
          initialValue="en"
        >
          <Switch
            checkedChildren="On"
            unCheckedChildren="Off"
            onChange={onChange}
          />
        </Form.Item>
        <Divider />
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
                          chatInstructions: res.chatInstructions.content,
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
                <Form.Item name="chatInstructions" noStyle />
                <Editor
                  content={chatInstructions || ''}
                  handleContentChange={(value) => {
                    form.setFieldValue('chatInstructions', value)
                  }}
                />

                {idp.chatInstructions.content && (
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
                              setHTMLContent(res.chatInstructions.content)
                            })
                          }}
                          defaultValue=""
                          className="mb8 mt8"
                          placeholder={I18n.t('select')}
                        >
                          <Select.Option value="">
                            {I18n.t('shared.none')}
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
            {I18n.t('common.actions.update')}
          </Button>
        </Space>
      </Form>
    </Flex>

  )
}

export default ChatInstructions
