import {
  FC, useState, useRef,
} from 'react'
import {
  Form, Radio, Input, Select, FormInstance, GetProp, FormProps,
} from 'antd'
import { Store } from 'antd/es/form/interface'
import { getLanguageNameFromCode } from '~/utils/locales'

import styles from './Questionnaire.less'

type ValidateMessages = GetProp<FormProps, 'validateMessages'>

type Props = {
  allowedLanguages: string[],
  allowLanguagePreference?: boolean,
  allowNeurodiversity?: boolean,
  formInstance: FormInstance
  initialValues?: Store |undefined
  onFormFinish?: (values: Store) => void
}

const { I18n } = window

export const Questionnaire: FC<Props> = ({
  allowedLanguages, allowLanguagePreference, allowNeurodiversity, formInstance, initialValues, onFormFinish,
}) => {
  const [, setFields] = useState({})
  const showLangDropdownInitially = useRef(initialValues?.language || false)
  const showNeuroCommentBoxInitially = useRef(initialValues?.neurodivergent || false)

  const handleFieldsChange = (_, allFields) => {
    showLangDropdownInitially.current = false
    showNeuroCommentBoxInitially.current = false
    setFields(allFields)
  }

  const handleLanguagePreference = (value) => {
    if (value) {
      formInstance.setFieldsValue({
        preferredLanguage: initialValues?.preferredLanguage || null,
      })
    }
  }

  return (
    <Form
      layout="vertical"
      className={styles.form}
      form={formInstance}
      onFieldsChange={handleFieldsChange}
      initialValues={initialValues}
      onFinish={onFormFinish}
      validateMessages={{
        required: (name) => {
          switch (name) {
            case 'neurodivergentComments': return I18n.t('frontend.bookings.comments_required_msg')
            case 'preferredLanguage': return I18n.t('frontend.bookings.language_required_msg')
            default: return I18n.t('frontend.bookings.default_requires_msg', { name })
          }
        },
      } as ValidateMessages}
    >
      {allowLanguagePreference ? (
        <>
          <Form.Item name="language" label={I18n.t('frontend.bookings.language_preference_question')}>
            <Radio.Group
              onChange={handleLanguagePreference}
            >
              <Radio
                aria-description={I18n.t('frontend.bookings.language_preference_question')}
                value
              >
                {I18n.t('frontend.bookings.buttons.yes_text')}
              </Radio>
              <Radio
                aria-description={I18n.t('frontend.bookings.language_preference_question')}
                value={false}
              >
                {I18n.t('frontend.bookings.buttons.no_text')}
              </Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item
            noStyle
            dependencies={['language']}
          >
            {({ getFieldValue }) => (
              getFieldValue('language') ? (
                <Form.Item name="preferredLanguage" rules={[{ required: true }]}>
                  <Select
                    aria-label={I18n.t('frontend.bookings.language_placeholder')}
                    placeholder={I18n.t('frontend.bookings.language_placeholder')}
                  >
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
              ) : null
            )}
          </Form.Item>
        </>
      ) : null}
      {allowNeurodiversity ? (
        <>
          <Form.Item name="neurodivergent" label={I18n.t('frontend.bookings.neurodivergence_question')}>
            <Radio.Group>
              <Radio
                aria-description={I18n.t('frontend.bookings.neurodivergence_question')}
                value
              >
                {I18n.t('frontend.bookings.buttons.yes_text')}
              </Radio>
              <Radio
                value={false}
                aria-description={I18n.t('frontend.bookings.neurodivergence_question')}
              >
                {I18n.t('frontend.bookings.buttons.no_text')}
              </Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item noStyle dependencies={['neurodivergent']}>
            {({ getFieldValue }) => (getFieldValue('neurodivergent') ? (
              <Form.Item
                rules={[{ required: true }]}
                name="neurodivergentComments"
              >
                <Input.TextArea
                  aria-label={I18n.t('frontend.bookings.neurodivergence_comment_aria_label')}
                  rows={4}
                  placeholder={I18n.t('frontend.bookings.neurodivergence_comment_placeholder')}
                />
              </Form.Item>
            ) : null)}
          </Form.Item>
        </>
      ) : null}
    </Form>
  )
}
