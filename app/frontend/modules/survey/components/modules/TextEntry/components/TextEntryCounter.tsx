import { FC } from 'react'
import {
  Col, Row, Typography, Tooltip, Badge, Space,
} from 'antd'
import isEmpty from 'lodash/isEmpty'
import wordsCount from 'words-count'
import { InfoCircleOutlined } from '~/glint/icons/AccessibleIconsAntDesign'

import { I18n } from '~/modules/survey/store/StoreWatchman'

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  model: any
}

export const TextEntryCounter: FC<Props> = ({ model }) => {
  const validationType: string = model?.validation?.type ?? ''
  const validationArgs: Record<string, number> = model?.validation?.args ?? {}

  const characterTypes = ['MinLength', 'MaxLength', 'CharacterRange']
  const wordTypes = ['MinWords', 'MaxWords', 'WordsRange']

  const translationKey = wordTypes.includes(validationType)
    ? 'word'
    : 'character'

  if (
    ![...characterTypes, ...wordTypes].includes(validationType)
    || isEmpty(validationArgs)
  ) {
    return null
  }

  const answer: string = model?.result?.answers?.[0]?.value ?? ''
  const answerCount: number = characterTypes.includes(validationType)
    ? answer?.trim()?.length
    : wordsCount(answer)

  const label = characterTypes.includes(validationType)
    ? I18n().t('validations.character_count')
    : I18n().t('validations.word_count')

  const checkIfAnswerIsInLimit = (
    answerCount: number,
    validationType: string,
    validationArgs: Record<string, number>,
  ): boolean => {
    let isInLimit = true
    switch (validationType) {
      case 'MinLength':
      case 'MinWords': {
        if (answerCount < validationArgs.minLength) {
          isInLimit = false
        }
        break
      }

      case 'MaxLength':
      case 'MaxWords': {
        if (answerCount > validationArgs.maxLength) {
          isInLimit = false
        }
        break
      }

      case 'WordsRange':
      case 'CharacterRange': {
        if (
          answerCount < validationArgs.minLength
          || answerCount > validationArgs.maxLength
        ) {
          isInLimit = false
        }
        break
      }

      default:
        break
    }

    return isInLimit
  }

  const isAnswerInLimit = checkIfAnswerIsInLimit(
    answerCount,
    validationType,
    validationArgs,
  )

  let tooltipText = ''
  if (validationArgs.minLength && validationArgs.maxLength) {
    tooltipText = I18n().t(`validations.${translationKey}_range`, {
      min: validationArgs.minLength,
      max: validationArgs.maxLength,
    })
  } else if (validationArgs.minLength) {
    tooltipText = I18n().t(`validations.min_${translationKey}`, {
      min: validationArgs.minLength,
    })
  } else if (validationArgs.maxLength) {
    tooltipText = I18n().t(`validations.max_${translationKey}`, {
      max: validationArgs.maxLength,
    })
  }

  return (
    <Row className="mt-2" justify="center">
      <Col span={12} offset={12} className="ta-e">
        <Space>
          <Tooltip title={tooltipText}>
            <InfoCircleOutlined />
          </Tooltip>
          <Typography.Text>{label}</Typography.Text>
          <Badge
            count={answerCount}
            overflowCount={Number.MAX_SAFE_INTEGER}
            showZero
            style={{
              backgroundColor: isAnswerInLimit ? 'transparent' : '#f5222d',
              color: isAnswerInLimit ? '#222222' : 'white',
            }}
          />
        </Space>
      </Col>
    </Row>
  )
}
