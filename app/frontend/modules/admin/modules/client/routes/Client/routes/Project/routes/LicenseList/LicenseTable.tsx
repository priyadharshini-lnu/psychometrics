import React from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { RootState } from '~/modules/admin/core/rootReducers'
import { Resource, useResourceContext } from '~/modules/admin/components/Resource'
import { License } from '~/modules/admin/modules/client/core/licenses'
import { openModal } from '~/modules/admin/core/ui/modals'

import { get as getCurrentUser, isSuperAdmin } from '~/core/currentUser'
import { UpdateResource } from 'hooks/useResources/interfaces'
import { MenuProps } from 'antd'
import { Link, useParams } from 'react-router-dom'
import ConditionalDropdown from '~/components/ConditionalDropdown'
import { LicenseFormModal } from './LicenseFormModal'
import Modals from '~/modules/admin/components/Modals'

const { I18n } = window
const MODALS = {
  LicenseFormModal,
}

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
  currentUser
}) => {

  const { resource } = useResourceContext<License>()
  const { projectId } = useParams() as { projectId: string }
  // debugger;

  return (
  <>
    <Resource.Table pagination>
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
      render={(_, { usedNumber, number, projectLicenseDetails }) => (projectLicenseDetails
        ? I18n.t('licenses.used_out_of', {
          used: projectLicenseDetails.usedNumber,
          total: projectLicenseDetails.usageLimit,
        })
        : I18n.t('licenses.used_out_of', {
          used: usedNumber - usedOveruseNumber(usedNumber, number),
          total: number,
        }))}
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
    {isSuperAdmin(currentUser)
          && (
            <Resource.Column<License>
              title={I18n.t('common.column.action')}
              id="actions"
              key="actions"
              render={license => (
                <ConditionalDropdown
                  menu={
                    getActionsMenuProps({
                      license,
                      openModal,
                      updateResource: resource.updateResource,
                      projectId,
                    })
                  }
                />
              )}
            />
          )}
  </Resource.Table>
  <Modals modals={MODALS} />
  </>
)}

interface ActionMenuData {
  license: License
  updateResource: UpdateResource<License>
  openModal: (modalName: string, modalProps?: unknown) => void
  projectId: string
}

const getActionsMenuProps = ({
  license, updateResource, openModal, projectId
}: ActionMenuData): MenuProps => {
  const menuItems = [
    { key: 'edit', label: I18n.t('common.actions.edit') },
    {
      key: 'show',
      label: (
        <Link to={`${license.id}/license_usages?filter[project_id_eq]=${projectId}`}>
          {I18n.t('license_usage.usage_overview')}
        </Link>
      ),
    },
  ]

  const handleMenuClick = ({ key }) => {
    console.log("Handle menu click fired with key:", key);
    if (key === 'edit') {
      return openModal('LicenseFormModal', { license })
    }
  }

  return ({ items: menuItems, onClick: handleMenuClick })
}

function usedOveruseNumber (used: number, total: number): number {
  return total >= used ? 0 : used - total
}

export const ClientLicensesTable = connecter(ClientLicensesTableComponent)
