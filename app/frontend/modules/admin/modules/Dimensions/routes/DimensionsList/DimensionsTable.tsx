import React, { FC } from 'react'
import {
  MenuProps,
  message,
  Switch,
} from 'antd'
import { ItemType } from 'antd/es/menu/interface'
import * as t from 'io-ts'
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
          id="disabled"
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
          render={dimension => (
            dimension.owner?.name
          )}
          width={300}
        />
        <Resource.Column<Dimension>
          title={I18n.t('common.column.created_at')}
          id="created_at"
          dataIndex="createdAt"
          sorter
          render={createdAt => (
            dayjs(createdAt).format('lll')
          )}
          width={200}
        />
        <Resource.Column<Dimension>
          title={I18n.t('common.column.updated_at')}
          id="updated_at"
          dataIndex="updatedAt"
          sorter
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
        I18n.t('administration.dimensions.export_json.successfully', { name: dimension.name }),
      )
    } catch (error) {
      message.error(I18n.t('common.error'))
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
      label: I18n.t('common.actions.edit'),
      onClick: () => openModal('DimensionsFormModal', { dimension }),
    },
    dimension && {
      key: 'remove',
      label: I18n.t('common.actions.remove'),
      onClick: () => openModal('RemoveDimensionModal', { dimension }),
    },
    canCopy && {
      key: 'copy',
      label: I18n.t('common.actions.copy'),
      onClick: copyDimension,
    },
    canExportJson && {
      key: 'export_json',
      label: I18n.t('administration.dimensions.resource.tooltips.export_json'),
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
