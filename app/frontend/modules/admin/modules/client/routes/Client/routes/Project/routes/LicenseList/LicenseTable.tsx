import React from 'react'
import { Link } from 'react-router-dom'
import { connect, ConnectedProps } from 'react-redux'
import { MenuProps, Switch } from 'antd'
import { RootState } from '~/modules/admin/core/rootReducers'
import { Resource, useResourceContext } from '~/modules/admin/components/Resource'
import { License } from '~/modules/admin/modules/client/core/licenses'
import { openModal } from '~/modules/admin/core/ui/modals'
import { get as getCurrentUser, isSuperAdmin } from '~/core/currentUser'
import { UpdateResource } from '~/hooks/useResources/interfaces'

const { I18n } = window

const connecter = connect(
  (state: RootState) => ({
    currentUser: getCurrentUser(state),
  }),
  {
    openModal,
  },
)

type PropsFromRedux = ConnectedProps<typeof connecter>
type Props = PropsFromRedux

const ClientLicensesTableComponent: React.FC<Props> = ({
  openModal,
}) => {
  // const { resource } = useResourceContext<License>()

  return (
    <Resource.Table pagination>
      <Resource.Column<License>
        title={I18n.t('common.column.id')}
        id="id"
        dataIndex="id"
        width={30}
      />
      <Resource.Column<License>
        title={I18n.t('licenses.enabled')}
        id="disabledStatus"
        dataIndex="disabled"
        width={30}
        render={(_, license) => (
          <Switch
            checked={license.projectLicenseDetails?.enabled ?? false}
            onClick={(checked, e) => {
              e.stopPropagation()
              openModal('LicenseFormModal', { license })
            }}
          />
        )}
      />

      <Resource.Column<License>
        title={I18n.t('licenses.report_family')}
        id="report_family_id"
        dataIndex={['reportFamily', 'name']}
      />
      <Resource.Column<License>
        title={I18n.t('licenses.type')}
        id="type"
        dataIndex="type"
        render={(_, { type }) => I18n.t(`licenses.types.${type}`)}
      />
      <Resource.Column<License>
        title={I18n.t('licenses.used_number')}
        id="used_number"
        dataIndex="usedNumber"
        render={(_, { projectLicenseDetails }) => projectLicenseDetails ? I18n.t('licenses.used_out_of', {
          used: projectLicenseDetails.usedNumber,
          total: projectLicenseDetails.usageLimit,
        }) : '-'}
      />
      <Resource.Column<License>
        title={I18n.t('licenses.start_date')}
        id="start_date"
        dataIndex="startDate"
        sorter
      />
      <Resource.Column<License>
        title={I18n.t('licenses.end_date')}
        id="end_date"
        dataIndex="endDate"
        sorter
      />
    </Resource.Table>
  )
}

interface ActionMenuData {
  license: License
  updateResource: UpdateResource<License>
  openModal: (modalName: string, modalProps: unknown) => void
}

const getActionsMenuProps = ({
  license, updateResource, openModal,
}: ActionMenuData): MenuProps => {
  const menuItems = [
    { key: 'edit', label: I18n.t('common.actions.edit') },
    {
      key: 'show',
      label: (
        <Link to={`${license.id}/license_usages`}>
          {I18n.t('license_usage.usage_overview')}
        </Link>
      ),
    },
  ]

  const handleMenuClick = ({ key }) => {
    if (key === 'edit') {
      return openModal('LicenseFormModal', {
        updateLicense: updateResource, license,
      })
    }
  }

  return ({ items: menuItems, onClick: handleMenuClick })
}

function usedOveruseNumber (used: number, total: number): number {
  return total >= used ? 0 : used - total
}

export const ClientLicensesTable = connecter(ClientLicensesTableComponent)
