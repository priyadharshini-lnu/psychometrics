# frozen_string_literal: true

module Api
  class V2::Administration::CampaignAssessorAssessmentsController < Api::V2::Administration::BaseController
    validates_request_schema :create, -> { Api::V2::CampaignAssessorAssessment::CreateContract.new }

    def subject_assessor_assessments
      render json: {
        assessor_user_assessments: serialized_assessor_user_assessments,
        campaign_assessor_assessments: serialized_campaign_assessor_assessments
      }
    end

    def serialized_campaign_assessor_assessments
      Panko::ArraySerializer.new(
        campaign_assessor_assessments,
        each_serializer: ::Administration::Campaigns::WorkshopSubjects::CampaignAssessorAssessmentSerializer
      ).to_a
    end

    def serialized_assessor_user_assessments
      Panko::ArraySerializer.new(
        assessor_user_assessments,
        each_serializer: ::Administration::Campaigns::WorkshopSubjects::AssessorUserAssessmentSerializer,
        context: {
          current_user: current_user
        }
      ).to_a
    end

    def workshop_subject
      @workshop_subject ||= WorkshopSubject.find(params[:workshop_subject_id])
    end

    def campaign_assessor_assessments
      CampaignAssessorAssessment.
        joins(:assessment).
        where(campaign_id: campaign_id).
        where(assessment: { linked_assessment_id: [nil, *user_assessments.pluck(:assessment_id)] })
    end

    def assessor_user_assessments
      @assessor_user_assessments ||= UserAssessment.where(
        relationship_id: Relationship.assessor_relationship.id,
        subject_id: workshop_subject.user_id,
        campaign_id: campaign_id
      )
    end

    def user_assessments
      @user_assessments = UserAssessment.with_campaign_assessments.
                          where(campaign_assessments: {
                            campaign_assessment_group_id: workshop_subject.workshop.campaign_assessment_group_id
                          }).
                          where(subject_id: workshop_subject.user_id, campaign_id: campaign_id)
    end
  end
end
