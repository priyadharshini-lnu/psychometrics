# frozen_string_literal: true

module Api
  class V2::Administration::CampaignFactorValuesController < Api::V2::Administration::BaseController
    validate_crud_requests Api::V2::CampaignFactorValue::Schema
  end
end
