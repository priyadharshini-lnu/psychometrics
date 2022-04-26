# frozen_string_literal: true

class Api::V2::Administration::UserResource < Api::V2::Administration::BaseResource
  attributes :name, :email

  def name
    @model.decorate.display_name
  end
end
