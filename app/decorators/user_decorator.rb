class UserDecorator < BaseDecorator
  def display_name
    return object.email if object.first_name.blank? && object.last_name.blank?
    "#{object.first_name} #{object.last_name}"
  end

  def can_manage_roles
    object.can_manage.map { |role| [User.human_role(role), role] }
  end

  def role
    User.human_role(object.role)
  end

  def position
    object.hris['position'] || object.hris['job_title']
  end

  def change_password_confirmation
    {
      title: I18n.t('administration.users.resource.confirmations.change_password.title', name: display_name),
      body: I18n.t('administration.users.resource.confirmations.change_password.body')
    }.to_json
  end

  def clients_name
    if h.current_user.is?(:superadmin)
      object.clients.
        map { |client| client.decorate.display_name }.
        join(', ')
    else
      object.clients.
        select { |client| h.current_user.client_ids.include?(client.id) }.
        map { |client| client.decorate.display_name }.
        join(', ')
    end
  end

  def delete_confirmation
    {
      title: I18n.t('administration.users.resource.confirmations.delete.title', name: display_name),
      body: I18n.t('administration.users.resource.confirmations.delete.body')
    }.to_json
  end

  def delete_membership_confirmation
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
end
