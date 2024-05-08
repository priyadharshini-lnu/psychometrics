import React, { useState } from 'react'
import {
  Button, Switch, MenuProps, App,
} from 'antd'
import { ItemType } from 'antd/lib/menu/hooks/useItems'
import { MessageInstance } from 'antd/es/message/interface'
import { Resource, useResourceContext } from '~/modules/admin/components/Resource'
import { Assessment, AssessmentTR } from '~/modules/admin/modules/client/core/assessments'
import { ConfirmationModal, ResourceAvatar } from '~/glint'
import ConditionalDropdown from '~/components/ConditionalDropdown'
import { TagList } from '~/modules/admin/components/Resource/TagList'
import settings from '../../settings'
import { history } from '~/modules/admin/store'
import styles from './AssessmentList.less'

const { I18n } = window

interface JSONApiError {
  title: string
  detail?: string
}

type Props = {
  openDrawer: (assessment: Assessment) => void
}

export const AssessmentTable: React.FC<Props> = ({
  openDrawer,
}) => {
  const { resource } = useResourceContext<Assessment>()
  const collectionFilteredValue = resource.getFilteredValue('category_in') as string[] | undefined

  return (
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
              initialTags={(assessment.tagList || []).filter(tag => tag !== null) as string[]}
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
        render={assessment => I18n.t(`assessments.fields.type.${assessment.type}`)}
      />
      <Resource.Column<Assessment>
        title={I18n.t('common.column.category')}
        id="category"
        width={300}
        sorter
        filters={
          settings.categories.map((t: string) => ({ text: I18n.t(`assessments.fields.category.${t}`), value: t }))
        }
        filteredValue={collectionFilteredValue}
        render={assessment => I18n.t(`assessments.fields.category.${assessment.category}`)}
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
          />
        )}
      />
    </Resource.Table>
  )
}

const AssessmentId = ({ assessment }: { assessment: Assessment }) => {
  if (assessment.category === 'agile') {
    return (
      <Button type="link" href={`/administration/assessments/${assessment.id}/agiles`}>
        {assessment.id}
      </Button>
    )
  }

  if (assessment.type === 'common') {
    return (
      <Button type="link" href={`/administration/assessments/${assessment.id}`}>
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
  assessment: Assessment
}
const Dropdown: React.FC<DropDownProps> = (
  { assessment, openDrawer },
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
          assessment, setConfirmation, openDrawer, message,
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
}

const getActionsMenuProps = ({
  setConfirmation, assessment, openDrawer, message,
}: ActionMenuData): MenuProps => {
  const { resource } = useResourceContext<Assessment>()

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

  const copy = () => resource.memberAction({
    id: assessment.id,
    action: 'copy',
    method: 'post',
    updateStore: true,
    responseType: AssessmentTR,
  }).then((response: Assessment) => {
    resource.setMeta({ ...resource.meta, recordCount: resource.meta?.recordCount ? resource.meta?.recordCount + 1 : 0 })
    message.success(I18n.t('assessments.actions.copy.success_message', { name: response.name }))
  })

  const exportRawFactorScore = () => resource.memberAction({
    id: assessment.id,
    action: 'export_raw_factor_scores',
    method: 'get',
  }).then(() => {
    message.success(I18n.t('assessments.messages.raw_factor_export_scheduled'))
  })

  const exportNormedResults = () => resource.memberAction({
    id: assessment.id,
    action: 'export_normed_results',
    method: 'get',
  }).then(() => {
    message.success(I18n.t('assessments.messages.norm_results_export_scheduled'))
  })

  const exportRawResult = (with_labels: boolean) => resource.memberAction({
    id: assessment.id,
    action: 'export_raw_results',
    method: 'get',
    body: { with_lables: with_labels },
  }).then(() => {
    message.success(I18n.t('assessments.messages.raw_results_export_scheduled'))
  })

  const handleMenuClick = ({ key }) => {
    if (key === 'details') {
      return openDrawer(assessment)
    }
    if (key === 'edit') {
      return history.push(`${settings.urlPrefix}/${assessment.id}/edit`)
    }
    if (key === 'copy') {
      return copy()
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
  }
  const menuItems = [
    {
      key: 'details',
      label: (
        <Button type="link" className="ps-0">
          {I18n.t('assessments.actions.details')}
        </Button>),
    },
    assessment.meta.permissions.manage && {
      key: 'edit',
      label: (
        <Button
          type="link"
          className="ps-0"
        >
          {I18n.t('assessments.actions.edit')}
        </Button>),
    },
    {
      key: 'show_usage',
      label: (
        <Button type="link" className="ps-0" disabled>
          {I18n.t('assessments.actions.show_usage')}
        </Button>),
    },
    assessment.meta.permissions.manage && !assessment.deleted && {
      key: 'copy',
      label: (
        <Button type="link" className="ps-0">
          {I18n.t('common.actions.copy')}
        </Button>
      ),
    },
    assessment.meta.permissions.manage && !assessment.archived && {
      key: 'archive',
      label: (
        <Button type="link" className="ps-0">
          {I18n.t('common.actions.archive')}
        </Button>
      ),
    },
    assessment.meta.permissions.manage && assessment.archived && {
      key: 'archive',
      label: (
        <Button type="link" className="ps-0">
          {I18n.t('common.actions.unarchive')}
        </Button>
      ),
    },
    assessment.meta.permissions.manage && assessment.deleted && {
      key: 'restore',
      label: (
        <Button type="link" className="ps-0">
          {I18n.t('common.actions.restore')}
        </Button>
      ),
    },
    assessment.meta.permissions.manage && {
      key: 'remove',
      label: (
        <>
          <Button type="link" className="ps-0">
            {I18n.t('common.actions.remove')}
          </Button>
        </>
      ),
    },
    assessment.meta.permissions.exportRawResults && { type: 'divider' },
    assessment.meta.permissions.exportRawResults && { key: 'export', label: 'Export' },
    assessment.meta.permissions.exportRawResults && {
      key: 'export_with_label',
      label: (
        <Button type="link" className="ps-0">
          {I18n.t('assessments.actions.export_raw_labels')}
        </Button>
      ),
    },
    assessment.meta.permissions.exportRawResults && {
      key: 'export_without_label',
      label: (
        <Button type="link" className="ps-0">
          {I18n.t('assessments.actions.export_raw_without_labels')}
        </Button>
      ),
    },
    assessment.meta.permissions.exportRawFactorScores && {
      key: 'export_raw_factor_score',
      label: (
        <Button type="link" className="ps-0">
          {I18n.t('assessments.actions.export_raw_scores')}
        </Button>
      ),
    },
    assessment.meta.permissions.exportNormedResults && {
      key: 'export_normed_results',
      label: (
        <Button type="link" className="ps-0">
          {I18n.t('assessments.actions.export_normed')}
        </Button>
      ),
    },
  ].filter(m => m) as ItemType[]

  return ({ items: menuItems, onClick: handleMenuClick })
}
