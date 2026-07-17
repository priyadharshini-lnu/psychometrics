import React, { useState } from 'react'
import {
  Button, Switch, MenuProps, App,
} from 'antd'
import { MessageInstance } from 'antd/es/message/interface'
import { useNavigate } from 'react-router-dom'
import { ConnectedProps, connect } from 'react-redux'
import { MenuItem } from '~/interfaces/Antd'
import { Resource, useResourceContext } from '~/modules/admin/components/Resource'
import { Assessment, AssessmentTR } from '~/modules/admin/modules/client/core/assessments'
import { ConfirmationModal, ResourceAvatar } from '~/glint'
import ConditionalDropdown from '~/components/ConditionalDropdown'
import { TagList } from '~/modules/admin/components/Resource/TagList'
import Modals from '~/modules/admin/components/Modals/'
import CopyAssessmentFormModal from './CopyAssessmentFormModal'
import settings from '../../settings'
import styles from './AssessmentList.less'
import { openModal } from '~/modules/admin/core/ui/modals'

const { I18n } = window

const MODALS = {
  CopyAssessmentFormModal,
}

interface JSONApiError {
  title: string
  detail?: string
}


const connecter = connect(
  () => ({ }),
  {
    openModal,
  },
)

type PropsFromRedux = ConnectedProps<typeof connecter>

type Props = PropsFromRedux & {
  openDrawer: (assessment: Assessment) => void
}
const AssessmentTableComponent: React.FC<Props> = ({
  openDrawer, openModal,
}) => {
  const { resource } = useResourceContext<Assessment>()
  const collectionFilteredValue = resource.getFilteredValue('category_in') as string[] | undefined

  return (
    <>
      <Resource.Table pagination>
        <Resource.Column<Assessment>
          title={I18n.t('common.column.id')}
          id="id"
          sorter
          render={assessment => (
            <AssessmentId assessment={assessment} />
          )}
        />
        <Resource.Column<Assessment>
          id="disabled"
          title={I18n.t('common.column.active')}
          render={assessment => <ActiveSwitch assessment={assessment} />}
        />
        <Resource.Column<Assessment>
          title={I18n.t('common.column.icon')}
          id="icon"
          width={100}
          render={assessment => (
            <ResourceAvatar
              url={assessment.iconUrl}
              color={assessment.iconColor}
              name={assessment.name}
            />
          )}
        />
        <Resource.Column<Assessment>
          title={I18n.t('common.column.name')}
          id="name"
          width={400}
          sorter
          render={(_, assessment) => (
            <>
              <div>{assessment.name}</div>
              <TagList
                initialTags={assessment.tagList as string[]}
                config={{
                  editable: false,
                }}
              />
            </>
          )}
        />
        <Resource.Column<Assessment>
          title={I18n.t('common.column.dimension')}
          id="dimension"
          width={300}
          render={(_, { dimension }) => dimension?.name}
        />
        <Resource.Column<Assessment>
          title={I18n.t('common.column.owner')}
          id="owner"
          width={300}
          render={(_, { owner }) => owner?.name}
        />
        <Resource.Column<Assessment>
          title={I18n.t('common.column.type')}
          id="type"
          width={300}
          sorter
          render={assessment => (I18n.t(`admin.${assessment.type}_assessment`))}
        />
        <Resource.Column<Assessment>
          title={I18n.t('common.column.category')}
          id="category"
          width={300}
          sorter
          filters={
            settings.categories.map((t: string) => ({
              text: I18n.t(`admin.${t}`),
              value: t,
            }))
          }
          filteredValue={collectionFilteredValue}
          render={assessment => (I18n.t(`admin.${assessment.category}`))}
        />
        <Resource.Column<Assessment>
          title={I18n.t('common.column.updated_at')}
          id="updated_at"
          width={300}
          sorter
        />
        <Resource.Column<Assessment>
          title={I18n.t('common.column.action')}
          id="action"
          render={(_, assessment) => (
            <Dropdown
              assessment={assessment}
              openDrawer={openDrawer}
              openCopyModal={(assessment) => {
                openModal('CopyAssessmentFormModal', { assessment })
              }}
            />
          )}
          width={100}
        />
      </Resource.Table>
      <Modals modals={MODALS} />
    </>
  )
}

