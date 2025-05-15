# frozen_string_literal: true

class Api::V2::Administration::WorkshopFacilitatorResource < Api::V2::Administration::BaseResource
  model_name 'User'

  attributes :full_name, :email, :photo_url, :user_id

  def user_id
    @model.id
  end

  def full_name
    @model.decorate.display_name
  end

  def photo_url
    @model.photo&.url
  end
end
