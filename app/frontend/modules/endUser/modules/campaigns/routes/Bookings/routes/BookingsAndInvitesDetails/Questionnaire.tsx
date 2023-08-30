import {
  FC, useState, useRef,
} from 'react'
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
  const showLangDropdownInitially = useRef(initialValues?.language || false)
  const showNeuroCommentBoxInitially = useRef(initialValues?.neurodivergent || false)

  const handleFieldsChange = (_, allFields) => {
    showLangDropdownInitially.current = false
    showNeuroCommentBoxInitially.current = false
    setFields(allFields)
  }

  // TODO: i18n
  // eslint-disable-next-line max-len
  const neurodivergenceQuestion = 'Do you require any reasonable accommodations or adjustments due to special needs or disabilities to fully participate in the assessment?'

  return (
    <Form
      layout="vertical"
      className={styles.form}
      form={formInstance}
      onFieldsChange={handleFieldsChange}
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
            {formInstance.getFieldValue('language') || showLangDropdownInitially.current ? (
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
          <Form.Item name="neurodivergent" label={neurodivergenceQuestion}>
            <Radio.Group>
              <Radio value>Yes</Radio>
              <Radio value={false}>No</Radio>
            </Radio.Group>
          </Form.Item>
          <>
            {formInstance.getFieldValue('neurodivergent') || showNeuroCommentBoxInitially.current ? (
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
