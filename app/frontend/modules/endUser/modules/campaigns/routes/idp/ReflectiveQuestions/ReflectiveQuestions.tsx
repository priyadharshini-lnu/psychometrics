import _ from 'lodash'
import { FC, useState } from 'react'
import {
  Typography, Layout, Button, Flex,
  message, Space, Form,
} from 'antd'
import {
  useSelector,
} from 'react-redux'
import cs from 'classnames'
import { PageLoadSpinner, BoxWithShadow, ButtonWithArrow } from '~/glint'
import {
  useUpdateReflectionQuestionsMutation,
} from '~/modules/endUser/modules/campaigns/core/idp/api'
import { ReflectionQuestion } from '~/modules/endUser/modules/campaigns/core/idp/interfaces'
import { RootState } from '~/modules/endUser/core/rootReducers'
import styles from './ReflectiveQuestions.less'
import Editor from './Editor'
import { useAppSelector } from '~/modules/endUser/store/hooks'

const { I18n } = window

interface CurrentUser {
  id: string
}

interface Props {
  onSave?: () => void
  showSkip?: boolean
  onSkip?: () => void
}

export const ReflectiveQuestions: FC<Props> = ({ onSave, showSkip, onSkip }) => {
  const status = useSelector<RootState>(state => state.campaigns.idp.status)
  const currentUser = useSelector<RootState>(state => state.currentUser) as CurrentUser
  const reflectionQuestions = useAppSelector(
    state => state.campaigns.idpRtk.reflectionQuestions,
  ) as ReflectionQuestion[]

  const [updateReflectionQuestions, { isLoading }] = useUpdateReflectionQuestionsMutation()

  const [answers, setAnswers] = useState<Record<number, {content: string, wordsCount?: number}>>(
    reflectionQuestions.reduce((acc, question) => ({
      ...acc, [question.id]: { content: question.answer || '' },
    }), {}),
  )
  const [errors, setErrors] = useState<Record<number, string[]>>({})

  const onChange = (questionId, content, wordsCount) => {
    setAnswers(prevAnswers => ({
      ...prevAnswers,
      [questionId]: { content, wordsCount },
    }))
    setErrors(prevErrors => ({
      ...prevErrors,
      [questionId]: [],
    }))
  }

  const validateAnswers = () => {
    const invalidAnswers = reflectionQuestions.filter((question) => {
      const answer = answers[question.id]
      setErrors(prevErrors => ({ ...prevErrors, [question.id]: [] }))

      if (question.mandatory && !answer.content) {
        setErrors(prevErrors => ({
          ...prevErrors,
          [question.id]: [...(prevErrors[question.id] || []), I18n.t('idp.reflective_questions.errors.required')],
        }))
        return true
      }
      if (answer.content && question.minWords && answer.wordsCount < question.minWords) {
        setErrors(prevErrors => ({
          ...prevErrors,
          [question.id]: [
            ...(prevErrors[question.id] || []),
            I18n.t('idp.reflective_questions.errors.min_words', { count: question.minWords }),
          ],
        }))
        return true
      }
      if (question.maxWords && answer.wordsCount > question.maxWords) {
        setErrors(prevErrors => ({
          ...prevErrors,
          [question.id]: [
            ...(prevErrors[question.id] || []),
            I18n.t('idp.reflective_questions.errors.max_words', { count: question.maxWords }),
          ],
        }))
        return true
      }
      return false
    })

    return invalidAnswers.length === 0
  }

  const onSubmit = async () => {
    if (!validateAnswers()) {
      return
    }
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
      message.error(I18n.t('idp.reflective_questions.update_failed'))
    }
  }

  if (!status) {
    return <PageLoadSpinner size="large" />
  }
  return (
    <Layout.Content className={styles.pageContent}>
      <Flex justify="space-between" align="middle" className={styles.header}>
        <Typography.Title level={4}>{I18n.t('idp.reflective_questions.title')}</Typography.Title>
        {showSkip && (
          <Space>
            <div className="flex justify-center">
              <ButtonWithArrow
                label={I18n.t('idp.reflective_questions.answer_later')}
                size="small"
                type="primary"
                onClick={() => onSkip?.()}
              />
            </div>
          </Space>
        )}
      </Flex>

      <BoxWithShadow className={styles.questionsBox}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {reflectionQuestions.map(question => (
            <ReflectiveQuestion
              key={question.id}
              question={question}
              value={answers[question.id]?.content || ''}
              error={errors[question.id]}
              onChange={(content, wordsCount) => onChange(question.id, content, wordsCount)}
            />
          ))}
        </Space>

      </BoxWithShadow>
      <Flex justify="flex-end">
        <Button
          loading={isLoading}
          onClick={onSubmit}
          type="primary"
          size="small"
        >
          {I18n.t('common.actions.submit')}
        </Button>
      </Flex>
    </Layout.Content>
  )
}

const ReflectiveQuestion = ({
  question, value, onChange, error,
}) => (
  <Flex vertical flex={1}>
    <Space direction="vertical">
      <Typography.Text strong>
        <Space>
          {question.question}
          {question.mandatory && <span className={styles.mandatory}>*</span>}
        </Space>
      </Typography.Text>
      <Form.Item
        validateStatus="error"
        help={error ? error.join(' ') : undefined}
        className={cs(styles.questionInput, { [styles.withError]: error?.length })}
      >
        <Editor content={value} handleContentChange={onChange} />
      </Form.Item>
      <Space size="large">
        <Space className={styles.minmaxInfo}>
          {`${I18n.t('idp.reflective_questions.min_words')}:`}
          {question.minWords}
        </Space>
        <Space className={styles.minmaxInfo}>
          {`${I18n.t('idp.reflective_questions.max_words')}:`}
          {question.maxWords}
        </Space>
      </Space>
    </Space>
  </Flex>
)
