# frozen_string_literal: true

module Api
  class V2::Administration::UserIdpDevelopmentActionsController < Api::V2::Administration::BaseController
    skip_before_action :enforce_geo_restriction
    before_action :load_user_idp_skill!, only: %i[generate_by_ai]

    validate_crud_requests Api::V2::UserIdpDevelopmentAction::Schema
    validates_request_schema :bulk_update, -> { Api::V2::UserIdpDevelopmentAction::BulkUpdateContract.new }

    def bulk_update
      plan_id = bulk_update_params[:user_idp_development_actions]&.first&.[](:user_idp_plan_id)
      result = ::Administration::UserIdpDevelopmentActions::BulkUpdate.call(
        user_idp_development_actions: bulk_update_params[:user_idp_development_actions] || [],
        user_idp_plan_id: plan_id
      )

      if result[:ok]
        render json: serialize_resources(result[:ok][:all_records],
                                         Api::V2::Administration::UserIdpDevelopmentActionResource),
               status: :ok
      elsif result[:error]
        jsonapi_render_errors [{ code: result[:error] }], status: :unprocessable_entity
      end
    end

    def generate_by_ai
      generative_service = DevelopmentActions::GenerativeService.new(@user_idp_skill, current_user,
                                                                     ai_generate_service_params)

      generative_service.
        on(:ok) do |generated_actions|
          render json: { data: { id: @user_idp_skill.skill_id, attributes: { generated_actions: generated_actions } } },
                 status: :ok
        end.
        on(:error) do |error_message|
          render json: { errors: [error_message] }, status: 422
        end.
        call
    end

    private

    def bulk_update_params
      params.require(:data).require(:attributes).permit(
        :user_idp_plan_id,
        user_idp_development_actions: %i[
          user_idp_skill_id
          development_action_id
          user_idp_plan_id
          description
          name
          learning_style
          source_type
          start_date_time
          end_date_time
          progress
          private
          id
          _destroy
        ]
      )
    end

    def load_user_idp_skill!
      @user_idp_skill = ::UserIdpSkill.find(ai_generate_service_params[:user_idp_skill_id])
    end

    def ai_generate_service_params
      params.require(:data).require(:attributes).permit(
        :user_idp_skill_id,
        :lang,
        :generate_more
      )
    end
  end
end
