class MembershipDecorator < BaseDecorator
  def display_name
    return object.user.decorate.display_name unless object.respond_to?(:first_name)
    [object.first_name, object.last_name].reject(&:blank?).join(' ')
  end

  def role_name
    h.t("activerecord.attributes.user.roles.#{object.role.demodulize.underscore}")
  end

  def relationship
    current_membership = context[:current_membership]
    return 'Self' if object.id == current_membership.id
    return 'Direct Report' if object.parent_id == current_membership.id
    return 'Peer' if object.parent_id == current_membership.parent_id
    return 'Manager' if object.id == current_membership.parent_id
  end

  def change_password_confirmation
    {
      title: I18n.t('administration.users.resource.confirmations.change_password.title', name: display_name),
      body: I18n.t('administration.users.resource.confirmations.change_password.body')
    }.to_json
  end

  def delete_confirmation
    {
      title: I18n.t('administration.users.resource.confirmations.membership.delete.title', name: display_name, client_name: context[:client_name]),
      body: I18n.t('administration.users.resource.confirmations.membership.delete.body')
    }.to_json
  end

  def toggle_status_confirmation
    status = object.disabled ? I18n.t('administration.enable') : I18n.t('administration.disable')
    {
      title: I18n.t(
        'administration.users.resource.confirmations.toggle_status.title',
        status: status,
        name: display_name
      ),
      body: I18n.t(
        'administration.users.resource.confirmations.toggle_status.body',
        status: status.downcase
      )
    }.to_json
  end

  def managers_for_select
    # TODO: need to change!
    User.where(role: User::USER_ROLES[:manager]).map { |manager| [manager.decorate.display_name, manager.id] }
  end
end
