import { FC, useState } from 'react'
import {
  Form, Radio, Input, Select, FormInstance,
} from 'antd'
import { Store } from 'antd/lib/form/interface'

import { getLanguageNameFromCode } from '~/utils/locales'

import styles from './Questionnaire.less'

type Props = {
  allowedLanguages: string[],
  allowLanguagePreference?: boolean,
  allowNeurodiversity?: boolean,
  formInstance: FormInstance
  initialValues?: Store |undefined
}

export const Questionnaire: FC<Props> = ({
  allowedLanguages, allowLanguagePreference, allowNeurodiversity, formInstance, initialValues,
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
      {allowLanguagePreference ? (
        <>
          <Form.Item name="language" label="Do you have a language preference?">
            <Radio.Group>
              <Radio value>Yes</Radio>
              <Radio value={false}>No</Radio>
            </Radio.Group>
          </Form.Item>
          <>
            {formInstance.getFieldValue('language') || initialValues?.language ? (
              <Form.Item rules={[{ required: true }]} name="preferredLanguage">
                <Select>
                  {allowedLanguages.map(lang => (
                    <Select.Option
                      value={lang}
                      key={lang}
                    >
                      {getLanguageNameFromCode(lang)}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            ) : null}
          </>
        </>
      ) : null}

      {allowNeurodiversity ? (
        <>
          <Form.Item name="neurodivergent" label="Are you neurodivergent?">
            <Radio.Group>
              <Radio value>Yes</Radio>
              <Radio value={false}>No</Radio>
            </Radio.Group>
          </Form.Item>
          <>
            {formInstance.getFieldValue('neurodivergent') || initialValues?.neurodivergent ? (
              <Form.Item rules={[{ required: true }]} name="neurodivergentComments">
                <Input.TextArea rows={4} placeholder="Your comments" />
              </Form.Item>
            ) : null}
          </>
        </>
      ) : null}
    </Form>
  )
}
