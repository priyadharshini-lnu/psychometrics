import React from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { MenuProps, Switch } from 'antd'
import { Link, useParams } from 'react-router-dom'
import { RootState } from '~/modules/admin/core/rootReducers'
import { Resource } from '~/modules/admin/components/Resource'
import { License } from '~/modules/admin/modules/client/core/licenses'
import { openModal } from '~/modules/admin/core/ui/modals'
import User from '~/modules/admin/modules/campaigns/interfaces/User'


import { get as getCurrentUser } from '~/core/currentUser'
import ConditionalDropdown from '~/components/ConditionalDropdown'

const { I18n } = window

const connector = connect(
  (state: RootState) => ({
    currentUser: getCurrentUser(state) as User,
    clientId: state.project.clientId,
  }),
  {
    openModal,
  },
)

type PropsFromRedux = ConnectedProps<typeof connector>
type Props = PropsFromRedux

const ClientLicensesTableComponent: React.FC<Props> = ({
  currentUser, openModal, clientId,
}) => {
  const { projectId } = useParams() as { projectId: string }

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
          title={I18n.t('licenses.project_specific')}
          id="sProjectSpecific"
          dataIndex="sProjectSpecific"
          render={(_, { isProjectSpecific }) => (
            <Switch checked={isProjectSpecific} disabled />
          )
          }
        />
        <Resource.Column<License>
          title={I18n.t('licenses.project_usage')}
          id="usage_limit"
          render={(_, { projectLicenseDetails }) => (projectLicenseDetails
            ? I18n.t('licenses.used_out_of', {
              used: projectLicenseDetails.usedNumber,
              total: projectLicenseDetails.usageLimit,
            })
            : '-')}
        />
        <Resource.Column<License>
          title={I18n.t('licenses.client_usage')}
          id="used_number"
          render={(_, { usedNumber, number }) => (
            I18n.t('licenses.used_out_of', {
              used: usedNumber - usedOveruseNumber(usedNumber, number),
              total: number,
            })
          )}
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
                  projectId,
                  currentUser,
                  clientId,
                })
              }
            />
          )}
        />
      </Resource.Table>
    </>
  )
}

interface ActionMenuData {
  license: License
  openModal: (modalName: string, modalProps?: unknown) => void
  projectId: string
  currentUser: User
  clientId: number
}

const getActionsMenuProps = ({
  license, openModal, currentUser, clientId, projectId,
}: ActionMenuData): MenuProps => {
  const menuItems = [
    {
      key: 'show',
      label: (
        <Link to={`/admin/clients/${clientId}/licenses/${license.id}/license_usages?filter[project_id]=${projectId}`}>
          {I18n.t('license_usage.usage_overview')}
        </Link>
      ),
    },
  ]
  license.projectLicenseDetails && currentUser.permissions.manageProjectLicenses && menuItems.push({
    key: 'edit',
    label: I18n.t('common.actions.edit'),
  })

  const handleMenuClick = ({ key }) => {
    if (key === 'edit') {
      openModal('LicenseFormModal', { license })
    }
  }

  return ({ items: menuItems, onClick: handleMenuClick })
}

function usedOveruseNumber (used: number, total: number): number {
  return total >= used ? 0 : used - total
}

export const ClientLicensesTable = connector(ClientLicensesTableComponent)
