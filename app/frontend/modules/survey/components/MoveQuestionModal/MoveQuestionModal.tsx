import { useState, useMemo } from 'react'
import {
  Modal, Select, Radio, Button, Space,
} from 'antd'
import Utils from '~/modules/survey/utils'
import { Question } from './types'
import { PropsFromRedux } from './connect'

const { Option } = Select

type Props = PropsFromRedux

const { I18n } = window

export const MoveQuestionModal = ({
  currentQuestion,
  questions,
  blocks,
  onMove,
  onClose,
  visible,
}: Props) => {
  const [targetQuestionId, setTargetQuestionId] = useState<number | null>(null)
  const [position, setPosition] = useState<'before' | 'after'>('after')

  const questionToBlockMap = useMemo(() => {
    const map = new Map<number, number>()
    Object.values(blocks).forEach((block) => {
      block.questions.forEach((questionId) => {
        map.set(questionId, block.id)
      })
    })
    return map
  }, [blocks])

  const getBlockNameForQuestion = (question: Question) => {
    if (!blocks) {
      return ''
    }
    const blockId = questionToBlockMap.get(question.id)
    if (!blockId) {
      return ''
    }
    return blocks[blockId]?.name || ''
  }

  const formatQuestionDisplay = (question: Question) => {
    const blockName = getBlockNameForQuestion(question)
    const questionText = `${question.name} ${Utils.stripHTML(question.props?.questionText).substring(0, 24)}...`
    return blockName ? `${blockName} : ${questionText}` : questionText
  }

  const handleMove = () => {
    const targetQuestion = questions.find(q => q.id === targetQuestionId)
    onMove(currentQuestion, targetQuestion, position)
    onClose()
  }

  const handleCancel = () => {
    setTargetQuestionId(null)
    setPosition('after')
    onClose()
  }

  if (!currentQuestion) {
    return null
  }

  const getQuestionOptions = () => questions
    .map(q => ({
      value: q.id,
      label: formatQuestionDisplay(q),
    }))

  const questionOptions = getQuestionOptions()

  if (questionOptions.length === 0) {
    return null
  }

  return (
    <Modal
      title={I18n.t('administration.survey_builder.move_question.title')}
      open={visible}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          {I18n.t('administration.survey_builder.move_question.cancel')}
        </Button>,
        <Button
          key="move"
          type="primary"
          onClick={handleMove}
          disabled={!targetQuestionId}
        >
          {I18n.t('administration.survey_builder.move_question.move')}
        </Button>,
      ]}
      width={500}
    >
      <div style={{ padding: '16px 0' }}>
        <div style={{ marginBottom: 16 }}>
          <label style={{
            display: 'block',
            marginBottom: 8,
            fontWeight: 500,
          }}
          >
            {I18n.t('administration.survey_builder.move_question.moveQuestion',
              { question: formatQuestionDisplay(currentQuestion) })}
          </label>
          <Select
            placeholder={I18n.t('administration.survey_builder.move_question.selectTargetQuestion')}
            value={targetQuestionId}
            onChange={(value: number) => setTargetQuestionId(value)}
            style={{ width: '100%' }}
          >
            {questionOptions.map(option => (
              <Option key={`option-${option.value}`} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        </div>

        <div>
          <label style={{
            display: 'block',
            marginBottom: 8,
            fontWeight: 500,
          }}
          >
            {I18n.t('administration.survey_builder.move_question.position')}
          </label>
          <Radio.Group
            value={position}
            onChange={e => setPosition(e.target.value)}
          >
            <Space direction="vertical">
              <Radio value="before">{I18n.t('administration.survey_builder.move_question.moveBefore')}</Radio>
              <Radio value="after">{I18n.t('administration.survey_builder.move_question.moveAfter')}</Radio>
            </Space>
          </Radio.Group>
        </div>
      </div>
    </Modal>
  )
}
