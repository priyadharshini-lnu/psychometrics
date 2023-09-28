# frozen_string_literal: true

module Api
  class V2::Administration::CampaignAssessorAssessmentsController < Api::V2::Administration::BaseController
    validates_request_schema :create, Api::V2::CampaignAssessorAssessment::CreateContract.new

    def subject_assessor_assessments
      workshop_subject = WorkshopSubject.find(params[:workshop_subject_id])

      campaign_assessor_assessments = CampaignAssessorAssessment.where(campaign_id: params[:campaign_id])

      user_assessments = UserAssessment.where(
        relationship_id: Relationship.assessor_relationship.id,
        subject_id: workshop_subject.user_id,
        campaign_id: params[:campaign_id],
        assessment_id: campaign_assessor_assessments.pluck(:assessment_id)
      ).index_by(&:assessment_id)

      render json: campaign_assessor_assessments,
             each_serializer: ::Administration::Campaigns::WorkshopSubjects::CampaignAssessorAssessmmentSerializer,
             user_assessments: user_assessments
    end
  end
end
