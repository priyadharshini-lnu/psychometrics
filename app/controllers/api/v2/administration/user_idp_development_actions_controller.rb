# frozen_string_literal: true

module Api
  class V2::Administration::UserIdpDevelopmentActionsController < Api::V2::Administration::BaseController
    before_action :load_skill!, only: %i[generate_by_ai]

    validate_crud_requests Api::V2::UserIdpDevelopmentAction::Schema
    validates_request_schema :bulk_update, -> { Api::V2::UserIdpDevelopmentAction::Schema.bulk_update }

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
      generated_actions = DevelopmentActions::GenerativeService.new(@skill, ai_generate_service_params).call!
      render json: { data: { id: @skill.id, attributes: { generated_actions: generated_actions } } }, status: :ok
    rescue DevelopmentActions::GenerativeService::RegenerateLimitReachedError => e
      render json: { errors: [e.message] }, status: 422
    rescue DevelopmentActions::GenerativeService::GenerativeServiceError => e
      Rails.logger.error(e.message)
      render json: { errors: [I18n.t('common.errors.something_wrong')] }, status: 422
    end

    private

    def bulk_update_params
      params.require(:data).require(:attributes).permit(
        :user_idp_plan_id,
        user_idp_development_actions: %i[
          user_idp_skill_id
          development_action_id
          user_idp_plan_id
          custom_action
          custom_action_learning_style
          start_date_time
          end_date_time
          id
          _destroy
        ]
      )
    end

    def load_skill!
      @skill = ::Skill.find(ai_generate_service_params[:skill_id])
    end

    def ai_generate_service_params
      params.require(:data).require(:attributes).permit(
        :skill_id,
        :lang,
        :generate_more,
        generated_actions: %i[description custom_action_learning_style]
      )
    end
  end
end