export const AssessmentTable = connecter(AssessmentTableComponent)

const AssessmentId = ({ assessment }: { assessment: Assessment }) => {
  if (assessment.category === 'agile') {
    return (
      <Button type="link" href={`/administration/assessments/${assessment.id}/agiles`}>
        {assessment.id}
      </Button>
    )
  }

  if (assessment.type === 'common' || assessment.type === 'microsite') {
    return (
      <Button
        type="link"
        href={`/administration/assessments/${assessment.id}?assessmentLang=${assessment.defaultLanguage}`}
      >
        {assessment.id}
      </Button>
    )
  }

  return <div className={styles.assessmentId}>{assessment.id}</div>
}

const ActiveSwitch: React.FC<{ assessment: Assessment }> = ({ assessment }) => {
  const { resource } = useResourceContext<Assessment>()
  return (
    <Switch
      checked={!assessment.disabled}
      onChange={() => {
        resource.updateResource({ id: assessment.id, disabled: !assessment.disabled })
      }}
    />
  )
}

type DropDownProps = {
  openDrawer: (assessment: Assessment) => void
  openCopyModal: (assessment: Assessment) => void
  assessment: Assessment
}
const Dropdown: React.FC<DropDownProps> = (
  { assessment, openDrawer, openCopyModal },
) => {
  const [confirmation, setConfirmation] = useState(false)
  const { message } = App.useApp()
  const { resource } = useResourceContext<Assessment>()

  const handleOnConfirm = () => resource.removeResource(assessment.id).then(() => {
    message.info(I18n.t('assessments.actions.remove.success_message', { name: assessment.name }))
  }).catch((errors: {base: JSONApiError[]}) => {
    message.error(errors.base[0].title)
  })
  return (
    <>
      <ConditionalDropdown
        menu={getActionsMenuProps({
          assessment, setConfirmation, openDrawer, message, openCopyModal,
        })}
      />
      <ConfirmationModal
        open={confirmation}
        title={I18n.t('assessments.actions.remove.confirm_title')}
        message={I18n.t('assessments.actions.remove.confirm_message', { name: assessment.name })}
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

interface ActionMenuData {
  assessment: Assessment
  setConfirmation: (confirmation: boolean) => void
  openDrawer: (assessment: Assessment) => void
  message: MessageInstance
  openCopyModal: (assessment: Assessment) => void
}

const getActionsMenuProps = ({
  setConfirmation, assessment, openDrawer, message, openCopyModal,
}: ActionMenuData): MenuProps => {
  const { resource } = useResourceContext<Assessment>()
  const navigate = useNavigate()

  const toggleArchive = () => resource.memberAction({
    id: assessment.id,
    action: 'toggle_archive',
    method: 'post',
    responseType: AssessmentTR,
  }).then((response: Assessment) => {
    const type = response.archived ? 'archived' : 'unarchived'
    message.success(I18n.t(`assessments.actions.${type}.success_message`, { name: response.name }))
    resource.setMeta({ ...resource.meta, recordCount: resource.meta?.recordCount ? resource.meta?.recordCount - 1 : 0 })
    resource.setData(resource.data.filter(a => a.id !== assessment.id))
  })

  const restore = () => resource.memberAction({
    id: assessment.id,
    action: 'restore',
    method: 'post',
    responseType: AssessmentTR,
  }).then((response: Assessment) => {
    message.success(I18n.t('assessments.actions.restore.success_message', { name: response.name }))
    resource.setMeta({ ...resource.meta, recordCount: resource.meta?.recordCount ? resource.meta?.recordCount - 1 : 0 })
    resource.setData(resource.data.filter(a => a.id !== assessment.id))
  })

  const exportRawFactorScore = () => resource.memberAction({
    id: assessment.id,
    action: 'export_raw_factor_scores',
    method: 'post',
  }).then(() => {
    message.success(I18n.t('assessments.messages.raw_factor_export_scheduled'))
  })

  const exportNormedResults = () => resource.memberAction({
    id: assessment.id,
    action: 'export_normed_results',
    method: 'post',
  }).then(() => {
    message.success(I18n.t('assessments.messages.norm_results_export_scheduled'))
  })

  const exportRawResult = (with_labels: boolean) => resource.memberAction({
    id: assessment.id,
    action: 'export_raw_results',
    method: 'post',
    body: { with_labels },
  }).then(() => {
    message.success(I18n.t('assessments.messages.raw_results_export_scheduled'))
  })

  const exportExternalScores = () => resource.memberAction({
    id: assessment.id,
    action: 'external_scores',
    method: 'post',
  }).then(() => {
    message.success(I18n.t('assessments.messages.external_scores_export_scheduled'))
  })

  const removeCache = () => resource.memberAction({
    id: assessment.id,
    action: 'remove_cache',
    method: 'post',
  })
    .then(() => {
      message.success(I18n.t('assessments.actions.assessment_cache.success_message', { name: assessment.name }))
    })

  const handleMenuClick = ({ key }) => {
    if (key === 'details') {
      return openDrawer(assessment)
    }
    if (key === 'edit') {
      return navigate(`${settings.urlPrefix}/${assessment.id}/edit`)
    }
    if (key === 'copy') {
      return openCopyModal(assessment)
    }
    if (key === 'archive') {
      return toggleArchive()
    }
    if (key === 'restore') {
      return restore()
    }
    if (key === 'remove') {
      return setConfirmation(true)
    }
    if (key === 'export_with_label') {
      return exportRawResult(true)
    }
    if (key === 'export_without_label') {
      return exportRawResult(false)
    }
    if (key === 'export_raw_factor_score') {
      return exportRawFactorScore()
    }
    if (key === 'export_normed_results') {
      return exportNormedResults()
    }
    if (key === 'remove_cache') {
      return removeCache()
    }
    if (key === 'external_scores') {
      return exportExternalScores()
    }
  }
  const menuItems = [
    {
      key: 'details',
      label: I18n.t('assessments.actions.details'),
    },
    assessment.meta.permissions.manage && {
      key: 'edit',
      label: I18n.t('assessments.actions.edit'),
    },
    {
      key: 'show_usage',
      label: I18n.t('assessments.actions.show_usage'),
      disabled: true,
    },
    assessment.meta.permissions.manage && !assessment.deleted && {
      key: 'copy',
      label: I18n.t('common.actions.copy'),
    },
    assessment.meta.permissions.manage && !assessment.deleted && {
      key: 'remove_cache',
      label: I18n.t('assessments.actions.assessment_cache.remove_cache'),
    },
    assessment.meta.permissions.manage && !assessment.archived && {
      key: 'archive',
      label: I18n.t('common.actions.archive'),
    },
    assessment.meta.permissions.manage && assessment.archived && {
      key: 'archive',
      label: I18n.t('common.actions.unarchive'),
    },
    assessment.meta.permissions.manage && assessment.deleted && {
      key: 'restore',
      label: I18n.t('common.actions.restore'),
    },
    assessment.meta.permissions.manage && {
      key: 'remove',
      label: I18n.t('common.actions.remove'),
    },
    assessment.meta.permissions.exportRawResults && { type: 'divider' },
    assessment.meta.permissions.exportRawResults
     && { key: 'export', label: I18n.t('assessments.actions.export'), disabled: true },
    assessment.meta.permissions.exportRawResults && {
      key: 'export_with_label',
      label: I18n.t('assessments.actions.export_raw_labels'),
    },
    assessment.meta.permissions.exportRawResults && {
      key: 'export_without_label',
      label: I18n.t('assessments.actions.export_raw_without_labels'),
    },
    assessment.meta.permissions.exportRawFactorScores && {
      key: 'export_raw_factor_score',
      label: I18n.t('assessments.actions.export_raw_scores'),
    },
    assessment.meta.permissions.exportNormedResults && {
      key: 'export_normed_results',
      label: I18n.t('assessments.actions.export_normed'),
    },
    assessment.meta.permissions.externalScores && {
      key: 'external_scores',
      label: I18n.t('assessments.actions.external_scores_export'),
    },
  ].filter(m => m) as MenuItem[]

  return ({ items: menuItems, onClick: handleMenuClick })
}
