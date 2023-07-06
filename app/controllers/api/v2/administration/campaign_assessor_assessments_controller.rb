# frozen_string_literal: true

module Api
  class V2::Administration::CampaignAssessorAssessmentsController < Api::V2::Administration::BaseController
    validates_request_schema :create, Api::V2::CampaignAssessorAssessment::CreateContract.new
  end
end
