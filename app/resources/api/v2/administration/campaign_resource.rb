# frozen_string_literal: true

class Api::V2::Administration::CampaignResource < Api::V2::Administration::BaseResource
  attributes :name, :project_id, :default_idp_template_id

  has_one :default_idp_template, foreign_key_on: :default_idp_template_id
  has_one :dashboard, foreign_key_on: :related
end
