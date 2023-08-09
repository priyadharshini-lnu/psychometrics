# frozen_string_literal: true

module Api
  class V2::Administration::CampaignAssessmentsController < Api::V2::Administration::BaseController
    validate_crud_requests Api::V2::CampaignAssessment::Schema
  end
end
