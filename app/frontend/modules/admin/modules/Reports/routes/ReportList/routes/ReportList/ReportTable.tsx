import React, { useState } from 'react'
import {
  Avatar,
  Button, MenuProps, App,
} from 'antd'
import { ItemType } from 'antd/lib/menu/hooks/useItems'
import { MessageInstance } from 'antd/es/message/interface'
import { Resource, useResourceContext } from '~/modules/admin/components/Resource'
import { Report, ReportTR } from '~/modules/admin/modules/client/core/reports'
import { ConfirmationModal, ResourceAvatar } from '~/glint'
import ConditionalDropdown from '~/components/ConditionalDropdown'
import settings from '../../../../settings'
import { history } from '~/modules/admin/store'
import styles from './ReportTable.less'
import { AssessmentsFilterDropdown } from './AssessmentsFilterDropdown'

const { I18n } = window

type Props = {
  openDrawer: (report: Report) => void
}

export const ReportTable: React.FC<Props> = ({
  openDrawer,
}) => {
  const { resource } = useResourceContext<Report>()
  const providerFilteredValue = resource.getFilteredValue('provider_in') as string[] | undefined
  const assessmentsFilteredValue = resource.getFilteredValue('assessments_id_in') as string[] | undefined

  return (
    <Resource.Table pagination>
      <Resource.Column<Report>
        title={I18n.t('common.column.id')}
        id="id"
        sorter
        render={report => (
          report.provider === 'internal' ? (
            <Button type="link" href={`/administration/reports/${report.id}`}>
              {report.id}
            </Button>
          )
            : <span className={styles.id}>{report.id}</span>
        )}
      />
      <Resource.Column<Report>
        title={I18n.t('common.column.icon')}
        id="icon"
        width={100}
        render={report => (
          <ResourceAvatar
            url={report.iconUrl}
            color={report.iconColor}
            name={report.name}
          />
        )}
      />
      <Resource.Column<Report>
        title={I18n.t('common.column.name')}
        id="name"
        width={400}
        sorter
      />
      <Resource.Column<Report>
        title={I18n.t('common.column.assessments')}
        id="assessments_id"
        filteredValue={assessmentsFilteredValue}
        filterDropdown={AssessmentsFilterDropdown}
        width={100}
        render={report => (
          <Avatar.Group maxCount={2}>
            {report.assessments.map(assessment => (
              <ResourceAvatar
                key={assessment.id}
                url={assessment.iconUrl}
                color={assessment.iconColor}
                name={assessment.name}
              />
            ))}
          </Avatar.Group>
        )}
      />
      <Resource.Column<Report>
        title={I18n.t('common.column.provider')}
        id="provider"
        width={300}
        filters={
          settings.providers.map(
            (t: [number, string]) => ({ text: I18n.t(`reports.fields.provider.${t[1]}`), value: t[0] }),
          )
        }
        filteredValue={providerFilteredValue}
        render={report => I18n.t(`reports.fields.provider.${report.provider}`)}
      />
      <Resource.Column<Report>
        title={I18n.t('common.column.owner')}
        id="owner"
        width={300}
        render={(_, { owner }) => owner?.name}
      />
      <Resource.Column<Report>
        title={I18n.t('common.column.updated_at')}
        id="updated_at"
        width={300}
        sorter
      />
      <Resource.Column<Report>
        title={I18n.t('common.column.action')}
        id="action"
        render={(_, report) => (
          <Dropdown
            report={report}
            openDrawer={openDrawer}
          />
        )}
      />
    </Resource.Table>
  )
}

type DropDownProps = {
  openDrawer: (report: Report) => void
  report: Report
}
const Dropdown: React.FC<DropDownProps> = (
  { report, openDrawer },
) => {
  const [confirmation, setConfirmation] = useState(false)
  const { message } = App.useApp()

  return (
    <ConditionalDropdown
      menu={getActionsMenuProps({
        report, setConfirmation, confirmation, openDrawer, message,
      })}
    />
  )
}

