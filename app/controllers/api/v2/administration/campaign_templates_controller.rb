# frozen_string_literal: true

module Api
  class V2::Administration::CampaignTemplatesController < Api::V2::Administration::BaseController
    validate_crud_requests Api::V2::CampaignTemplate::Schema
    validates_request_schema :update, -> { Api::V2::CampaignTemplate::Contract.new }
    validates_request_schema :create, -> { Api::V2::CampaignTemplate::Contract.new }
  end
end
