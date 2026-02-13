import _ from 'lodash'
import { FC, useState, useContext } from 'react'
import {
  Typography, Button, Flex,
  message, Space, Form, Empty,
} from 'antd'
import {
  useSelector,
} from 'react-redux'
import cs from 'classnames'
import { PageLoadSpinner, ButtonWithArrow, MediaQueryContext } from '~/glint'
import { RootState } from '~/modules/endUser/core/rootReducers'
import styles from './ReflectiveQuestions.less'
import Editor from './Editor'
import { USER_IDP_PLAN_STATUS } from '~/components/IdpShared/constants'
import {
  EditOutlined,
} from '~/glint/icons/AccessibleIconsAntDesign'
import { SafeHTML } from '~/components/SafeHTML'
import { useReflectiveQuestions } from './useReflectiveQuestions'

const { I18n } = window

interface CurrentUser {
  id: string
}

interface Props {
  onSave?: () => void
}

export const ListView: FC<Props> = ({ onSave }) => {
  const status = useSelector<RootState>(state => state.campaigns.idp.status)
  const currentUser = useSelector<RootState>(state => state.currentUser) as CurrentUser

  const {
    reflectionQuestions, validateAnswer, updateReflectionQuestions, onChange, answers, errors,
  } = useReflectiveQuestions()

  const onSubmit = async (question) => {
    if (!validateAnswer(question)) {
      throw new Error()
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
      message.error(error?.data?.error || I18n.t('idp.reflective_questions.update_failed'))
    }
  }

  if (!status) {
    return <PageLoadSpinner size="large" />
  }

  if (status && reflectionQuestions.length === 0) {
    return <Empty description={I18n.t('idp.reflective_questions.no_reflective_questions')} />
  }

  return (
    <>
      <Space
        className="ps-8 pe-8 pt-8"
        orientation="vertical"
        size="large"
        style={{ maxWidth: '1200px', width: '100%' }}
      >
        {reflectionQuestions.map(question => (
          <ReflectiveQuestion
            key={question.id}
            status={status}
            question={question}
            value={answers[question.id]?.content || ''}
            error={errors[question.id]}
            onSubmit={onSubmit}
            onChange={(content, wordsCount) => onChange(question.id, content, wordsCount)}
          />
        ))}
      </Space>

    </>
  )
}

const ReflectiveQuestion = ({
  question, value, onChange, error, status, onSubmit,
}) => {
  const [editMode, setEditMode] = useState(false)

  const { isMobile } = useContext(MediaQueryContext)

  const handleSubmit = async () => {
    try {
      await onSubmit(question)
      setEditMode(false)
      // eslint-disable-next-line no-empty
    } catch (error) { }
  }
  return (
    <Flex flex={1} vertical gap={0}>
      <Flex flex={1} justify="space-between">
        <Flex flex={0.8}>
          <Typography.Text strong aria-label={I18n.t('idp.reflective_questions.question')}>
            {question.question}
            {question.mandatory ? (
              <span
                aria-label={I18n.t('idp.reflective_questions.required')}
                className={cs(styles.mandatory, 'mlx')}
              >
                *
              </span>
            )
              : (
                <Typography.Text type="secondary">
                  {' '}
                  {I18n.t('idp.reflective_questions.optional')}
                </Typography.Text>
              )}
          </Typography.Text>
        </Flex>

        {!editMode && (
          <Flex flex={0.2} justify="end">
            <Button
              className={styles.editBtn}
              icon={(
                <EditOutlined aria-hidden="true" />
              )}
              aria-label={I18n.t('idp.reflective_questions.edit_answer')}
              onClick={() => setEditMode(true)}
            />
          </Flex>

        )}
      </Flex>

      {!editMode ? (
        <>
          <Typography.Text aria-label={I18n.t('idp.reflective_questions.answer')}>
            {value ? <SafeHTML html={value} /> : I18n.t('idp.reflective_questions.no_answer_provided')}
          </Typography.Text>
        </>
      ) : (
        <div className="mt-2">
          <Form.Item
            validateStatus="error"
            help={error ? error.join(' ') : undefined}
            className={cs(styles.questionInput, { [styles.withError]: error?.length })}
          >
            <Editor
              content={value}
              handleContentChange={onChange}
              readOnly={status === USER_IDP_PLAN_STATUS.COMPLETED}
            />
          </Form.Item>
          <Flex gap={8} className="mb-4" justify="space-between">
            {question.minWords && question.maxWords && (
              <span>
                {I18n.t('idp.reflective_questions.word_limit', { min: question.minWords, max: question.maxWords })}
              </span>
            )}
            {question.minWords && !question.maxWords && (
              <span>
                {I18n.t('enduser.min_word_limit', { min: question.minWords })}
              </span>
            )}
            {question.maxWords && !question.minWords && (
              <span>
                {I18n.t('enduser.max_word_limit', { max: question.maxWords })}
              </span>
            )}
            <Flex flex={1} gap={4} justify="end">
              <Button
                size="small"
                onClick={() => setEditMode(false)}
                aria-label={I18n.t('idp.reflective_questions.cancel_edited_answer')}
              >
                {I18n.t('common.actions.cancel')}
              </Button>
              <ButtonWithArrow
                label={I18n.t('common.actions.save')}
                size="small"
                type="primary"
                style={{
                  alignSelf: isMobile ? 'flex-start' : 'flex-end',
                }}
                aria-label={I18n.t('idp.reflective_questions.save_edited_answer')}
                onClick={handleSubmit}
              />
            </Flex>
          </Flex>
        </div>
      )}
    </Flex>
  )
}
