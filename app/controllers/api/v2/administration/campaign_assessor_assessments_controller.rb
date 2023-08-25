# frozen_string_literal: true

module Api
  class V2::Administration::CampaignAssessorAssessmentsController < Api::V2::Administration::BaseController
    validates_request_schema :create, Api::V2::CampaignAssessorAssessment::CreateContract.new

    def subject_assessor_assessments
      assessor_assessments = WorkshopSubjects::GetAssessorAssessments.call!(
        campaign_id: params[:campaign_id],
        workshop_subject_id: params[:workshop_subject_id]
      )

      render json: assessor_assessments, status: :ok
    end
  end
end
