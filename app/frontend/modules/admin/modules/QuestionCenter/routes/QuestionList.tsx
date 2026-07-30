import React from 'react'
import {
  Button, message, Flex, Switch,
} from 'antd'
import { Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import dayjs from 'dayjs'
import {
  PlusOutlined, CopyOutlined, DeleteOutlined,
} from '~/glint/icons/AccessibleIconsAntDesign'
import { ConfirmationModal } from '~/glint'
import { Question, QuestionTR } from '~/modules/admin/modules/QuestionCenter/core/questions'
import { Resource, useResourceContext } from '~/modules/admin/components/Resource'
import { useDocumentTitle } from '~/hooks/useDocumentTitle'
import { useResources } from '~/hooks/useResources'
import { openModal } from '~/modules/admin/core/ui/modals'
import Modals from '~/modules/admin/components/Modals/'
import CopyQuestionFormModal from './CopyQuestionFormModal'
import CreateQuestionFormModal from './CreateQuestionFormModal'

const { I18n } = window

const MODALS = {
  CopyQuestionFormModal,
  CreateQuestionFormModal,
}

const ActiveSwitch = ({ question }: { question: Question }) => {
  const { resource } = useResourceContext<Question>()

  const onToggle = () => {
    resource.memberAction({
      id: question.id,
      action: 'toggle_status',
      method: 'patch',
      updateStore: true,
      responseType: QuestionTR,
    }).catch(() => {
      message.error(I18n.t('admin.errors_error_msg'))
    })
  }

  return (
    <Switch checked={!question.disabled} onChange={onToggle} />
  )
}

const ActionsCell = ({ record }: { record: Question }) => {
  const { resource } = useResourceContext()
  const dispatch = useDispatch()
  const [confirmation, setConfirmation] = React.useState(false)

  const handleOnConfirm = () => {
    resource.removeResource(record.id).then(() => {
      message.success(I18n.t('shared.removed'))
      setConfirmation(false)
    })
  }

  const handleCopy = () => {
    dispatch(openModal('CopyQuestionFormModal', { question: record }))
  }

  return (
    <>
      <Flex gap="small">
        <Button
          shape="circle"
          icon={<CopyOutlined />}
          onClick={handleCopy}
        />
        <Button
          shape="circle"
          icon={<DeleteOutlined />}
          onClick={() => setConfirmation(true)}
        />
      </Flex>
      <ConfirmationModal
        open={confirmation}
        title={I18n.t('admin.confirmation_required')}
        message={I18n.t('admin.confirmation_required_details', {
          resource: 'Question',
          resource_name: record.name,
        })}
        onConfirm={handleOnConfirm}
        onCancel={(e) => {
          e.stopPropagation()
          setConfirmation(false)
        }}
        close={() => null}
      />
    </>
  )
}

const QuestionList: React.FC = () => {
  const dispatch = useDispatch()
  useDocumentTitle(I18n.t('admin.question_center_page_title'))

  const config = {
    trackUrl: true,
    responseType: QuestionTR,
    apiConfig: {
      filter: { view_eq: 'templates' },
      include: ['owner', 'linked_assessments'],
    },
  }

  useResources<Question>('questions', config)

  const handleNewQuestion = () => dispatch(openModal('CreateQuestionFormModal'))

  const Filter = (
    <Resource.Filter name="filterable_fields" placeholder={I18n.t('shared.search')}>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={handleNewQuestion}
      >
        {I18n.t('admin.questions_new_button')}
      </Button>
    </Resource.Filter>
  )

  const Table = (
    <Resource.Table pagination>
      <Resource.Column<Question>
        id="id"
        dataIndex="id"
        title={I18n.t('shared.id') || 'ID'}
        sorter
      />
      <Resource.Column<Question>
        id="disabled"
        title={I18n.t('shared.active')}
        render={question => <ActiveSwitch question={question} />}
      />
      <Resource.Column<Question>
        id="name"
        dataIndex="name"
        title={I18n.t('shared.name')}
        sorter
        render={(name, record) => (
          <Link
            to={`/admin/templates/questions/${record.id}/edit`}
            reloadDocument
          >
            {name}
          </Link>
        )}
      />
      <Resource.Column<Question>
        id="type"
        title={I18n.t('admin.questions_type')}
        sorter
      />
      <Resource.Column<Question>
        id="linked_assessments"
        width={350}
        title={I18n.t('admin.linked_assessments') || 'Linked Assessments'}
        render={(_, record) => {
          if (!record.linkedAssessments || record.linkedAssessments.length === 0) return ''
          return (
            <div>
              {record.linkedAssessments.map((assessment, index) => (
                <React.Fragment key={assessment.id}>
                  {index > 0 && ', '}
                  <Link to={`/admin/assessments/${assessment.id}/edit`}>
                    {assessment.name}
                  </Link>
                </React.Fragment>
              ))}
            </div>
          )
        }}
      />
      <Resource.Column<Question>
        id="owner"
        title={I18n.t('shared.owner')}
        dataIndex={['owner', 'name']}
        render={(ownerName, record) => (record.owner ? (
          <Link to={`/admin/clients/${record.owner.id}`}>
            {ownerName}
          </Link>
        ) : I18n.t('admin.tte'))}
      />
      <Resource.Column<Question>
        id="created_at"
        dataIndex="createdAt"
        title={I18n.t('shared.created_at')}
        render={createdAt => (
          dayjs(createdAt).format('lll')
        )}
        sorter
      />
      <Resource.Column<Question>
        id="updated_at"
        dataIndex="updatedAt"
        title={I18n.t('shared.updated_at')}
        render={updatedAt => (
          dayjs(updatedAt).format('lll')
        )}
        sorter
      />
      <Resource.Column<Question>
        id="actions"
        title={I18n.t('shared.actions')}
        render={(_, record) => <ActionsCell record={record} />}
      />
    </Resource.Table>
  )

  return (
    <Resource config={config} name="questions">
      {Filter}
      {Table}
      <Modals modals={MODALS} />
    </Resource>
  )
}

export default QuestionList
