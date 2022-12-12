# frozen_string_literal: true

class Api::V2::Administration::UserResource < Api::V2::Administration::BaseResource
  attributes :name, :email

  ransack_filters %i[admins search_query with_access_to_campaign]

  def name
    @model.decorate.display_name
  end
end
