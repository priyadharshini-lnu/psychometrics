import React, { useState } from 'react'
import {
  Button, MenuProps, message,
} from 'antd'
import { ItemType } from 'antd/lib/menu/hooks/useItems'
import { Link } from 'react-router-dom'
import { Resource, useResourceContext } from '~/modules/admin/components/Resource'
import { ReportBundle } from '~/modules/admin/modules/client/core/reports'
import { ConfirmationModal } from '~/glint'
import ConditionalDropdown from '~/components/ConditionalDropdown'

const { I18n } = window

type Props = {
  toggleModal: (reportBundle: ReportBundle) => void
}

export const ReportBundleTable: React.FC<Props> = ({
  toggleModal,
}) => (
  <Resource.Table pagination>
    <Resource.Column<ReportBundle>
      title={I18n.t('common.column.id')}
      id="id"
      sorter
      render={reportBundle => (
        <Link to={`/administration/report_families/${reportBundle.id}/reports`}>
          {reportBundle.id}
        </Link>
      )}
    />
    <Resource.Column<ReportBundle>
      title={I18n.t('common.column.name')}
      id="name"
      width={400}
      sorter
    />
    <Resource.Column<ReportBundle>
      title={I18n.t('common.column.created_at')}
      id="created_at"
      width={300}
      sorter
    />
    <Resource.Column<ReportBundle>
      title={I18n.t('common.column.updated_at')}
      id="updated_at"
      width={300}
      sorter
    />
    <Resource.Column<ReportBundle>
      title={I18n.t('common.column.action')}
      id="action"
      render={(_, reportBundle) => (
        <Dropdown
          reportBundle={reportBundle}
          toggleModal={toggleModal}
        />
      )}
    />
  </Resource.Table>
)

type DropDownProps = {
  reportBundle: ReportBundle
  toggleModal: (reportBundle: ReportBundle) => void
}
const Dropdown: React.FC<DropDownProps> = (
  { reportBundle, toggleModal },
) => {
  const [confirmation, setConfirmation] = useState(false)
  return (
    <ConditionalDropdown
      menu={getActionsMenuProps({
        reportBundle, setConfirmation, confirmation, toggleModal,
      })}
    />
  )
}

interface ActionMenuProps {
  reportBundle: ReportBundle
  setConfirmation: (confirmation: boolean) => void
  confirmation: boolean
  toggleModal: (reportBundle: ReportBundle) => void
}

const getActionsMenuProps = ({
  setConfirmation, confirmation, reportBundle, toggleModal,
}: ActionMenuProps): MenuProps => {
  const { resource } = useResourceContext<ReportBundle>()

  const handleOnConfirm = () => resource.removeResource(reportBundle.id).then(() => {
    message.info(I18n.t('report_bundles.actions.remove.success_message', { name: reportBundle.name }))
  }).catch((err) => {
    message.error(err.base[0].title)
  })

  const menuItems = [
    reportBundle.meta.permissions.manage && {
      key: 'edit',
      label: (
        <Button
          type="link"
          onClick={() => toggleModal(reportBundle)}
          className="ps-0"
        >
          {I18n.t('common.actions.edit')}
        </Button>),
    },
    reportBundle.meta.permissions.manage && {
      key: 'remove',
      label: (
        <>
          <Button type="link" onClick={() => setConfirmation(true)} className="ps-0">
            {I18n.t('common.actions.remove')}
          </Button>
          {confirmation && (
            <ConfirmationModal
              title={I18n.t('report_bundles.actions.remove.confirm_title')}
              message={I18n.t('report_bundles.actions.remove.confirm_message', { name: reportBundle.name })}
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
