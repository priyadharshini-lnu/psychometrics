# frozen_string_literal: true

class Api::V2::Administration::WorkshopFacilitatorResource < Api::V2::Administration::BaseResource
  attributes :name, :email, :photo_url, :full_name

  def full_name
    @model.decorate.full_name
  end

  def photo_url
    @model.user_profile&.photo&.url
  end
end
