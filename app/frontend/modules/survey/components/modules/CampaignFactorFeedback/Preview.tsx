import React, { FC, useRef } from 'react'
import _ from 'lodash'
import {
  Space, Select, Input, Form, Button,
} from 'antd'
import { connect, ConnectedProps } from 'react-redux'
import { MinusCircleOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { PreviewModel } from '~/modules/survey/interfaces/questions/CampaignFactorFeedback'
import useForceUpdate from '~/hooks/useUpdate'
import { SafeHTML } from '~/components/SafeHTML'
import { RootState } from '~/modules/survey/core/rootReducers'
import { getI18n } from '~/modules/survey/core/preview/FlowProcessor/selectors'
import styles from './Preview.less'

const connector = connect(({ preview }:RootState) => ({ I18n: getI18n(preview) }), {})

interface OwnProps {
  model: PreviewModel
  readOnly: boolean
  campaignFactorList: { code: string, name: string }[]
}


type PropsFromRedux = ConnectedProps<typeof connector>

type Props = PropsFromRedux & OwnProps

const PreviewComponent:FC<Props> = ({
  model, I18n, campaignFactorList, readOnly,
}) => {
  const { result, id } = model
  const [form] = Form.useForm()
  const initialFormItemsRef = useRef(result.answers.length ? result.answers : _.times(+model.props.minFactors, () => (
    { code: '', value: '' })))
  const forceUpdate = useForceUpdate()
  const { validation } = model

  const handleFiedlsChange = () => {
    result.answer(form.getFieldsValue().factors)
    forceUpdate()
  }

  return (
    <div>
      <SafeHTML
        html={I18n.tQuestion(model, 'questionText')}
        config="adminRichText"
      />
      <Form
        form={form}
        labelAlign="left"
        initialValues={{ factors: initialFormItemsRef.current }}
        onFieldsChange={handleFiedlsChange}
        className="mt-4"
        labelWrap={false}
        rootClassName={styles.form}
        disabled={readOnly}
        colon={false}
      >
        <Form.List
          name="factors"
        >
          {(fields, { add, remove }) => {
            const showAddButton = fields.length < +model.props.maxFactors && !readOnly
            return (
              <Form.Item>
                {fields.map((field, index) => (
                  <React.Fragment key={`${id}-field.name-${index}`}>
                    <Space size="large" align="start" className="w-100" direction="horizontal">
                      <Space size={0} className="w-100" direction="vertical">
                        <label>
                          <Space>
                            <SafeHTML
                              html={getSkillLabelText(model.props.skillLabel
                                || 'Skill {{index}}', { index: index + 1 })}
                              config="adminRichText"
                            />
                            {index >= +model.props.minFactors && !readOnly
                              ? (
                                <Button
                                  aria-description="remove"
                                  danger
                                  onClick={() => remove(index)}
                                  type="link"
                                  icon={<MinusCircleOutlined aria-label="" />}
                                />
                              )
                              : null}
                          </Space>
                        </label>
                        <Form.Item
                          label={(
                            <SafeHTML
                              html={model.props.factorLabel
                              || I18n.t('frontend.questions.campaign_factor_feedback.skill_factor')}
                              config="adminRichText"
                            />
                          )}
                          className="mb-2"
                          name={[field.name, 'code']}
                        >
                          <Select
                            showSearch
                            className={styles.formItem}
                            options={campaignFactorList.map(factor => ({ label: factor.name, value: factor.code }))}
                            value={(result.answers[index] && result.answers[index].code)}
                          />
                        </Form.Item>
                        <Form.Item
                          label={(
                            <SafeHTML
                              html={model.props.feedbackLabel
                                || I18n.t('frontend.questions.campaign_factor_feedback.feedback')}
                              config="adminRichText"
                            />
                        )}
                          name={[field.name, 'value']}
                        >
                          <Input.TextArea
                            className={styles.formItem}
                            value={(result.answers[index] && result.answers[index].value) || ''}
                            autoSize={{ minRows: 2, maxRows: 6 }}
                            maxLength={validation.type === 'MaxLength' ? +validation.args.maxLength : undefined}
                          />
                        </Form.Item>
                      </Space>

                    </Space>
                  </React.Fragment>
                ))}
                {showAddButton
                  ? (
                    <Button onClick={() => add({ code: '', value: '' })}>
                      {I18n.t('frontend.questions.campaign_factor_feedback.add_skill')}
                    </Button>
                  ) : null}
              </Form.Item>
            )
          }}
        </Form.List>

      </Form>
    </div>
  )
}

const getSkillLabelText = (text: string, data: object) => {
  const key = Object.keys(data)[0]
  return text.replaceAll(`{{${key}}}`, data[key])
}

export const Preview = connector(PreviewComponent)
