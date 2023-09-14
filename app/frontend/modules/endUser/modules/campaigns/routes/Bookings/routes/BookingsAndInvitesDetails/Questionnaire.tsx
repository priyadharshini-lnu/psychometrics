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

const { I18n } = window

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
          <Form.Item name="language" label={I18n.t('frontend.bookings.language_preference_question')}>
            <Radio.Group>
              <Radio value>{I18n.t('frontend.bookings.buttons.yes_text')}</Radio>
              <Radio value={false}>{I18n.t('frontend.bookings.buttons.no_text')}</Radio>
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
          <Form.Item name="neurodivergent" label={I18n.t('frontend.bookings.neurodivergence_question')}>
            <Radio.Group>
              <Radio value>{I18n.t('frontend.bookings.buttons.yes_text')}</Radio>
              <Radio value={false}>{I18n.t('frontend.bookings.buttons.no_text')}</Radio>
            </Radio.Group>
          </Form.Item>
          <>
            {formInstance.getFieldValue('neurodivergent') || showNeuroCommentBoxInitially.current ? (
              <Form.Item rules={[{ required: true }]} name="neurodivergentComments">
                <Input.TextArea
                  rows={4}
                  placeholder={I18n.t('frontend.bookings.neurodivergence_comment_placeholder')}
                />
              </Form.Item>
            ) : null}
          </>
        </>
      ) : null}
    </Form>
  )
}
