import React from 'react'
import { Link } from 'react-router-dom'
import { connect, ConnectedProps } from 'react-redux'
import { MenuProps, Switch } from 'antd'
import { Resource, useResourceContext } from '~/modules/admin/components/Resource'
import { RootState } from '~/modules/admin/core/rootReducers'
import { License } from '~/modules/admin/modules/client/core/licenses'
import { openModal } from '~/modules/admin/core/ui/modals'
import { get as getCurrentUser, isSuperAdmin } from '~/core/currentUser'
import { UpdateResource } from '~/hooks/useResources/interfaces'
import ConditionalDropdown from '~/components/ConditionalDropdown'


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
  currentUser,
  openModal,
}) => {
  const { resource } = useResourceContext<License>()
  const typeFilteredValue = resource.getFilteredValue('type_in') as string[] | undefined

  return (
    <Resource.Table pagination>
      <Resource.Column<License>
        title={I18n.t('common.column.id')}
        id="id"
        hideable={false}
        dataIndex="id"
        width={150}
        fixed="left"
      />
      <Resource.Column<License>
        title={I18n.t('licenses.report_family')}
        id="report_family_id"
        dataIndex={['reportFamily', 'name']}
        width={300}
        fixed="left"
      />
      <Resource.Column<License>
        title={I18n.t('licenses.enabled')}
        id="disabledStatus"
        dataIndex="disabled"
        width={100}
        render={(_, { id, enabled }) => (
          <Switch checked={enabled} onChange={value => resource.updateResource({ id, enabled: value })} />
        )
        }
      />
      <Resource.Column<License>
        title={I18n.t('licenses.type')}
        id="type"
        dataIndex="type"
        render={(_, { type }) => I18n.t(`licenses.types.${type}`)}
        width={300}
        filters={
          [
            { value: 'common', text: I18n.t('licenses.types.common') },
            { value: 'threesixty', text: I18n.t('licenses.types.threesixty') },
            { value: 'idp', text: I18n.t('licenses.types.idp') },
            { value: 'proctoring', text: I18n.t('licenses.types.proctoring') },
          ]
        }
        filteredValue={typeFilteredValue}
      />
      <Resource.Column<License>
        title={I18n.t('licenses.project_specific')}
        id="isProjectSpecific"
        render={(_, { isProjectSpecific }) => (
          <Switch checked={isProjectSpecific} disabled />
        )}
        width={200}
      />
      <Resource.Column<License>
        title={I18n.t('licenses.used_number')}
        id="used_number"
        dataIndex="usedNumber"
        render={(_, { usedNumber, number }) => I18n.t('licenses.used_out_of', {
          used: usedNumber - usedOveruseNumber(usedNumber, number),
          total: number,
        })}
        width={300}
      />
      <Resource.Column<License>
        title={I18n.t('licenses.overuse_number')}
        id="overuse_number"
        dataIndex="overuseNumber"
        render={(_, {
          overuseNumber, usedNumber, number, isProjectSpecific,
        }) => (isProjectSpecific ? '-' : I18n.t('licenses.used_out_of', {
          used: usedOveruseNumber(usedNumber, number),
          total: overuseNumber,
        }))}
        width={300}
      />
      <Resource.Column<License>
        title={I18n.t('licenses.start_date')}
        id="start_date"
        dataIndex="startDate"
        sorter
        width={300}
      />
      <Resource.Column<License>
        title={I18n.t('licenses.end_date')}
        id="end_date"
        dataIndex="endDate"
        sorter
        width={300}
      />
      {isSuperAdmin(currentUser)
          && (
            <Resource.Column<License>
              title={I18n.t('common.column.action')}
              id="actions"
              hideable={false}
              key="actions"
              render={license => (
                <ConditionalDropdown
                  menu={
                    getActionsMenuProps({
                      license,
                      openModal,
                      updateResource: resource.updateResource,
                    })
                  }
                />
              )}
              width={100}
              fixed="right"
            />
          )}
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
