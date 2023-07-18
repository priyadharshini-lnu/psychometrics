# frozen_string_literal: true

class Api::V2::Administration::WorkshopAssessorResource < Api::V2::Administration::BaseResource
  attributes :full_name, :photo_url
  delegate :full_name, :photo_url, to: :user, allow_nil: true

  has_one :user
end
