import React, { useState } from 'react'
import { Button, Typography } from 'antd'
import { useDispatch } from 'react-redux'
import { ConfirmationModal } from '~/glint'
import { MenuItem } from '~/interfaces/Antd'
import { InterviewQuestion } from '~/modules/admin/modules/client/core/interviewQuestion'
import { Resource, useResourceContext } from '~/modules/admin/components/Resource'
import ConditionalDropdown from '~/components/ConditionalDropdown'
import { openModal } from '~/modules/admin/core/ui/modals'
import { maskUp } from '~/components/InputDuration'

const { I18n } = window

type Props = {
}

export const InterviewQuestionTable: React.FC<Props> = () => {
  const [confirmationId, setConfirmation] = useState<string | null>(null)
  const dispatch = useDispatch()
  const { resource } = useResourceContext<InterviewQuestion>()

  const handleDelete = () => {
    if (confirmationId) {
      resource.removeResource(confirmationId)
    }
    setConfirmation(null)
  }

  return (
    <>
      <Resource.Table pagination>
        <Resource.Column<InterviewQuestion>
          title={I18n.t('common.column.id')}
          id="id"
          sorter
          render={skill => (
            skill.id
          )}
          width={200}
        />
        <Resource.Column<InterviewQuestion>
          title={I18n.t('administration.interview_questions.question')}
          id="question"
          width={300}
          render={item => <Typography.Text copyable>{item.question}</Typography.Text>}
          sorter
        />
        <Resource.Column<InterviewQuestion>
          title={I18n.t('administration.interview_questions.description')}
          id="description"
          render={item => (
            <Typography.Text ellipsis>
              {item.description?.length > 50 ? `${item.description.substring(0, 50)}...` : item.description }
            </Typography.Text>
          )}
        />
        <Resource.Column<InterviewQuestion>
          title={I18n.t('administration.interview_questions.form.question_type')}
          id="question_type"
          width={120}
          render={item => item.questionType}
        />
        <Resource.Column<InterviewQuestion>
          title={I18n.t('administration.interview_questions.form.time_limit')}
          id="time_limit"
          width={120}
          render={item => maskUp(item.timeLimit)}
        />
        <Resource.Column<InterviewQuestion>
          title={I18n.t('administration.interview_questions.form.mandatory')}
          id="question_type"
          width={100}
          render={item => (item.mandatory ? I18n.t('yes') : I18n.t('no'))}
        />
        <Resource.Column<InterviewQuestion>
          title={I18n.t('common.column.updated_at')}
          id="updated_at"
          width={150}
          sorter
        />
        <Resource.Column<InterviewQuestion>
          title={I18n.t('common.column.action')}
          id="action"
          render={(_, interviewQuestion) => (
            <Dropdown
              interviewQuestion={interviewQuestion}
              openModal={(name, interviewQuestion) => dispatch(openModal(name, { interviewQuestion }))}
              setConfirmation={setConfirmation}
            />
          )}
          width={100}
        />
      </Resource.Table>
      <ConfirmationModal
        open={!!confirmationId}
        title={I18n.t('common.actions.delete')}
        message={I18n.t('administration.interview_questions.delete_confirmation')}
        onConfirm={handleDelete}
        onCancel={(e) => {
          e.stopPropagation()
          setConfirmation(null)
        }}
        close={() => null}
      />
    </>
  )
}

type DropDownProps = {
    interviewQuestion: InterviewQuestion,
    openModal: (modalName: string, interviewQuestion?: InterviewQuestion) => void
    setConfirmation: (id: string) => void
}

const Dropdown: React.FC<DropDownProps> = ({ interviewQuestion, openModal, setConfirmation }) => (
  <ConditionalDropdown
    menu={
      {
        items: [
          interviewQuestion && {
            key: 'edit',
            label: (
              <Button
                type="link"
                onClick={() => {
                  openModal('FormModal', interviewQuestion)
                }}
                className="ps-0"
              >
                {I18n.t('common.actions.edit')}
              </Button>),
          },
          interviewQuestion.allowDelete && {
            key: 'delete',
            label: (
              <Button
                type="link"
                onClick={() => {
                  setConfirmation(interviewQuestion.id)
                }}
                className="ps-0"
              >
                {I18n.t('common.actions.delete')}
              </Button>),
          },
        ].filter(m => m) as MenuItem[],
      }
    }
  />
)
