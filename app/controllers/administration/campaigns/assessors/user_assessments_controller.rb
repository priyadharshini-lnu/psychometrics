# frozen_string_literal: true

module Administration
  module Campaigns
    module Assessors
      class UserAssessmentsController < Administration::Campaigns::BaseController
        before_action :set_resource, only: %i[reset reset_progress rescore]

        def index
          user_assessments = assessor.user_assessments.where(campaign_id: assessor.campaign_id).
                             includes(:assessment).
                             ransack(params[:filters]).result
          serialized_user_assessments = Panko::ArraySerializer.new(
            user_assessments.page(params[:page]),
            each_serializer: ::Administration::Campaigns::Assessors::UserAssessmentSerializer,
            context: {
              current_user: current_user,
              project_id: campaign.project_id,
              campaign_id: campaign.id
            }
          ).to_a

          render json: { list: serialized_user_assessments, total: user_assessments.count }
        end

        def create
          form = ::Assessors::UserAssessments::Form.from_params(resource_params).
                 with_context(campaign: campaign, assessor: assessor)
          if form.valid?
            user_assessment = ::Assessors::UserAssessments::Create.call!(form)
            render json: ::Administration::Campaigns::Assessors::UserAssessmentSerializer.new(
              context: {
                project_id: campaign.project_id,
                campaign_id: campaign.id,
                current_user: current_user
              }
            ).serialize(user_assessment)
          else
            render json: { errors: form.errors.messages }, status: 422
          end
        end

        def bulk_delete
          assessor.user_assessments.where(campaign_id: assessor.campaign_id).where(id: params[:ids]).map(&:destroy!)

          head :ok
        end

        def rescore
          user_result = resource.users_result
          AdminJob.call(:rescore_user_assessment, {
            user_result_id: user_result.id,
            campaign_id: campaign.id
          }, current_user)
          audit! :rescore_results, resource, campaign: resource.campaign
          render json: ::Administration::Campaigns::Assessors::UserAssessmentSerializer.new(
            context: {
              project_id: campaign.project_id,
              campaign_id: campaign.id,
              current_user: current_user
            }
          ).serialize(resource)
        end

        def reset
          ::UsersResults::Reset.call!(resource)

          render json: ::Administration::Campaigns::Assessors::UserAssessmentSerializer.new(
            context: {
              project_id: campaign.project_id,
              campaign_id: campaign.id,
              current_user: current_user
            }
          ).serialize(resource)
        end

        def reset_progress
          ::UserAssessments::ResetProgress.call!(resource, reset_flag: true)

          render json: ::Administration::Campaigns::Assessors::UserAssessmentSerializer.new(
            context: {
              project_id: campaign.project_id,
              campaign_id: campaign.id,
              current_user: current_user
            }
          ).serialize(resource)
        end

        private

        def pundit_authorize
          authorize(
            resource || UserAssessment,
            nil,
            project_id: campaign.project_id,
            campaign_id: campaign.id,
            policy_class: Administration::Campaigns::Assessors::UserAssessmentPolicy
          )
        end

        def resource_class
          UserAssessment
        end

        def assessor
          @assessor ||= campaign.assessors.find(params[:assessor_id])
        end

        def resource_params
          params[:resource]
        end

        # rubocop:disable Naming/MemoizedInstanceVariableName
        def set_resource
          @_resource ||= campaign.user_assessments.find(params[:id])
        end
        # rubocop:enable Naming/MemoizedInstanceVariableName
      end
    end
  end
end
