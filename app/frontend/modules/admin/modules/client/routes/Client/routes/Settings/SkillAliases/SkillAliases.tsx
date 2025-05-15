import React from 'react'
import { useParams } from 'react-router-dom'
import {
  Button, message, MenuProps, App,
} from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { ConnectedProps, connect } from 'react-redux'
import { MenuItem } from '~/interfaces/Antd'
import { SkillAliasForm } from './SkillAliasForm'
import { Resource, useResourceContext } from '~/modules/admin/components/Resource'
import Modals from '~/modules/admin/components/Modals'
import { openModal } from '~/modules/admin/core/ui/modals'
import ConditionalDropdown from '~/components/ConditionalDropdown'
import { SkillAliasTR, SkillAlias } from '~/modules/admin/modules/client/core/skillAlias'

const { I18n } = window

const connector = connect(
  null,
  { openModal },
)
type PropsFromRedux = ConnectedProps<typeof connector>
type Props = PropsFromRedux

const SkillAliasesList: React.FC<Props> = ({ openModal }) => {
  const { clientId } = useParams() as { clientId: string }
  const config = {
    responseType: SkillAliasTR,
    basePath: `clients/${clientId}`,
    apiConfig: {
      include: ['client', 'skill'],
      include_meta: ['permissions'],
    },
  }

  return (
    <Resource config={config} name="skill_aliases">
      <ResourceFilter openModal={openModal} />
      <Resource.Table
        pagination
      >
        <Resource.Column<SkillAlias>
          title={I18n.t('administration.settings.skill_aliases.alias')}
          id="name"
        />
        <Resource.Column<SkillAlias>
          title={I18n.t('administration.settings.skill_aliases.skill')}
          id="skill"
          render={({ skill }) => skill.name}
        />
        <Resource.Column<SkillAlias>
          title={I18n.t('common.column.action')}
          id="actions"
          key="actions"
          width="2%"
          render={skillAlias => (
            <ConditionalDropdown
              menu={
                getActionsMenuProps({
                  skillAlias,
                  openModal,
                })
              }
            />
          )}
        />
      </Resource.Table>
      <Modals modals={{ SkillAliasForm }} />
    </Resource>
  )
}

const ResourceFilter = ({ openModal }) => {
  const { resource } = useResourceContext<SkillAlias>()
  const tableLoading = resource.isLoading('fetch')

  return (
    <Resource.Filter hideSearch name="">
      {resource.meta.permissions?.create && (
        <Button
          type="primary"
          disabled={tableLoading}
          onClick={() => openModal('SkillAliasForm')}
        >
          <PlusOutlined />
          {I18n.t('administration.settings.skill_aliases.create')}
        </Button>
      )}
    </Resource.Filter>
  )
}

interface ActionMenuData {
  skillAlias: SkillAlias
  openModal: (modalName: string, modalProps: unknown) => void
}

const getActionsMenuProps = ({
  skillAlias, openModal,
}: ActionMenuData):MenuProps => {
  const { resource } = useResourceContext<SkillAlias>()
  const { modal } = App.useApp()

  const handleRemove = () => {
    modal.confirm({
      title: I18n.t('administration.administrators.modals.delete.title'),
      content: I18n.t(
        'administration.settings.skill_aliases.confirm_message',
        { skill_alias: skillAlias.name },
      ),
      okText: I18n.t('administration.administrators.modals.delete.okText'),
      cancelText: I18n.t(
        'administration.administrators.modals.delete.cancelText',
      ),
      onOk: async () => {
        await resource.removeResource(skillAlias.id).then(() => {
          message.success(
            I18n.t('administration.settings.skill_aliases.successful_remove', { skill_alias: skillAlias.name }),
          )
        }).catch(() => {
          message.error(I18n.t('common.errors.something_wrong'))
        })
      },
    })
  }

  const menuItems: MenuItem[] = []
  resource.meta.permissions?.edit && menuItems.push({
    key: 'edit',
    label: (
      <Button
        type="link"
        onClick={
          () => openModal('SkillAliasForm', { skillAlias })
        }
        className="ps-0"
      >
        {I18n.t('common.actions.edit')}
      </Button>),
  })
  resource.meta.permissions?.remove && menuItems.push({
    key: 'remove',
    label: (
      <>
        <Button
          type="link"
          onClick={handleRemove}
          className="ps-0"
        >
          {I18n.t('common.actions.remove')}
        </Button>
      </>
    ),
  })

  return ({ items: menuItems })
}

export const SkillAliases = connector(SkillAliasesList)
