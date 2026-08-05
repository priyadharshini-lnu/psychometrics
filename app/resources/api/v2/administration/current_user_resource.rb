# frozen_string_literal: true

class Api::V2::Administration::CurrentUserResource < Api::V2::Administration::BaseResource
  model_name 'User'

  attributes :name, :email, :first_name, :last_name, :navigation_links, :role, :photo, :role_title,
             :library_owner_field_visible, :client_admin_client_ids, :support_admin, :preferences

  def support_admin
    @model.support_admin?
  end

  def navigation_links
    ::Administration::NavigationLinksSerializer.new(
      context: { project_id: context.dig(:params, :project_id) }
    ).serialize(@model)
  end

  def photo
    @model.user_profile.photo&.url
  end

  def role_title
    @model.decorate.role
  end

  def library_owner_field_visible
    return true if @model.is?(:superadmin)
    return false unless @model.is?(:client_admin)

    client_admin_client_ids.length > 1
  end

  def client_admin_client_ids
    @model.client_admin_client_ids.map(&:to_s)
  end

  def preferences
    @model.user_preferences.map do |preference|
      preference.slice(:category, :config_key, :payload)
    end
  end
end
