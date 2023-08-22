# frozen_string_literal: true

class Api::V2::Administration::CampaignResource < Api::V2::Administration::BaseResource
  attributes :name, :project_id

  has_one :dashboard, foreign_key_on: :related
end
