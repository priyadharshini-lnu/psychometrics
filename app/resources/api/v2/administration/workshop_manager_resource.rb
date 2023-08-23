# frozen_string_literal: true

class Api::V2::Administration::WorkshopManagerResource < Api::V2::Administration::BaseResource
  attributes :full_name, :photo_url, :email
  delegate :full_name, :photo_url, :email, to: :user, allow_nil: true

  has_one :user
end
