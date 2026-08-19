import React, { useState } from 'react'
import {
  Avatar,
  Button, MenuProps, App, Switch,
} from 'antd'
import { MessageInstance } from 'antd/es/message/interface'
import { useNavigate } from 'react-router-dom'
import { ConnectedProps, connect } from 'react-redux'
import { MenuItem } from '~/interfaces/Antd'
import { Resource, useResourceContext } from '~/modules/admin/components/Resource'
import { Report, ReportTR } from '~/modules/admin/modules/client/core/reports'
import { ConfirmationModal, ResourceAvatar } from '~/glint'
import ConditionalDropdown from '~/components/ConditionalDropdown'
import settings from '../../../../settings'
import styles from './ReportTable.less'
import { AssessmentsFilterDropdown } from './AssessmentsFilterDropdown'
import CopyReportFormModal from './CopyReportFormModal'
import Modals from '~/modules/admin/components/Modals/'
import { openModal } from '~/modules/admin/core/ui/modals'
import { TagList } from '~/modules/admin/components/Resource/TagList'
import { baseErrorMessage } from '~/hooks/useResources/utils'

const { I18n } = window

const MODALS = {
  CopyReportFormModal,
}

const connecter = connect(
  () => ({ }),
  {
    openModal,
  },
)

type PropsFromRedux = ConnectedProps<typeof connecter>

type Props = PropsFromRedux & {
  openDrawer: (report: Report) => void
}

const ReportTableCompnent: React.FC<Props> = ({
  openDrawer,
  openModal,
}) => {
  const { resource } = useResourceContext<Report>()
  const providerFilteredValue = resource.getFilteredValue('provider_in') as string[] | undefined
  const assessmentsFilteredValue = resource.getFilteredValue('assessments_id_in') as string[] | undefined


  return (
    <>
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
          minWidth={100}
        />
        <Resource.Column<Report>
          id="disabled"
          title={I18n.t('common.column.active')}
          render={report => <ActiveSwitch report={report} />}
          minWidth={100}
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
          render={(_, report) => (
            <>
              <div>{report.name}</div>
              <TagList
                initialTags={report.tagList as string[]}
                config={{
                  editable: false,
                }}
              />
            </>
          )}
        />
        <Resource.Column<Report>
          title={I18n.t('common.column.assessments')}
          id="assessments_id"
          filteredValue={assessmentsFilteredValue}
          filterDropdown={AssessmentsFilterDropdown}
          render={report => (
            <Avatar.Group max={{ count: 2 }}>
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
          minWidth={150}
        />
        <Resource.Column<Report>
          title={I18n.t('common.column.provider')}
          id="provider"
          width={300}
          filters={
            settings.providers.map(
              (t: [number, string]) => ({
                text: I18n.t(`admin.${t[1]}`),
                value: t[0],
              }),
            )
        }
          filteredValue={providerFilteredValue}
          render={report => I18n.t(`admin.${report.provider}`)}
        />
        <Resource.Column<Report>
          title={I18n.t('common.column.owner')}
          id="owner"
          width={300}
          render={(_, { owner }) => owner?.name || I18n.t('admin.platform_owner')}
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
              openCopyModal={(report) => {
                openModal('CopyReportFormModal', { report })
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

export const ReportTable = connecter(ReportTableCompnent)

const ActiveSwitch: React.FC<{ report: Report }> = ({ report }) => {
  const { resource } = useResourceContext<Report>()
  return (
    <Switch
      checked={!report.disabled}
      onChange={() => {
        resource.updateResource({ id: report.id, disabled: !report.disabled })
      }}
    />
  )
}

type DropDownProps = {
  openDrawer: (report: Report) => void
  openCopyModal: (report: Report) => void,
  report: Report
}
const Dropdown: React.FC<DropDownProps> = (
  { report, openDrawer, openCopyModal },
) => {
  const [confirmation, setConfirmation] = useState(false)
  const { message } = App.useApp()
  const { resource } = useResourceContext<Report>()

  const handleOnConfirm = () => resource.removeResource(report.id).then(() => {
    message.info(I18n.t('reports.actions.remove.success_message', { name: report.name }))
  }).catch((err) => {
    message.error(baseErrorMessage(err))
  })

  return (
    <>
      <ConditionalDropdown
        menu={getActionsMenuProps({
          report, setConfirmation, openDrawer, message, openCopyModal,
        })}
      />
      <ConfirmationModal
        open={confirmation}
        title={I18n.t('reports.actions.remove.confirm_title')}
        message={I18n.t('reports.actions.remove.confirm_message', { name: report.name })}
        onConfirm={handleOnConfirm}
        close={() => setConfirmation(false)}
      />
    </>

  )
}

interface ActionMenuProps {
  report: Report
  setConfirmation: (confirmation: boolean) => void
  openDrawer: (report: Report) => void
  openCopyModal: (report: Report) => void,
  message: MessageInstance
}

const getActionsMenuProps = ({
  setConfirmation, report, openDrawer, message, openCopyModal,
}: ActionMenuProps): MenuProps => {
  const { resource } = useResourceContext<Report>()
  const navigate = useNavigate()

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
          onClick={() => navigate(`${settings.urlPrefix}/reports/${report.id}/edit`)}
          className="ps-0"
        >
          {I18n.t('reports.actions.edit')}
        </Button>),
    },
    report.meta.permissions.manage && !report.deleted && {
      key: 'copy',
      label: (
        <Button type="link" onClick={() => openCopyModal(report)} className="ps-0">
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
        </>
      ),
    },
  ].filter(m => m) as MenuItem[]

  return ({ items: menuItems })
}
