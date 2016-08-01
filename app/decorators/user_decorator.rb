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
      title: I18n.t("administration.users.resource.confirmations.change_password.title", name: display_name),
      body: I18n.t("administration.users.resource.confirmations.change_password.body")
    }.to_json
  end
end
