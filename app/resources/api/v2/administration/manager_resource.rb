# frozen_string_literal: true

class Api::V2::Administration::ManagerResource < Api::V2::Administration::BaseResource
  attributes :id, :email, :name

  def name
    @model.decorate.full_name
  end
end
