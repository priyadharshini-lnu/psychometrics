import React from 'react'
import { Menu } from 'antd'

const ActionsMenu = ({
  user, campaignId, removeUser, openModal, onUserUpdate, editUser,
}) => {
  const removeUserWithConfirmation = () => {
    if (confirm(I18n.t('threesixty.participant_list.confirmation_messages.remove_from_campaign'))) {
      removeUser(campaignId, user.id)
    }
  }

  const openUserEditModal = () => {
    editUser(user)
    openModal('UserEditModal', {
      onUserUpdate,
    })
  }

  return (
    <Menu>
      <Menu.Item key="0">
        <a
          href={`/administration/threesixty_campaigns/${campaignId}/participants/${
            user.id
          }/spoof`}
        >
          {I18n.t('threesixty.participant_list.actions.login')}
        </a>
      </Menu.Item>
      <Menu.Item key="2">
        <div
          onClick={openUserEditModal}
          role="button"
          tabIndex={-1}
        >
          {I18n.t('threesixty.participant_list.actions.edit')}
        </div>
      </Menu.Item>
      <Menu.Item key="11">
        <div
          onClick={removeUserWithConfirmation}
          role="button"
          tabIndex={-1}
        >
          {I18n.t('threesixty.participant_list.actions.remove_campaign')}
        </div>
      </Menu.Item>
    </Menu>
  )
}

export default ActionsMenu
