import React, { FC } from 'react'
import {
  Button, MenuProps,
  Switch,
} from 'antd'
import { ItemType } from 'antd/lib/menu/interface'
import { Dimension } from '~/modules/admin/modules/client/core/dimensions'
import dayjs from '~/utils/dayjs'
import { Resource, useResourceContext } from '~/modules/admin/components/Resource'
import ConditionalDropdown from '~/components/ConditionalDropdown'

type Props = {
  openModal: (modalName: string, modalProps?: unknown) => void
}

const { I18n } = window

export const DimensionsTable: FC<Props> = ({ openModal }) => {
  const renderColumnName = ({
    name,
    innovationStylesEnabled,
    occupationsEnabled,
  }: {
    name: string;
    innovationStylesEnabled?: boolean;
    occupationsEnabled?: boolean;
  }): string => {
    const suffixes: string[] = []

    if (innovationStylesEnabled) {
      suffixes.push(I18n.t('administration.navigation.innovation_styles'))
    }
    if (occupationsEnabled) {
      suffixes.push(I18n.t('administration.navigation.occupations'))
    }

    return suffixes.length ? `${name} (${suffixes.join(' / ')})` : name
  }

  return (
    <>
      <Resource.Table pagination>
        <Resource.Column<Dimension>
          title={I18n.t('common.column.id')}
          id="id"
          sorter
          render={dimension => dimension?.id && (
            <a href={`/admin/dimensions/${dimension.id}/factors`}>{dimension.id}</a>
          )}
          width={100}
        />
        <Resource.Column<Dimension>
          title={I18n.t('common.column.active')}
          id="id"
          sorter
          render={dimension => <ActiveSwitch dimension={dimension} />}
          width={100}
        />
        <Resource.Column<Dimension>
          title={I18n.t('common.column.name')}
          id="name"
          sorter
          render={renderColumnName}
          width={300}
        />
        <Resource.Column<Dimension>
          title={I18n.t('common.column.owner')}
          id="owner"
          sorter
          render={dimension => (
            dimension.owner?.name
          )}
          width={300}
        />
        <Resource.Column<Dimension>
          title={I18n.t('common.column.created_at')}
          id="created_at"
          dataIndex="createdAt"
          render={createdAt => (
            dayjs(createdAt).format('lll')
          )}
          width={200}
        />
        <Resource.Column<Dimension>
          title={I18n.t('common.column.updated_at')}
          id="updated_at"
          dataIndex="updatedAt"
          render={updatedAt => (
            dayjs(updatedAt).format('lll')
          )}
          width={200}
        />
        <Resource.Column<Dimension>
          title={I18n.t('common.column.action')}
          id="action"
          render={(_, dimension) => (
            <Dropdown
              dimension={dimension}
              openModal={openModal}
            />
          )}
          width={100}
        />
      </Resource.Table>
    </>
  )
}

type DropDownProps = {
  dimension: Dimension,
  openModal: (modalName: string, modalProps?: unknown) => void
}
const Dropdown: React.FC<DropDownProps> = ({ dimension, openModal }) => (
  <ConditionalDropdown
    menu={getActionsMenuProps({ dimension, openModal })}
  />
)

const getActionsMenuProps = ({ dimension, openModal }: DropDownProps): MenuProps => {
  const menuItems = [
    dimension && {
      key: 'edit',
      label: (
        <Button
          type="link"
          onClick={() => openModal('DimensionsFormModal', { dimension })}
          className="ps-0"
        >
          {I18n.t('common.actions.edit')}
        </Button>),
    },
    dimension && {
      key: 'remove',
      label: (
        <Button
          type="link"
          onClick={() => openModal('RemoveDimensionModal', { dimension })}
          className="ps-0"
        >
          {I18n.t('common.actions.remove')}
        </Button>),
    },
    {
      key: 'copy',
      label: (
        <Button
          type="link"
          className="ps-0"
        >
          {I18n.t('common.actions.copy')}
        </Button>),
    },
  ].filter(m => m) as ItemType[]

  return ({ items: menuItems })
}

const ActiveSwitch: React.FC<{ dimension: Dimension }> = ({ dimension }) => {
  const { resource } = useResourceContext<Dimension>()
  return (
    <Switch
      checked={dimension.disabled}
      onChange={() => {
        resource.updateResource({ id: dimension.id, disabled: !dimension.disabled })
      }}
    />
  )
}
