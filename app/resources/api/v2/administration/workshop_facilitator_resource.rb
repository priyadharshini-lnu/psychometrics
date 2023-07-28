# frozen_string_literal: true

class Api::V2::Administration::WorkshopFacilitatorResource < Api::V2::Administration::BaseResource
  attributes :name, :email, :photo_url

  def name
    @model.decorate.display_name
  end

  def photo_url
    @model.user_profile&.photo&.url
  end
end
