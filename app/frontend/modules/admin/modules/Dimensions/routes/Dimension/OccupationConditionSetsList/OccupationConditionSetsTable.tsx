import React from 'react'
import { Button, MenuProps } from 'antd'
import { useDispatch } from 'react-redux'
import { Resource } from '~/modules/admin/components/Resource'
import type { OccupationConditionSet } from './interfaces'
import ConditionalDropdown from '~/components/ConditionalDropdown'
import { openModal } from '~/modules/admin/core/ui/modals'

const { I18n } = window

export const OccupationConditionSetsTable: React.FC = () => (
  <Resource.Table pagination>
    <Resource.Column
      id="id"
      title="ID"
      dataIndex="id"
      key="id"
    />
    <Resource.Column
      id="name"
      title="Name"
      dataIndex="name"
      key="name"
    />
    <Resource.Column<OccupationConditionSet>
      id="actions"
      title="Actions"
      key="actions"
      render={(_, record) => (
        <Dropdown occupationConditionSet={record} />
      )}
    />
  </Resource.Table>
)

type DropDownProps = {
  occupationConditionSet: OccupationConditionSet,
  openModal: (modalName: string, modalProps?: unknown) => void
}
const Dropdown: React.FC<Omit<DropDownProps, 'openModal'>> = ({ occupationConditionSet }) => {
  const dispatch = useDispatch()
  const handleOpenModal = (modalName: string, modalProps?: unknown) => {
    dispatch(openModal(modalName, modalProps))
  }
  return (
    <ConditionalDropdown
      menu={getActionsMenuProps({ occupationConditionSet, openModal: handleOpenModal })}
    />
  )
}

const getActionsMenuProps = ({ occupationConditionSet, openModal }: DropDownProps): MenuProps => {
  const menuItems = [
    {
      key: 'edit',
      label: (
        <Button
          type="link"
          onClick={() => openModal('OccupationConditionSetsFormModal', { occupationConditionSet })}
          className="ps-0"
        >
          {I18n.t('common.actions.edit')}
        </Button>),
    },
    {
      key: 'copy',
      label: (
        <Button
          type="link"
          onClick={() => openModal('OccupationConditionSetsFormModal', { occupationConditionSet, copying: true })}
          className="ps-0"
        >
          {I18n.t('common.actions.copy')}
        </Button>),
    },
    {
      key: 'remove',
      label: (
        <Button
          type="link"
          onClick={() => openModal('RemoveOccupationConditionSetsFormModal', { occupationConditionSet })}
          className="ps-0"
        >
          {I18n.t('common.actions.remove')}
        </Button>),
    },
  ]

  return ({ items: menuItems })
}
