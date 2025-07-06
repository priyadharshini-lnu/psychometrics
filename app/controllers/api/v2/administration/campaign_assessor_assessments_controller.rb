# frozen_string_literal: true

module Api
  class V2::Administration::CampaignAssessorAssessmentsController < Api::V2::Administration::BaseController
    validates_request_schema :create, -> { Api::V2::CampaignAssessorAssessment::CreateContract.new }
    validates_request_schema :update, -> { Api::V2::CampaignAssessorAssessment::UpdateContract.new }

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
        where(campaign_id: campaign_id, campaign_assessment_group_id: campaign_assessment_group_id).
        includes(:assessment, assessment: %i[translations linked_assessment])
    end

    def assessor_user_assessments
      @assessor_user_assessments ||= UserAssessment.where(
        relationship_id: Relationship.assessor_relationship.id,
        subject_id: workshop_subject.user_id,
        campaign_id: campaign_id
      ).includes(:assessment, assessment: %i[translations linked_assessment])
    end

    def user_assessments
      @user_assessments = UserAssessment.with_campaign_assessments.
                          where(campaign_assessments: {
                            campaign_assessment_group_id: campaign_assessment_group_id
                          }).
                          where(subject_id: workshop_subject.user_id, campaign_id: campaign_id)
    end

    def meta_details
      {
        permissions: lambda {
          GetPermissionsHash.call!(
            Api::Administration::CampaignAssessorAssessmentPolicy,
            context[:user],
            @model,
            %w[
              create
              update
              destroy
            ],
            { campaign_id: campaign_id }
          )
        }
      }
    end

    def campaign_assessment_group_id
      workshop_subject.workshop.campaign_assessment_group_id
    end
  end
end
