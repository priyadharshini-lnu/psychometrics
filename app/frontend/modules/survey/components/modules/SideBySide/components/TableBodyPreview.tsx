import { Component, FC, Fragment } from 'react'
import {
  Space,
  Popover,
  Typography,
  Input,
  Radio,
  Checkbox,
  Select,
  Row,
  Col,
} from 'antd'
import cs from 'classnames'
import { InfoCircleOutlined } from '~/glint/icons/AccessibleIconsAntDesign'

import { PreviewModel, TextType } from '~/modules/survey/interfaces/questions/SideBySide'
import { I18nInterface } from '~/modules/survey/core/preview/FlowProcessor/interfaces'

import styles from '../styles.less'

interface Props {
  model: PreviewModel
  readOnly: boolean
  I18n: I18nInterface
}

export class TableBodyPreview extends Component<Props> {
  handleAnswerChange = (
    scale: number,
    choice: number,
    answer: number | null,
    valueInStringFormat: string,
    valueInBooleanFormat: boolean | undefined = undefined,
  ) => {
    const { model } = this.props

    model.result.answer(
      scale,
      choice,
      answer,
      valueInStringFormat,
      valueInBooleanFormat,
    )
    this.forceUpdate()
  }

  renderHeaders (index: number | undefined) {
    const {
      model,
      model: { props, moduleConfig },
      I18n,
    } = this.props
    const data = props.columnsData
    const length = props.choices
    const none = props.repeatHeaders === 'None'
    const middle = props.repeatHeaders === 'Middle'
    const bottom = props.repeatHeaders === 'Bottom'
    const both = props.repeatHeaders === 'Both'
    const last = typeof index === 'undefined'

    if (bottom || both) {
      if (bottom && !last) {
        return
      }
      if (both) {
        if (!last && index !== Math.ceil(length / 2)) {
          return
        }
      }
    } else {
      if (index === 0 || none) {
        return
      }
      if (middle && index !== Math.ceil(length / 2)) {
        return
      }
    }

    return (
      <tr className={styles.answersRow}>
        <td
          className={`${styles.header} ${styles.column} ${styles.firstColumn} ps-2 pe-2 pt-2 pb-2`}
        />
        {Array.from({ length: props.scalePoints }, (_, i) => (
          <td
            key={i}
            className={cs(styles.column, 'ps-2 pe-2 pt-2 pb-2', {
              invisible: data[i].isHeaderHidden,
            })}
          >
            {!data[i].isHeaderHidden && (
              <div className={styles.answers}>
                {Array.from({ length: data[i].answers }, (_, j) => (
                  <div className={styles.answer} key={j}>
                    <span>
                      {I18n.tQuestion(model, `answersTexts${j + 1}_${i + 1}`, {
                        answer: j,
                        group: i,
                      }) || moduleConfig.defaultAnswerText(j + 1)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </td>
        ))}
      </tr>
    )
  }

  render () {
    const {
      model,
      model: { props, moduleConfig },
      I18n,
      readOnly,
    } = this.props
    const {
      columnsData: data,
      hideHeaders,
      isRowDescriptionEnabled,
      rowDescriptions,
    } = props

    return (
      <tbody>
        {Array.from({ length: props.choices }, (_, choice) => (
          <Fragment key={choice}>
            {!hideHeaders && this.renderHeaders(choice)}
            <tr className={styles.mainRow} key={choice}>
              <td className={`${styles.firstColumn} ps-2 pe-2 pt-2 pb-2`}>
                <Space orientation="horizontal">
                  {I18n.tQuestion(model, `choicesTexts${choice + 1}`, {
                    choice,
                  }) || moduleConfig.defaultChoiceText(choice + 1)}
                  {isRowDescriptionEnabled
                    && rowDescriptions[choice]
                    && rowDescriptions[choice].length !== 0 && (
                      <Popover
                        content={(
                          <Typography.Paragraph style={{ maxWidth: '25rem' }}>
                            {I18n.tQuestion(model, `rowDescriptions${choice + 1}`, {
                              choice,
                            })}
                          </Typography.Paragraph>
                        )}
                        arrow={{ pointAtCenter: true }}
                      >
                        <InfoCircleOutlined />
                      </Popover>
                  )}
                </Space>
              </td>
              {Array.from({ length: props.scalePoints }, (_, scalePoint) => {
                const isDropdown = data[scalePoint].type === 'Likert'
                  && data[scalePoint].likertType === 'DropDown'
                return (
                  <td
                    key={scalePoint}
                    className={`${styles.column} ps-2 pe-2 pt-2 pb-2`}
                  >
                    <Row
                      wrap={false}
                      className={`${styles.inputs} ${
                        isDropdown ? styles.dropdowns : ''
                      }`}
                    >
                      {isDropdown ? (
                        <DropdownTypeField
                          columnData={data[scalePoint]}
                          answers={model.result.answers}
                          scale={scalePoint}
                          choice={choice}
                          readOnly={readOnly}
                          I18n={I18n}
                          model={model}
                          moduleConfig={moduleConfig}
                          onChange={this.handleAnswerChange}
                        />
                      ) : (
                        Array.from(
                          { length: data[scalePoint].answers },
                          (_, index) => (
                            <Col span={Math.round(24 / data[scalePoint].answers)} className={styles.input} key={index}>
                              <InputTypeFields
                                columnData={data[scalePoint]}
                                answers={model.result.answers}
                                scale={scalePoint}
                                choice={choice}
                                index={index}
                                readOnly={readOnly}
                                onChange={this.handleAnswerChange}
                              />
                            </Col>
                          ),
                        )
                      )}
                    </Row>
                  </td>
                )
              })}
            </tr>
          </Fragment>
        ))}
        {this.renderHeaders(undefined)}
      </tbody>
    )
  }
}

type HandleAnswerChange = (
  scale: number,
  choice: number,
  answer: number | null,
  valueInStringFormat: string,
  valueInBooleanFormat?: boolean | undefined
) => void

interface InputTypeFieldsProps {
  columnData: PreviewModel['props']['columnsData'][0]
  answers: PreviewModel['result']['answers']
  scale: number
  choice: number
  index: number
  readOnly: boolean
  onChange: HandleAnswerChange
}

const InputTypeFields: FC<InputTypeFieldsProps> = ({
  columnData,
  answers,
  scale,
  choice,
  index,
  readOnly,
  onChange,
}) => {
  let defaultAnswer: string | boolean = columnData.type === 'Likert'
    && (columnData.likertType === 'SingleAnswer'
      || columnData.likertType === 'MultipleAnswer')
    ? false
    : ''

  const answerInRowOfGroup = answers.find(
    answer => answer.scale === scale && answer.choice === choice,
  )
  if (answerInRowOfGroup !== undefined) {
    const answerInField = answerInRowOfGroup.values.find(
      answerInRowOfGroup => answerInRowOfGroup.index === index,
    )
    if (answerInField !== undefined) {
      defaultAnswer = answerInField.value
    }
  }

  if (columnData.type === 'Text') {
    if (columnData.textType === TextType.Essay) {
      return (
        <Input.TextArea
          disabled={readOnly}
          defaultValue={defaultAnswer as string}
          onBlur={event => onChange(scale, choice, index, event.target.value)}
        />
      )
    }

    if (
      [TextType.Short, TextType.Medium, TextType.Long].includes(columnData.textType)
    ) {
      return (
        <Input
          disabled={readOnly}
          defaultValue={defaultAnswer as string}
          onBlur={event => onChange(scale, choice, index, event.target.value)}
        />
      )
    }
  }

  if (columnData.type === 'Likert') {
    if (columnData.likertType === 'SingleAnswer') {
      return (
        <Radio
          disabled={readOnly}
          checked={(defaultAnswer as boolean) || false}
          onChange={event => onChange(scale, choice, index, '', event.target.checked)
          }
        />
      )
    }

    if (columnData.likertType === 'MultipleAnswer') {
      return (
        <Checkbox
          disabled={readOnly}
          checked={(defaultAnswer as boolean) || false}
          onChange={event => onChange(scale, choice, index, '', event.target.checked)
          }
        />
      )
    }
  }

  return null
}

interface DropdownTypeFieldProps {
  columnData: PreviewModel['props']['columnsData'][0]
  answers: PreviewModel['result']['answers']
  I18n: I18nInterface
  moduleConfig: PreviewModel['moduleConfig']
  readOnly: boolean
  model: PreviewModel
  scale: number
  choice: number
  onChange: HandleAnswerChange
}

const DropdownTypeField: FC<DropdownTypeFieldProps> = ({
  columnData,
  scale,
  choice,
  answers,
  I18n,
  moduleConfig,
  model,
  readOnly,
  onChange,
}) => {
  let defaultAnswer = ''

  const answerInRowOfGroup = answers.find(
    answer => answer.scale === scale && answer.choice === choice,
  )
  if (answerInRowOfGroup !== undefined) {
    defaultAnswer = answerInRowOfGroup?.values?.[0]?.value as string
  }

  const emptySelectOption = {
    label: '', value: '', data: null, key: '',
  }
  const selectOptions = Array.from(
    { length: columnData.answers },
    (_, answerOptionIndex) => ({
      label:
        I18n.tQuestion(
          model,
          `answersTexts${scale + 1}_${answerOptionIndex + 1}`,
          {
            answer: answerOptionIndex,
            group: scale,
          },
        ) || moduleConfig.defaultAnswerText(answerOptionIndex + 1),
      value: answerOptionIndex,
      data: null,
      key: answerOptionIndex,
    }),
  )

  const searchFilterOptions = (
    searchValue: string,
    option: { label: string; value: string; data: null; key: string; },
  ): boolean => {
    const optionLabel = option?.label ?? ''
    if (`${optionLabel}`.toLowerCase().search(searchValue.toLowerCase()) !== -1) {
      return true
    }
    return false
  }

  return (
    <Select
      disabled={readOnly}
      size="middle"
      className="w-100"
      showSearch
      value={defaultAnswer}
      options={[emptySelectOption, ...selectOptions]}
      filterOption={searchFilterOptions}
      onChange={selected => onChange(scale, choice, null, selected as string)}
    />
  )
}

export default TableBodyPreview
