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
          title={I18n.t('shared.id')}
          id="id"
          hideable={false}
          sorter
          render={skill => (
            skill.id
          )}
          width={100}
          fixed="left"
        />
        <Resource.Column<ReflectionQuestion>
          title={I18n.t('admin.reflection_questions_question')}
          id="question"
          render={item => <Typography.Text copyable>{item.question}</Typography.Text>}
          sorter
          width={300}
          fixed="left"
        />
        <Resource.Column<ReflectionQuestion>
          title={I18n.t('admin.reflection_questions_form_min_words')}
          id="min_words"
          width={100}
          sorter
        />
        <Resource.Column<ReflectionQuestion>
          title={I18n.t('admin.reflection_questions_form_max_words')}
          id="max_words"
          width={100}
          sorter
        />
        <Resource.Column<ReflectionQuestion>
          title={I18n.t('shared.updated_at')}
          id="updated_at"
          width={200}
          sorter
        />
        <Resource.Column<ReflectionQuestion>
          title={I18n.t('shared.action')}
          id="action"
          hideable={false}
          render={(_, reflectionQuestion) => (
            <Dropdown
              reflectionQuestion={reflectionQuestion}
              openModal={(name, reflectionQuestion) => dispatch(openModal(name, { reflectionQuestion }))}
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
        message={I18n.t('admin.reflection_questions_delete_confirmation')}
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
                {I18n.t('shared.edit')}
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
                {I18n.t('shared.delete')}
              </Button>),
          },
        ].filter(m => m) as MenuItem[],
      }
    }
  />
)
