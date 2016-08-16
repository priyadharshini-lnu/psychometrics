class UserDecorator < BaseDecorator
  def display_name
    return object.email if object.first_name.blank? && object.last_name.blank?
    "#{object.first_name} #{object.last_name}"
  end

  def can_manage_options
    object.can_manage.map { |role| [User.human_enum_name(:role, role), role] }
  end

  def change_password_confirmation
    {
      title: I18n.t('administration.users.resource.confirmations.change_password.title', name: display_name),
      body: I18n.t('administration.users.resource.confirmations.change_password.body')
    }.to_json
  end

  def clients_name
    if h.current_administrator.is?(:superadmin)
      object.clients.map { |client| client.decorate.display_name }.join(', ')
    else
      object.clients.select { |client| h.current_administrator.client_ids.include?(client.id) }.map { |client| client.decorate.display_name }.join(', ')
    end
  end
end
