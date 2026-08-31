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
          title={I18n.t('shared.id')}
          id="id"
          hideable={false}
          sorter
          render={skill => (
            skill.id
          )}
          width={10}
          fixed="left"
        />
        <Resource.Column<InterviewQuestion>
          title={I18n.t('admin.interview_questions_question')}
          id="question"
          width={300}
          render={item => <Typography.Text copyable>{item.question}</Typography.Text>}
          sorter
          fixed="left"
        />
        <Resource.Column<InterviewQuestion>
          title={I18n.t('shared.description')}
          id="description"
          render={item => (
            <Typography.Text ellipsis>
              {item.description?.length > 50 ? `${item.description.substring(0, 50)}...` : item.description }
            </Typography.Text>
          )}
        />
        <Resource.Column<InterviewQuestion>
          title={I18n.t('admin.interview_questions_form_question_type')}
          id="question_type"
          width={120}
          render={item => item.questionType}
        />
        <Resource.Column<InterviewQuestion>
          title={I18n.t('admin.interview_questions_form_time_limit')}
          id="time_limit"
          width={120}
          render={item => maskUp(item.timeLimit)}
        />
        <Resource.Column<InterviewQuestion>
          title={I18n.t('admin.interview_questions_form_mandatory')}
          id="question_type"
          width={100}
          render={item => (item.mandatory ? I18n.t('yes') : I18n.t('no'))}
        />
        <Resource.Column<InterviewQuestion>
          title={I18n.t('shared.updated_at')}
          id="updated_at"
          width={150}
          sorter
        />
        <Resource.Column<InterviewQuestion>
          title={I18n.t('shared.action')}
          id="action"
          hideable={false}
          render={(_, interviewQuestion) => (
            <Dropdown
              interviewQuestion={interviewQuestion}
              openModal={(name, interviewQuestion) => dispatch(openModal(name, { interviewQuestion }))}
              setConfirmation={setConfirmation}
            />
          )}
          width={100}
          fixed="right"
        />
      </Resource.Table>
      <ConfirmationModal
        open={!!confirmationId}
        title={I18n.t('shared.delete')}
        message={I18n.t('admin.interview_questions_delete_confirmation')}
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
                {I18n.t('shared.edit')}
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
                {I18n.t('shared.delete')}
              </Button>),
          },
        ].filter(m => m) as MenuItem[],
      }
    }
  />
)
