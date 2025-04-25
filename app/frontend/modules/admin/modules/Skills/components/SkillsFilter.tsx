import React from 'react'
import { PlusOutlined } from '@ant-design/icons'
import * as t from 'io-ts'
import { Button, message } from 'antd'
import { useParams } from 'react-router'
import { Resource, useResourceContext } from '~/modules/admin/components/Resource'
import { User } from '~/modules/admin/modules/client/core/users'
import { TaggableResourceType } from '~/modules/admin/components/Resource/TagFilter/constants'
import { ToolsDropdown } from './ToolsDropdown'

const { I18n } = window

type Props = {
  openModal: (modalName: string, modalProps?: unknown) => void
}
export const SkillsFilter: React.FC<Props> = ({
  openModal,
}) => {
  const { resource } = useResourceContext<User>()
  const params = useParams()

  const tableLoading = resource.isLoading('fetch')

  const CSVSkills = `ID,Name,Description,Category,Tag
1,Leadership,Description 1,behavioral,"tag1,tag2"
2,Programming,Description 2,technical,tag3`

  const CSVSkillsTranslations = `ID,Locale,Name,Description
      1,en,Test Skill,Test Description`

  const handleSkillsImport = (data:FormData,
    projectId: number|null, successCallback:()=>void, failureCallback:(error)=>void) => {
    const action = projectId ? `skills/import?project_id=${projectId}` : 'skills/import_global'

    resource.uploadFileAction(action, data).then(() => {
      successCallback()
      message.info(I18n.t('administration.skills.import.info_msg'))
    })
      .catch((error) => {
        failureCallback(error)
      })
  }

  const handleSkillsTranslationsImport = (data:FormData,
    projectId: number, successCallback:()=>void, failureCallback:(error)=>void) => {
    const action = projectId
      ? `skills/import_translations?project_id=${projectId}` : 'skills/import_global_translations'

    resource.uploadFileAction(action, data).then(() => {
      successCallback()
      message.info(I18n.t('administration.skills.import.success_msg'))
    })
      .catch((error) => {
        failureCallback(error)
      })
  }

  const handleSkillsExport = (projectId: number) => {
    resource.collectionAction({
      action: `export?project_id=${projectId}`,
      method: 'post',
      responseType: t.literal('ok'),
    }).then(() => {
      message.info(I18n.t('administration.skills.export.success_msg'))
    })
      .catch(() => {
        message.error(I18n.t('administration.skills.export.failure_msg'))
      })
  }

  const handleSkillsTranslationExport = (projectId: number) => {
    resource.collectionAction({
      action: `export_translations?project_id=${projectId}`,
      method: 'post',
      responseType: t.literal('ok'),
    }).then(() => {
      message.info(I18n.t('administration.skills.export.success_msg'))
    }).catch(() => {
      message.error(I18n.t('administration.skills.export.failure_msg'))
    })
  }

  const handleToolAction = (action: string) => {
    if (action === 'import_skills') {
      openModal('SkillsImportModal', {
        handleImport: handleSkillsImport,
        csvData: CSVSkills,
        title: I18n.t('administration.skills.import_action.skills_title'),
        allowGlobalImport: resource.meta.permissions?.importGlobal,
      })
    }

    if (action === 'import_translations') {
      openModal('SkillsImportModal', {
        handleImport: handleSkillsTranslationsImport,
        csvData: CSVSkillsTranslations,
        title: I18n.t('administration.skills.import_action.skills_translations_title'),
        allowGlobalImport: resource.meta.permissions?.importGlobalTranslations,
      })
    }


    if (action === 'export_skills') {
      if (params.projectId) {
        handleSkillsExport(Number(params.projectId))
      } else {
        openModal('SkillsExportModal', {
          handleExport: handleSkillsExport,
          title: I18n.t('administration.skills.export_action.skills_title'),
        })
      }
    }

    if (action === 'export_skills_translations') {
      if (params.projectId) {
        handleSkillsTranslationExport(Number(params.projectId))
      } else {
        openModal('SkillsExportModal', {
          handleExport: handleSkillsTranslationExport,
          title: I18n.t('administration.skills.export_action.skills_translations_title'),
        })
      }
    }

    if (action === 'export_global_skills') {
      resource.collectionAction({
        action: 'export_global',
        method: 'post',
        body: {},
        responseType: t.literal('ok'),
      }).then(() => {
        message.info(I18n.t('administration.skills.export.success_msg'))
      })
        .catch(() => {
          message.error(I18n.t('administration.skills.export.failure_msg'))
        })
    }

    if (action === 'export_global_skills_translations') {
      resource.collectionAction({
        action: 'export_global_translations',
        method: 'post',
        body: {},
        responseType: t.literal('ok'),
      }).then(() => {
        message.info(I18n.t('administration.skills.export.success_msg'))
      })
        .catch(() => {
          message.error(I18n.t('administration.skills.export.failure_msg'))
        })
    }
  }

  const handleCreateSkillModal = () => {
    openModal('SkillsFormModal')
  }

  return (
    <Resource.Filter
      name="name_cont"
      showTagFilter
      tagFilterConfig={{ taggable_resource_type: TaggableResourceType.Skill }}
    >
      <ToolsDropdown
        onClick={handleToolAction}
        permissions={resource.meta.permissions}
      />
      <Button type="primary" disabled={tableLoading} onClick={handleCreateSkillModal}>
        <PlusOutlined />
        {I18n.t('common.actions.create')}
      </Button>
    </Resource.Filter>
  )
}
