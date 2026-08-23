import React, { FC } from 'react'
import {
  Button, MenuProps,
} from 'antd'
import { ItemType } from 'antd/es/menu/interface'
import { Link, useParams } from 'react-router-dom'
import dayjs from '~/utils/dayjs'
import { Resource } from '~/modules/admin/components/Resource'
import ConditionalDropdown from '~/components/ConditionalDropdown'
import { InnovationStyles } from '~/modules/admin/modules/campaigns/core/innovationStyles'

type Props = {
  openModal: (modalName: string, modalProps?: unknown) => void
}

const { I18n } = window

export const InnovationStylesTable: FC<Props> = ({ openModal }) => {
  const { dimensionId } = useParams() as { dimensionId: string }
  return (
    <>
      <Resource.Table pagination>
        <Resource.Column<InnovationStyles>
          title={I18n.t('shared.id')}
          id="id"
          sorter
          render={innovation => innovation.id}
          width={100}
          fixed="left"
        />
        <Resource.Column<InnovationStyles>
          title={I18n.t('shared.name')}
          id="name"
          hideable={false}
          sorter
          render={innovation => (
            <Link to={`/admin/dimensions/${dimensionId}/innovation_styles/${innovation.id}/factors`}>
              {innovation.name}
            </Link>
          )}
          width={200}
          fixed="left"
        />
        <Resource.Column<InnovationStyles>
          title={I18n.t('admin.innovation_styles_list_position')}
          id="position"
          sorter
          render={innovation => (
            innovation.position
          )}
          width={200}
        />
        <Resource.Column<InnovationStyles>
          title={I18n.t('shared.created_at')}
          id="created_at"
          sorter
          dataIndex="createdAt"
          render={createdAt => (
            dayjs(createdAt).format('lll')
          )}
          width={200}
        />
        <Resource.Column<InnovationStyles>
          title={I18n.t('shared.last_updated')}
          id="updated_at"
          sorter
          dataIndex="updatedAt"
          render={updatedAt => (
            dayjs(updatedAt).format('lll')
          )}
          width={200}
        />
        <Resource.Column<InnovationStyles>
          title={I18n.t('shared.action')}
          id="action"
          hideable={false}
          render={(_, innovation) => (
            <Dropdown
              innovation={innovation}
              openModal={openModal}
            />
          )}
          width={100}
          fixed="right"
        />
      </Resource.Table>
    </>
  )
}
type DropDownProps = {
  innovation: InnovationStyles,
  openModal: (modalName: string, modalProps?: unknown) => void
}
const Dropdown: React.FC<DropDownProps> = ({ innovation, openModal }) => (
  <ConditionalDropdown
    menu={getActionsMenuProps({ innovation, openModal })}
  />
)

const getActionsMenuProps = ({ innovation, openModal }: DropDownProps): MenuProps => {
  const menuItems = [
    innovation && {
      key: 'edit',
      label: (
        <Button
          type="link"
          onClick={() => openModal('InnovationStylesFormModal', { innovation })}
          className="ps-0"
        >
          {I18n.t('shared.edit')}
        </Button>),
    },
    innovation && {
      key: 'remove',
      label: (
        <Button
          type="link"
          onClick={() => openModal('RemoveInnovationStylesModal', { innovation })}
          className="ps-0"
        >
          {I18n.t('shared.remove')}
        </Button>),
    },
  ].filter(m => m) as ItemType[]

  return ({ items: menuItems })
}
