import React, { FC } from 'react'
import {
  Button, MenuProps, Typography,
} from 'antd'
import { ItemType } from 'antd/es/menu/interface'
import dayjs from '~/utils/dayjs'
import { Resource } from '~/modules/admin/components/Resource'
import ConditionalDropdown from '~/components/ConditionalDropdown'
import { Occupation } from '~/modules/admin/modules/campaigns/core/occupations'
import { OccupationFactorsDrawer } from './OccupationFactorsDrawer'

type Props = {
  openModal: (modalName: string, modalProps?: unknown) => void
}

const { I18n } = window

export const OccupationsTable: FC<Props> = ({ openModal }) => {
  const [selectedOccupationId, setSelectedOccupationId] = React.useState<number | null>(null)

  const handleOccupationFactorsDrawer = (occupationId: number | null) => {
    setSelectedOccupationId(occupationId)
  }

  return (
    <>
      <Resource.Table pagination>
        <Resource.Column<Occupation>
          title={I18n.t('common.column.id')}
          id="id"
          sorter
          render={occupation => occupation.id}
          width={100}
        />
        <Resource.Column<Occupation>
          title={I18n.t('common.column.name')}
          id="name"
          sorter
          render={occupation => (
            <Typography.Link onClick={() => handleOccupationFactorsDrawer(
              occupation.id,
            )}
            >
              {occupation.name}
            </Typography.Link>
          )}
          width={200}
        />
        <Resource.Column<Occupation>
          title={I18n.t('common.column.created_at')}
          id="created_at"
          dataIndex="createdAt"
          render={createdAt => (
            dayjs(createdAt).format('lll')
          )}
          width={200}
        />
        <Resource.Column<Occupation>
          title={I18n.t('common.column.updated_at')}
          id="updated_at"
          dataIndex="updatedAt"
          render={updatedAt => (
            dayjs(updatedAt).format('lll')
          )}
          width={200}
        />
        <Resource.Column<Occupation>
          title={I18n.t('common.column.action')}
          id="action"
          render={(_, occupation) => (
            <Dropdown
              occupation={occupation}
              openModal={openModal}
            />
          )}
          width={100}
        />
      </Resource.Table>
      <OccupationFactorsDrawer
        open={selectedOccupationId !== null}
        handleClose={() => handleOccupationFactorsDrawer(null)}
        occupationId={selectedOccupationId}
      />
    </>
  )
}

type DropDownProps = {
  occupation: Occupation,
  openModal: (modalName: string, modalProps?: unknown) => void
}
const Dropdown: React.FC<DropDownProps> = ({ occupation, openModal }) => (
  <ConditionalDropdown
    menu={getActionsMenuProps({ occupation, openModal })}
  />
)

const getActionsMenuProps = ({ occupation, openModal }: DropDownProps): MenuProps => {
  const menuItems = [
    occupation && {
      key: 'edit',
      label: (
        <Button
          type="link"
          onClick={() => openModal('OccupationsFormModal', { occupation })}
          className="ps-0"
        >
          {I18n.t('common.actions.edit')}
        </Button>),
    },
    occupation && {
      key: 'remove',
      label: (
        <Button
          type="link"
          onClick={() => openModal('RemoveOccupationsModal', { occupation })}
          className="ps-0"
        >
          {I18n.t('common.actions.remove')}
        </Button>),
    },
  ].filter(m => m) as ItemType[]

  return ({ items: menuItems })
}
