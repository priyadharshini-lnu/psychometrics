# frozen_string_literal: true

module Api
  class V2::Administration::WorkshopActivitiesController < Api::V2::Administration::BaseController
    validate_crud_requests Api::V2::UserAssessment::Schema

    append_before_action :set_workshop, only: %i[index]
    append_before_action :pundit_authorize

    def index
      if current_user.has_permission?(:workshops, :view, campaign_id: @workshop.campaign_id)
        activities = UserAssessment.with_campaign_assessments.with_workshop_activities.
                     where(campaign_id: @workshop.campaign).
                     where(subject_id: @workshop.workshop_subjects.select(:user_id))
      elsif current_user.assessor?
        activities = UserAssessment.where(
          evaluator_id: current_user.id,
          relationship_id: Relationship.assessor_relationship,
          subject_id: @workshop.workshop_subjects.select(:user_id)
        )
      end

      jsonapi_render json: activities || UserAssessment.none
    end

    def pundit_authorize
      authorize(
        nil,
        nil,
        policy_class: Api::Administration::WorkshopActivityPolicy,
        project_id:  @workshop.campaign.project_id,
        campaign_id: @workshop.campaign_id
      )
    end

    def set_workshop
      @workshop = Workshop.find(params[:workshop_id])
    end

    def meta_details
      {
        permissions: lambda {
          GetPermissionsHash.call!(
            ::Administration::Campaigns::AssessorPolicy,
            context[:user],
            @model,
            %w[create_all],
            { project_id: @workshop.campaign.project_id }
          )
        }
      }
    end
  end
end
