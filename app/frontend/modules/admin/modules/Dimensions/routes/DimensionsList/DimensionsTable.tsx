import React, { FC } from 'react'
import {
  MenuProps,
  message,
  Switch,
} from 'antd'
import { ItemType } from 'antd/es/menu/interface'
import * as t from 'io-ts'
import { Link } from 'react-router-dom'
import { Dimension, DimensionTR } from '~/modules/admin/modules/client/core/dimensions'
import dayjs from '~/utils/dayjs'
import { Resource, useResourceContext } from '~/modules/admin/components/Resource'
import ConditionalDropdown from '~/components/ConditionalDropdown'

type Props = {
  openModal: (modalName: string, modalProps?: unknown) => void
}

const { I18n } = window
const ExportDimensionResponseTR = t.type({ status: t.string })

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
      suffixes.push(I18n.t('admin.navigation_innovation_styles'))
    }
    if (occupationsEnabled) {
      suffixes.push(I18n.t('admin.navigation_occupations'))
    }

    return suffixes.length ? `${name} (${suffixes.join(' / ')})` : name
  }

  return (
    <>
      <Resource.Table pagination>
        <Resource.Column<Dimension>
          title={I18n.t('shared.id')}
          id="id"
          sorter
          render={dimension => dimension?.id && (
            <a href={`/admin/dimensions/${dimension.id}/factors`}>{dimension.id}</a>
          )}
          width={100}
        />
        <Resource.Column<Dimension>
          title={I18n.t('shared.active')}
          id="disabled"
          sorter
          render={dimension => <ActiveSwitch dimension={dimension} />}
          width={100}
        />
        <Resource.Column<Dimension>
          title={I18n.t('shared.name')}
          id="name"
          sorter
          render={renderColumnName}
          width={300}
        />
        <Resource.Column<Dimension>
          title={I18n.t('shared.owner')}
          id="owner"
          render={(dimension) => {
            const ownerName = dimension.owner?.name
            const ownerId = dimension.owner?.id

            if (ownerName && ownerId) {
              return (
                <Link to={`/admin/clients/${ownerId}`}>
                  {ownerName}
                </Link>
              )
            }

            return I18n.t('admin.tte')
          }}
          width={300}
        />
        <Resource.Column<Dimension>
          title={I18n.t('shared.created_at')}
          id="created_at"
          dataIndex="createdAt"
          sorter
          render={createdAt => (
            dayjs(createdAt).format('lll')
          )}
          width={200}
        />
        <Resource.Column<Dimension>
          title={I18n.t('shared.last_updated')}
          id="updated_at"
          dataIndex="updatedAt"
          sorter
          render={updatedAt => (
            dayjs(updatedAt).format('lll')
          )}
          width={200}
        />
        <Resource.Column<Dimension>
          title={I18n.t('shared.action')}
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

const Dropdown: React.FC<DropDownProps> = ({ dimension, openModal }) => {
  const { resource } = useResourceContext<Dimension>()

  const copyDimension = async () => {
    await resource.memberAction({
      id: dimension.id,
      action: 'copy',
      method: 'post',
      updateStore: true,
      responseType: DimensionTR,
    })
  }

  const exportDimension = async () => {
    try {
      await resource.memberAction({
        id: dimension.id,
        action: 'export_json',
        method: 'post',
        responseType: ExportDimensionResponseTR,
      })
      message.success(
        I18n.t('admin.dimensions_export_json_successfully', { name: dimension.name }),
      )
    } catch (error) {
      message.error(I18n.t('shared.error'))
    }
  }

  return (
    <ConditionalDropdown
      menu={getActionsMenuProps({
        dimension,
        openModal,
        copyDimension,
        exportDimension,
      })}
    />
  )
}

const getActionsMenuProps = ({
  dimension,
  openModal,
  copyDimension,
  exportDimension,
}: DropDownProps & {
  copyDimension: () => Promise<void>
  exportDimension: () => Promise<void>
}): MenuProps => {
  const canCopy = dimension?.meta?.permissions?.copy
  const canExportJson = dimension?.meta?.permissions?.exportJson

  const menuItems = [
    dimension && {
      key: 'edit',
      label: I18n.t('shared.edit'),
      onClick: () => openModal('DimensionsFormModal', { dimension }),
    },
    dimension && {
      key: 'remove',
      label: I18n.t('shared.remove'),
      onClick: () => openModal('RemoveDimensionModal', { dimension }),
    },
    canCopy && {
      key: 'copy',
      label: I18n.t('shared.copy'),
      onClick: copyDimension,
    },
    canExportJson && {
      key: 'export_json',
      label: I18n.t('admin.dimensions_resource_tooltips_export_json'),
      onClick: exportDimension,
    },
  ].filter(m => m) as ItemType[]

  return ({ items: menuItems })
}

const ActiveSwitch: React.FC<{ dimension: Dimension }> = ({ dimension }) => {
  const { resource } = useResourceContext<Dimension>()
  return (
    <Switch
      checked={!dimension.disabled}
      onChange={() => {
        resource.updateResource({ id: dimension.id, disabled: !dimension.disabled })
      }}
    />
  )
}
