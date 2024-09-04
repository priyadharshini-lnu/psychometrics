# frozen_string_literal: true

class Api::V2::Administration::CurrentUserResource < Api::V2::Administration::BaseResource
  model_name 'User'

  attributes :name, :email, :first_name, :last_name, :navigation_links

  def navigation_links
    ::Administration::NavigationLinksSerializer.new(
      context: { project_id: context.dig(:params, :project_id) }
    ).serialize(@model)
  end
end
