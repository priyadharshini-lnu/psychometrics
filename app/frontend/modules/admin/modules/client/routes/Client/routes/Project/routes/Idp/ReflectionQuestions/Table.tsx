import React, { useState } from 'react'
import { Button, Typography } from 'antd'
import { useDispatch } from 'react-redux'
import { ConfirmationModal } from '~/glint'
import { MenuItem } from '~/interfaces/Antd'
import { ReflectionQuestion } from '~/modules/admin/modules/client/core/reflectionQuestion'
import { Resource, useResourceContext } from '~/modules/admin/components/Resource'
import ConditionalDropdown from '~/components/ConditionalDropdown'
import { openModal } from '~/modules/admin/core/ui/modals'


const { I18n } = window

type Props = {
}

export const ReflectionQuestionTable: React.FC<Props> = () => {
  const [confirmationId, setConfirmation] = useState<string | null>(null)
  const dispatch = useDispatch()
  const { resource } = useResourceContext<ReflectionQuestion>()

  const handleDelete = () => {
    if (confirmationId) {
      resource.removeResource(confirmationId)
    }
    setConfirmation(null)
  }

  return (
    <>
      <Resource.Table pagination>
        <Resource.Column<ReflectionQuestion>
          title={I18n.t('common.column.id')}
          id="id"
          sorter
          render={skill => (
            skill.id
          )}
          width={200}
        />
        <Resource.Column<ReflectionQuestion>
          title={I18n.t('administration.reflection_questions.question')}
          id="question"
          render={item => <Typography.Text copyable>{item.question}</Typography.Text>}
          sorter
        />
        <Resource.Column<ReflectionQuestion>
          title={I18n.t('administration.reflection_questions.form.min_words')}
          id="min_words"
          width={100}
          sorter
        />
        <Resource.Column<ReflectionQuestion>
          title={I18n.t('administration.reflection_questions.form.max_words')}
          id="max_words"
          width={100}
          sorter
        />
        <Resource.Column<ReflectionQuestion>
          title={I18n.t('common.column.updated_at')}
          id="updated_at"
          width={200}
          sorter
        />
        <Resource.Column<ReflectionQuestion>
          title={I18n.t('common.column.action')}
          id="action"
          render={(_, reflectionQuestion) => (
            <Dropdown
              reflectionQuestion={reflectionQuestion}
              openModal={(name, reflectionQuestion) => dispatch(openModal(name, { reflectionQuestion }))}
              setConfirmation={setConfirmation}
            />
          )}
          width={100}
        />
      </Resource.Table>
      <ConfirmationModal
        open={!!confirmationId}
        title={I18n.t('common.actions.delete')}
        message={I18n.t('administration.reflection_questions.delete_confirmation')}
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
    reflectionQuestion: ReflectionQuestion,
    openModal: (modalName: string, reflectionQuestion?: ReflectionQuestion) => void
    setConfirmation: (id: string) => void
}

const Dropdown: React.FC<DropDownProps> = ({ reflectionQuestion, openModal, setConfirmation }) => (
  <ConditionalDropdown
    menu={
      {
        items: [
          reflectionQuestion && reflectionQuestion.meta.permissions.edit && {
            key: 'edit',
            label: (
              <Button
                type="link"
                onClick={() => {
                  openModal('FormModal', reflectionQuestion)
                }}
                className="ps-0"
              >
                {I18n.t('common.actions.edit')}
              </Button>),
          },
          reflectionQuestion.allowDelete && reflectionQuestion.meta.permissions.remove && {
            key: 'delete',
            label: (
              <Button
                type="link"
                onClick={() => {
                  setConfirmation(reflectionQuestion.id)
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