interface ActionMenuProps {
  report: Report
  setConfirmation: (confirmation: boolean) => void
  confirmation: boolean
  openDrawer: (report: Report) => void
  message: MessageInstance
}

const getActionsMenuProps = ({
  setConfirmation, confirmation, report, openDrawer, message,
}: ActionMenuProps): MenuProps => {
  const { resource } = useResourceContext<Report>()

  const handleOnConfirm = () => resource.removeResource(report.id).then(() => {
    message.info(I18n.t('reports.actions.remove.success_message', { name: report.name }))
  }).catch((err) => {
    message.error(err.base[0].title)
  })

  const toggleArchive = () => resource.updateResource({
    id: report.id,
    archived: !report.archived,
  }).then((response: Report) => {
    const type = response.archived ? 'archived' : 'unarchived'
    message.success(I18n.t(`reports.actions.${type}.success_message`, { name: response.name }))
    resource.setMeta({ ...resource.meta, recordCount: resource.meta?.recordCount ? resource.meta?.recordCount - 1 : 0 })
    resource.setData(resource.data.filter(a => a.id !== report.id))
  })

  const restore = () => resource.memberAction({
    id: report.id,
    action: 'restore',
    method: 'post',
    responseType: ReportTR,
  }).then((response: Report) => {
    message.success(I18n.t('reports.actions.restore.success_message', { name: response.name }))
    resource.setMeta({ ...resource.meta, recordCount: resource.meta?.recordCount ? resource.meta?.recordCount - 1 : 0 })
    resource.setData(resource.data.filter(a => a.id !== report.id))
  })

  const copy = () => resource.memberAction({
    id: report.id,
    action: 'copy',
    method: 'post',
    updateStore: true,
    responseType: ReportTR,
  }).then((response: Report) => {
    resource.setMeta({ ...resource.meta, recordCount: resource.meta?.recordCount ? resource.meta?.recordCount + 1 : 0 })
    message.success(I18n.t('reports.actions.copy.success_message', { name: response.name }))
  })

  const menuItems = [
    {
      key: 'details',
      label: (
        <Button type="link" onClick={() => openDrawer(report)} className="ps-0">
          {I18n.t('reports.actions.details')}
        </Button>),
    },
    report.meta.permissions.manage && {
      key: 'edit',
      label: (
        <Button
          type="link"
          onClick={() => history.push(`${settings.urlPrefix}/reports/${report.id}/edit`)}
          className="ps-0"
        >
          {I18n.t('reports.actions.edit')}
        </Button>),
    },
    report.meta.permissions.manage && !report.deleted && {
      key: 'copy',
      label: (
        <Button type="link" onClick={copy} className="ps-0">
          {I18n.t('common.actions.copy')}
        </Button>
      ),
    },
    report.meta.permissions.manage && !report.archived && {
      key: 'archive',
      label: (
        <Button type="link" onClick={toggleArchive} className="ps-0">
          {I18n.t('common.actions.archive')}
        </Button>
      ),
    },
    report.meta.permissions.manage && report.archived && {
      key: 'unarchive',
      label: (
        <Button type="link" onClick={toggleArchive} className="ps-0">
          {I18n.t('common.actions.unarchive')}
        </Button>
      ),
    },
    report.meta.permissions.manage && report.deleted && {
      key: 'restore',
      label: (
        <Button type="link" onClick={restore} className="ps-0">
          {I18n.t('common.actions.restore')}
        </Button>
      ),
    },
    report.meta.permissions.manage && {
      key: 'remove',
      label: (
        <>
          <Button type="link" onClick={() => setConfirmation(true)} className="ps-0">
            {I18n.t('common.actions.remove')}
          </Button>
          {confirmation && (
            <ConfirmationModal
              title={I18n.t('reports.actions.remove.confirm_title')}
              message={I18n.t('reports.actions.remove.confirm_message', { name: report.name })}
              onConfirm={handleOnConfirm}
              onCancel={() => setConfirmation(false)}
            />
          )}
        </>
      ),
    },
  ].filter(m => m) as ItemType[]

  return ({ items: menuItems })
}
