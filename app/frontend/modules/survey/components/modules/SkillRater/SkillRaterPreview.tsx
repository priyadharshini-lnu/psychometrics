import {
  FC, useRef,
} from 'react'
import { Radio, RadioChangeEvent, Typography } from 'antd'
import { connect, ConnectedProps } from 'react-redux'
import cs from 'classnames'
import { RootState } from '~/modules/survey/core/rootReducers'
import { getI18n } from '~/modules/survey/core/preview/FlowProcessor/selectors'

import useForceUpdate from '~/hooks/useUpdate'

import { PreviewModel, NOT_APPLICABLE } from '~/modules/survey/interfaces/questions/SkillRater'

import styles from './SkillRaterPreview.less'

const connector = connect(({ preview }: RootState) => ({
  I18n: getI18n(preview),
}))

type PropsFromRedux = ConnectedProps<typeof connector>

interface OwnProps {
  model: PreviewModel
  readOnly: boolean
}

interface OwnProps {
  model: PreviewModel
  readOnly: boolean
  nextPage: () => {}
  singleQuestionFlow?: boolean
  focus: boolean
}
type Props = PropsFromRedux & OwnProps

const SkillRaterPreviewComponent: FC<Props> = ({
  model, readOnly, nextPage, singleQuestionFlow, focus,
}) => {
  const forceUpdate = useForceUpdate()
  const {
    result,
    props: {
      proficiencyLevels, skillName, skillDescription, notApplicableLabel, notApplicable,
    },
  } = model


  const handleChoiceChange = (event?: RadioChangeEvent) => {
    const value = event?.target?.value ?? ''
    const isMouseClick = event?.nativeEvent?.x && event?.nativeEvent?.y

    if (value === NOT_APPLICABLE) {
      result.notApplicable = true
      result.answers = []
      result.reduxAnswer()
    } else {
      result.notApplicable = false
      if (value.length !== 0) {
        result.answer(parseInt(value, 10))
      }
      result.reduxAnswer()
    }

    if (singleQuestionFlow && isMouseClick) {
      nextPage()
    }
    forceUpdate()
  }

  return (
    <TextChoices
      questionId={model.id}
      proficiencyLevels={proficiencyLevels || []}
      skillName={skillName}
      skillDescription={skillDescription}
      answers={result.answers}
      readOnly={readOnly}
      handleChoiceChange={handleChoiceChange}
      focusFirstInput={focus}
      notApplicableLabel={notApplicableLabel}
      notApplicable={result.notApplicable}
      notApplicableEnabled={notApplicable}
    />
  )
}

interface TextChoicesProps {
  questionId: number
  proficiencyLevels: PreviewModel['props']['proficiencyLevels']
  skillName: string
  skillDescription: string
  answers: PreviewModel['result']['answers']
  handleChoiceChange: (e: RadioChangeEvent) => void
  focusFirstInput: boolean
  readOnly?: boolean
  notApplicableLabel?: string
  notApplicable: boolean
  notApplicableEnabled?: boolean
}

const TextChoices: FC<TextChoicesProps> = ({
  questionId,
  proficiencyLevels,
  answers,
  skillName,
  skillDescription,
  handleChoiceChange,
  focusFirstInput,
  readOnly,
  notApplicableLabel,
  notApplicable,
  notApplicableEnabled,
}) => {
  const firstInputRef = useRef<HTMLInputElement>(null)

  if (focusFirstInput && firstInputRef.current) {
    firstInputRef.current.focus()
  }

  return (
    <>
      <Typography.Title className="fs-16" level={2}>{skillName}</Typography.Title>
      <p>{skillDescription}</p>
      <Radio.Group
        className={styles.radioGroup}
        disabled={readOnly}
        onChange={handleChoiceChange}
        value={notApplicable ? NOT_APPLICABLE : (answers.find(answer => answer.value)?.level ?? '')}
        options={[
          ...proficiencyLevels.map(proficiencyLevel => ({
            label: (
              <>
                <span
                  aria-hidden="true"
                  className={cs('fa fa-check', styles.checkIcon,
                    { [styles.buttonActive]: answers.find(answer => answer.value)?.level === proficiencyLevel.level })}
                />
                <label className="mb-0" htmlFor={`pf-level-${questionId}-${proficiencyLevel.level}`}>
                  {proficiencyLevel.name}
                </label>
                <span
                  className="font-normal"
                >
                  {` - ${proficiencyLevel.description}`}
                </span>
              </>
            ),
            value: proficiencyLevel.level,
            id: `pf-level-${questionId}-${proficiencyLevel.level}`,
          })),
          ...(notApplicableEnabled && notApplicableLabel ? [{
            label: (
              <>
                <span
                  aria-hidden="true"
                  className={cs('fa fa-check', styles.checkIcon,
                    { [styles.buttonActive]: notApplicable })}
                />
                <span
                  className="font-normal"
                >
                  {notApplicableLabel}
                </span>
              </>
            ),
            value: NOT_APPLICABLE,
            id: `not-applicable-${questionId}`,
          }] : []),
        ]}
      />
    </>
  )
}

export const SkillRaterPreview = connector(SkillRaterPreviewComponent)
