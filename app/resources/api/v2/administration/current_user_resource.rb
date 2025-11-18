# frozen_string_literal: true

class Api::V2::Administration::CurrentUserResource < Api::V2::Administration::BaseResource
  model_name 'User'

  attributes :name, :email, :first_name, :last_name, :navigation_links, :role, :photo, :role_title

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
end
