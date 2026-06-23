/* eslint-disable max-len */
import React from 'react'
import { Button, message } from 'antd'
import { useParams } from 'react-router'
import * as t from 'io-ts'
import { useDispatch } from 'react-redux'
import { InterviewQuestion } from 'modules/admin/modules/client/core/interviewQuestion'
import { PlusOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { Resource, useResourceContext } from '~/modules/admin/components/Resource'
import { ToolsDropdown } from './ToolsDropdown'
import { openModal } from '~/modules/admin/core/ui/modals'

const { I18n } = window

export const InterviewQuestionsFilter: React.FC = () => {
  const { projectId: projectIdParam } = useParams()
  const { resource } = useResourceContext<InterviewQuestion>()
  const dispatch = useDispatch()

  const tableLoading = resource.isLoading('fetch')

  const handleImport = (data:FormData, projectId: number|null, successCallback:()=>void, failureCallback:(error)=>void) => {
    const action = `interview_questions/import?project_id=${projectId}`

    resource.uploadFileAction(action, data).then(() => {
      successCallback()
      message.info(I18n.t('admin.interview_questions_import_success_msg'))
    })
      .catch((error) => {
        failureCallback(error)
        message.info(I18n.t('admin.interview_questions_import_failure_msg'))
      })
  }

  const handleActionExport = (projectId: number) => {
    resource.collectionAction({
      action: `export?project_id=${projectId}`,
      method: 'post',
      responseType: t.literal('ok'),
    }).then(() => {
      message.info(I18n.t('admin.interview_questions_export_success_msg'))
    })
      .catch(() => {
        message.error(I18n.t('admin.interview_questions_export_failure_msg'))
      })
  }

  const handleToolAction = (action: string) => {
    if (action === 'import') {
      dispatch(openModal('ImportModal', {
        handleImport,
        title: I18n.t('admin.interview_questions_import_action'),
      }))
    }

    if (action === 'export') {
      handleActionExport(Number(projectIdParam))
    }
  }

  const handleCreateActionModal = () => {
    dispatch(openModal('FormModal'))
  }

  return (
    <Resource.Filter name="question_cont">
      <ToolsDropdown
        onClick={handleToolAction}
        permissions={resource.meta.permissions}
      />
      <Button type="primary" disabled={tableLoading} onClick={handleCreateActionModal}>
        <PlusOutlined />
        {I18n.t('shared.create')}
      </Button>
    </Resource.Filter>
  )
}
