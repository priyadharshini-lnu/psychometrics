# frozen_string_literal: true

module Api
  class V2::Administration::CampaignAssessorAssessmentsController < Api::V2::Administration::BaseController
    validates_request_schema :create, Api::V2::CampaignAssessorAssessment::CreateContract.new

    def subject_assessor_assessments
      workshop_subject = WorkshopSubject.find(params[:workshop_subject_id])

      campaign_assessor_assessments = CampaignAssessorAssessment.where(campaign_id: params[:campaign_id])

      assessor_user_assessments = UserAssessment.where(
        relationship_id: Relationship.assessor_relationship.id,
        assessment_id: campaign_assessor_assessments.pluck(:assessment_id),
        campaign_id: params[:campaign_id]
      ).index_by(&:assessment_id)

      subject_user_assessments = UserAssessment.where(
        relationship_id: Relationship.self_relationship.id,
        evaluator_id: workshop_subject.user_id,
        subject_id: workshop_subject.user_id,
        campaign_id: params[:campaign_id]
      ).index_by(&:assessment_id)

      render json: campaign_assessor_assessments,
             each_serializer: ::Administration::Campaigns::WorkshopSubjects::CampaignAssessorAssessmentSerializer,
             subject_user_assessments: subject_user_assessments, assessor_user_assessments: assessor_user_assessments,
             current_user: current_user
    end
  end
end
