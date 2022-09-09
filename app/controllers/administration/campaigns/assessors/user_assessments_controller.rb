# frozen_string_literal: true

module Administration
  module Campaigns
    module Assessors
      class UserAssessmentsController < Administration::Campaigns::BaseController
        before_action :set_resource, only: %i[reset]

        def index
          user_assessments = assessor.user_assessments.where(campaign_id: assessor.campaign_id).
                             ransack(params[:filters]).result
          serialized_user_assessments = ActiveModelSerializers::SerializableResource.new(
            user_assessments.page(params[:page]),
            each_serializer: ::Administration::Campaigns::Assessors::UserAssessmentSerializer,
            current_user: current_user,
            project_id: campaign.project_id,
            campaign_id: campaign.id
          )

          render json: { list: serialized_user_assessments, total: user_assessments.count }
        end

        def create
          form = ::Assessors::UserAssessments::Form.from_params(resource_params).
                 with_context(campaign: campaign, assessor: assessor)
          if form.valid?
            user_assessment = ::Assessors::UserAssessments::Create.call!(form)
            render json: user_assessment, serializer: ::Administration::Campaigns::Assessors::UserAssessmentSerializer,
                   project_id: campaign.project_id, campaign_id: campaign.id
          else
            render json: { errors: form.errors.messages }, status: 422
          end
        end

        def bulk_delete
          assessor.user_assessments.where(campaign_id: assessor.campaign_id).where(id: params[:ids]).map(&:destroy!)

          head :ok
        end

        def reset
          ::UsersResults::Reset.call!(resource)

          head :ok
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
