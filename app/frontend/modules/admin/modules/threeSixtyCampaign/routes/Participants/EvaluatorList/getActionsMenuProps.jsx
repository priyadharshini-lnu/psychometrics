export const getActionsMenuProps = ({
  user, threeSixtyCampaignId, campaignId, removeUser, openModal, onUserUpdate, editUser, permissions,
}) => {
  const removeUserWithConfirmation = () => {
    // eslint-disable-next-line no-alert
    if (confirm(I18n.t('threesixty.participant_list.confirmation_messages.remove_from_campaign'))) {
      removeUser(threeSixtyCampaignId, user.id)
    }
  }

  const openUserEditModal = () => {
    editUser(user)
    openModal('UserEditModal', {
      onUserUpdate,
    })
  }

  const menuItems = [
    permissions.login && {
      key: 'login',
      label: (
        <a
          href={`/administration/threesixty_campaigns/${campaignId}/participants/${
            user.id
          }/spoof`}
        >
          {I18n.t('threesixty.participant_list.actions.login')}
        </a>
      ),
    },
    permissions.edit && {
      key: 'edit',
      label: I18n.t('threesixty.participant_list.actions.edit'),
    },
    permissions.removeFromCampaign && {
      key: 'removeFromCampaign',
      label: I18n.t('threesixty.participant_list.actions.remove_campaign'),
    },
  ]

  const handleMenuClick = ({ key }) => {
    if (key === 'edit') {
      return openUserEditModal()
    }
    if (key === 'removeFromCampaign') {
      return removeUserWithConfirmation()
    }
  }

  return ({ items: menuItems, onClick: handleMenuClick })
}
