import { FC, useState } from 'react'
import {
  Form, Radio, Input, Select, FormInstance,
} from 'antd'
import { Store } from 'antd/lib/form/interface'
import styles from './Questionnaire.less'

type Props = {
  languages: string[],
  languagePreference?: boolean,
  neuroDivergent?: boolean,
  formInstance: FormInstance
  initialValues?: Store |undefined
}

export const Questionnaire: FC<Props> = ({
  languages, languagePreference, neuroDivergent, formInstance, initialValues,
}) => {
  const [, setFields] = useState({})
  return (
    <Form
      layout="vertical"
      className={styles.form}
      form={formInstance}
      onFieldsChange={(_, allFields) => {
        setFields(allFields)
      }}
      initialValues={initialValues}
    >
      {languagePreference ? (
        <Form.Item name="language" label="Do you have a language preference?">
          <Radio.Group>
            <Radio value>Yes</Radio>
            <Radio value={false}>No</Radio>
          </Radio.Group>
        </Form.Item>
      ) : null}
      {formInstance.getFieldValue('language') ? (
        <Form.Item name="preferredLanguage">
          <Select defaultValue="English">
            {languages.map(lang => <Select.Option key={lang}>{lang}</Select.Option>)}
          </Select>
        </Form.Item>
      ) : null}
      {neuroDivergent ? (
        <Form.Item name="neurodivergent" label="Are you neurodivergent?">
          <Radio.Group>
            <Radio value>Yes</Radio>
            <Radio value={false}>No</Radio>
          </Radio.Group>
        </Form.Item>
      ) : null}
      {formInstance.getFieldValue('neurodivergent') ? (
        <Form.Item name="neurodivergentComment">
          <Input.TextArea rows={4} placeholder="Your comments" />
        </Form.Item>
      ) : null}
    </Form>
  )
}
