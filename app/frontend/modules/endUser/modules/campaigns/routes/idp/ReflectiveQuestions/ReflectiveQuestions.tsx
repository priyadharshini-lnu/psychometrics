import _ from 'lodash'
import { FC, useState, useContext } from 'react'
import {
  Typography, Layout, Button, Flex,
  message, Space, Form, Empty,
} from 'antd'
import {
  useSelector,
} from 'react-redux'
import cs from 'classnames'
import { Separator } from '~/components/IdpShared/Separator'
import {
  PageLoadSpinner, ButtonWithArrow, BackButton, MediaQueryContext,
} from '~/glint'
import { RootState } from '~/modules/endUser/core/rootReducers'
import styles from './ReflectiveQuestions.less'
import Editor from './Editor'
import { USER_IDP_PLAN_STATUS } from '~/components/IdpShared/constants'
import { useReflectiveQuestions } from './useReflectiveQuestions'

const { I18n } = window

interface CurrentUser {
  id: string
}

interface Props {
  onSave?: () => void
  showSkip?: boolean
  onSkip?: () => void
  prev?: () => void
}

export const ReflectiveQuestions: FC<Props> = ({
  onSave, showSkip, onSkip, prev,
}) => {
  const status = useSelector<RootState>(state => state.campaigns.idp.status)
  const currentUser = useSelector<RootState>(state => state.currentUser) as CurrentUser
  const {
    reflectionQuestions, validateAnswer, updateReflectionQuestions, onChange, answers, errors,
  } = useReflectiveQuestions()

  const { isMobile } = useContext(MediaQueryContext)


  const [currentReflectionQuestionIndex, setCurrentReflectionQuestionIndex] = useState(0)

  const onSubmit = async () => {
    if (!validateAnswer(currentReflectionQuestion)) {
      return
    }
    if (currentReflectionQuestionIndex < reflectionQuestions.length - 1) {
      setCurrentReflectionQuestionIndex(currentReflectionQuestionIndex + 1)
    } else {
      try {
        await updateReflectionQuestions({
          userId: currentUser.id,
          reflectionQuestions: _.map(answers, (answer, questionId) => ({
            id: questionId,
            answer: answer.content,
          })),
        }).unwrap()
        message.success(I18n.t('idp.reflective_questions.updated_successfully'))
        onSave && onSave()
      } catch (error) {
        message.error(error?.data?.error || I18n.t('idp.reflective_questions.update_failed'))
      }
    }
  }

  if (!status) {
    return <PageLoadSpinner size="large" />
  }

  if (status && reflectionQuestions.length === 0) {
    return <Empty description={I18n.t('idp.reflective_questions.no_reflective_questions')} />
  }

  const currentReflectionQuestion = reflectionQuestions[currentReflectionQuestionIndex]
  return (
    <Layout.Content className={styles.pageContent}>
      <Flex gap={4} vertical={isMobile} className="mb-4" justify="space-between" align="middle">
        <Space>
          <BackButton
            onPrev={prev}
          />
          <Typography.Title level={3} className="mb-0 mt-0">
            {I18n.t('idp.reflective_questions.title')}
          </Typography.Title>
        </Space>

        {showSkip && (
          <Space className="self-end">
            <div className="flex justify-center">
              <ButtonWithArrow
                label={I18n.t('idp.reflective_questions.answer_later')}
                onClick={() => onSkip?.()}
              />
            </div>
          </Space>
        )}
      </Flex>
      <Separator
        className="mb-4 mt-0"
      />

      <div className={cs(styles.questionsBox, 'mt-4', isMobile && 'mb-8')}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <ReflectiveQuestion
            key={currentReflectionQuestion.id}
            status={status}
            question={currentReflectionQuestion}
            value={answers[currentReflectionQuestion.id]?.content || ''}
            error={errors[currentReflectionQuestion.id]}
            index={currentReflectionQuestionIndex}
            total={reflectionQuestions.length}
            onChange={(content, wordsCount) => onChange(currentReflectionQuestion.id, content, wordsCount)}
          />
        </Space>
        <Flex flex={1} justify="space-between">
          <Button
            size="small"
            className="items-start"
            disabled={currentReflectionQuestionIndex === 0}
            onClick={() => setCurrentReflectionQuestionIndex(currentReflectionQuestionIndex - 1)}
          >
            {I18n.t('idp.initial_steps.back')}
          </Button>
          <ButtonWithArrow
            label={currentReflectionQuestionIndex < reflectionQuestions.length - 1
              ? I18n.t('idp.initial_steps.next')
              : I18n.t('common.actions.submit')}
            size="small"
            type="primary"
            className="items-end self-end"
            onClick={onSubmit}
          />
        </Flex>
      </div>
    </Layout.Content>
  )
}

const ReflectiveQuestion = ({
  question, value, onChange, error, status, index, total,
}) => (
  <Flex vertical flex={1}>
    <Space direction="vertical">
      <Space className={cs(styles.questionCounter, 'mb-4')}>
        {`Question ${index + 1} of ${total}`}
      </Space>
      <Typography.Text strong>
        {question.question}
        {question.mandatory && <span className={cs(styles.mandatory, 'mlx')}>*</span>}
      </Typography.Text>
      <Form.Item
        validateStatus="error"
        help={error ? error.join(' ') : undefined}
        className={cs(styles.questionInput, { [styles.withError]: error?.length })}
      >
        <Editor content={value} handleContentChange={onChange} readOnly={status === USER_IDP_PLAN_STATUS.COMPLETED} />
      </Form.Item>

      <Flex justify="start" className="mb-4">
        {I18n.t('idp.reflective_questions.word_limit', { min: question.minWords, max: question.maxWords })}
      </Flex>
    </Space>
  </Flex>
)
