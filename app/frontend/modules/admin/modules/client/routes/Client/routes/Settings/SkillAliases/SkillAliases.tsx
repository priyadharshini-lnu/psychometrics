import React from 'react'
import { useParams } from 'react-router-dom'
import {
  Button, message, MenuProps, App,
} from 'antd'
import { ConnectedProps, connect } from 'react-redux'
import { PlusOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { MenuItem } from '~/interfaces/Antd'
import { SkillAliasForm } from './SkillAliasForm'
import { Resource, useResourceContext } from '~/modules/admin/components/Resource'
import { TABLE_SETTINGS_KEYS } from '~/modules/admin/components/Resource/settingsKeys'
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
    <Resource
      title={I18n.t('admin.settings_tabs_skill_aliases')}
      config={config}
      name="skill_aliases"
      settingsKey={TABLE_SETTINGS_KEYS.clientSettingsSkillAliases}
    >
      <ResourceFilter openModal={openModal} />
      <Resource.Table
        pagination
      >
        <Resource.Column<SkillAlias>
          title={I18n.t('admin.settings_skill_aliases_alias')}
          id="name"
          hideable={false}
          width={300}
        />
        <Resource.Column<SkillAlias>
          title={I18n.t('admin.settings_skill_aliases_skill')}
          id="skill"
          render={({ skill }) => skill.name}
          width={300}
        />
        <Resource.Column<SkillAlias>
          title={I18n.t('shared.action')}
          id="actions"
          hideable={false}
          key="actions"
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
          width={100}
          fixed="right"
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
          {I18n.t('admin.settings_skill_aliases_create')}
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
      title: I18n.t('shared.confirm'),
      content: I18n.t(
        'admin.settings_skill_aliases_confirm_message',
        { skill_alias: skillAlias.name },
      ),
      okText: I18n.t('shared.delete'),
      cancelText: I18n.t('shared.cancel'),
      onOk: async () => {
        await resource.removeResource(skillAlias.id).then(() => {
          message.success(
            I18n.t('admin.settings_skill_aliases_successful_remove', { skill_alias: skillAlias.name }),
          )
        }).catch(() => {
          message.error(I18n.t('shared.something_wrong'))
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
        {I18n.t('shared.edit')}
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
          {I18n.t('shared.remove')}
        </Button>
      </>
    ),
  })

  return ({ items: menuItems })
}

export const SkillAliases = connector(SkillAliasesList)
