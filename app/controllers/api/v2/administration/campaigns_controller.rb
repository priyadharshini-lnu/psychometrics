# frozen_string_literal: true

module Api
  class V2::Administration::CampaignsController < Api::V2::Administration::BaseController
    validate_crud_requests Api::V2::Campaign::Schema
  end
end
