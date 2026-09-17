import React from 'react'
import {
  Button, MenuProps, Typography, useApp,
} from '@thetalententerprise/glint'
import { useNavigate } from 'react-router-dom'
import { VoiceCharacter } from '~/modules/admin/modules/VoiceCharacter/core/voiceCharacter'
import { MenuItem } from '~/interfaces/Antd'
import { Resource, useResourceContext } from '~/modules/admin/components/Resource'
import ConditionalDropdown from '~/components/ConditionalDropdown'

const { I18n } = window

export const VoiceCharactersTable = () => (
  <Resource.Table pagination>
    <Resource.Column<VoiceCharacter>
      title={I18n.t('shared.id')}
      id="id"
      hideable={false}
      sorter
      render={voiceCharacter => voiceCharacter.id}
      width={80}
      fixed="left"
    />
    <Resource.Column<VoiceCharacter>
      title={I18n.t('shared.name')}
      id="name"
      sorter
      render={voiceCharacter => <Typography.Text>{voiceCharacter.name}</Typography.Text>}
      width={200}
      fixed="left"
    />
    <Resource.Column<VoiceCharacter>
      title={I18n.t('admin.tts_voice')}
      id="external_voice_id"
      render={voiceCharacter => voiceCharacter.externalVoiceId}
      width={200}
    />
    <Resource.Column<VoiceCharacter>
      title={I18n.t('admin.tts_locale')}
      id="locale"
      render={voiceCharacter => voiceCharacter.locale || '-'}
      width={140}
    />
    <Resource.Column<VoiceCharacter>
      title={I18n.t('shared.owner')}
      id="tenant"
      render={voiceCharacter => voiceCharacter.tenant?.name || I18n.t('admin.platform_owner')}
      width={160}
    />
    <Resource.Column<VoiceCharacter>
      title=""
      id="actions"
      hideable={false}
      render={voiceCharacter => <Dropdown voiceCharacter={voiceCharacter} />}
      width={60}
      fixed="right"
    />
  </Resource.Table>
)

type DropDownProps = {
  voiceCharacter: VoiceCharacter
}

const Dropdown: React.FC<DropDownProps> = ({ voiceCharacter }) => {
  const { message } = useApp()

  return <ConditionalDropdown menu={getActionsMenuProps({ voiceCharacter, message })} />
}

type ActionMenuData = {
  voiceCharacter: VoiceCharacter
  message: { error: (content: string) => void }
}

const getActionsMenuProps = ({ voiceCharacter, message }: ActionMenuData): MenuProps => {
  const { resource } = useResourceContext<VoiceCharacter>()
  const navigate = useNavigate()

  const handleDelete = () => {
    resource.removeResource(voiceCharacter.id).catch((error) => {
      message.error(error?.base?.[0]?.title)
    })
  }

  const menuItems = [
    {
      key: 'edit',
      label: (
        <Button type="link" className="ps-0" onClick={() => navigate(`${voiceCharacter.id}/edit/`)}>
          {I18n.t('shared.edit')}
        </Button>
      ),
    },
    {
      key: 'delete',
      label: (
        <Button type="link" className="ps-0" onClick={handleDelete}>
          {I18n.t('shared.delete')}
        </Button>
      ),
    },
  ] as MenuItem[]

  return { items: menuItems }
}
