import {
  useState, useEffect,
} from 'react'
import {
  Row, Col, Typography, Select, Form, Flex, FormInstance,
} from 'antd'
import Editor from '~/components/Editor'
import { useResourceContext } from '~/modules/admin/components/Resource'
import {
  Idp, IntroMessageTR,
} from '~/modules/admin/modules/client/core/idp'
import { SafeHTML } from '~/components/SafeHTML'

const { I18n } = window

export const IntroMessage = ({
  form,
  idp,
}:{
idp:Idp,
form: FormInstance
}) => {
  const [referenceLocale, setReferenceLocale] = useState('')
  const [htmlContent, setHTMLContent] = useState('')
  const { resource } = useResourceContext<Idp>()
  const { availableLocales } = I18n

  const fetchInstructionsBasedOnLanguage = (lang, callback) => {
    resource.collectionAction({
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

  const instructions = Form.useWatch('instructions', form)

  useEffect(() => {
    if (idp) {
      form.setFieldsValue({
        instructions: idp.instructions.content,
      })
    }
  }, [])

  if (!idp) return <></>
  return (
    <Row>
      <Col span={24}>
        <div className="display-flex justify-content-space-between mt8">
          <Form.Item
            name="locale"
            label={I18n.t('administration.idp.locales')}
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
                    {I18n.t('administration.idp.reference_locale')}
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
  )
}
