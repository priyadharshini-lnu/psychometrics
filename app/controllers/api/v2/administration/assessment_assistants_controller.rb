# frozen_string_literal: true

module Api
  class V2::Administration::AssessmentAssistantsController < Api::V2::Administration::BaseController
    skip_before_action :enforce_geo_restriction

    private

    def policy_class
      Api::Administration::AssessmentAssistantPolicy
    end

    def model_class
      AssessmentAssistant
    end

    def model
      @model ||= AssessmentAssistant.find_or_initialize_by(assessment_id: params[:id])
    end
  end
end
