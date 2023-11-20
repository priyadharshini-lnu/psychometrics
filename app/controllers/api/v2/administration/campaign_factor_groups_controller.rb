# frozen_string_literal: true

module Api
  class V2::Administration::CampaignFactorGroupsController < Api::V2::Administration::BaseController
    validate_crud_requests Api::V2::CampaignFactorGroup::Schema
  end
end
