# frozen_string_literal: true

module Api
  module V2
    module Administration
      class AI::AssistantsController < BaseController
        skip_before_action :enforce_geo_restriction
        validate_crud_requests Api::V2::AI::Assistant::Schema

        def generate
          result = ::AI::AssistantService.call(params[:id], current_user, params.dig(:data, :attributes, :prompt))
          if result[:ok]
            response = result[:ok]
            render json: { id: params[:id], attributes: response }, status: :ok
          else
            jsonapi_render_errors [{ code: result[:error] }], status: :unprocessable_entity
          end
        rescue ActiveRecord::RecordNotFound
          render json: { error: 'Assistant not found' }, status: :not_found
        rescue StandardError => e
          render json: { error: e.message }, status: :unprocessable_entity
        end

        def revisions
          assistant = ::AI::Assistant.find(params[:id])

          audits = assistant.audits.limit(10).reorder(created_at: :desc)

          jsonapi_render json: audits,
                         options: {
                           resource: Api::V2::Administration::AI::AssistantRevisionResource
                         }
        rescue ActiveRecord::RecordNotFound
          render json: { error: 'Assistant not found' }, status: :not_found
        rescue StandardError => e
          render json: { error: e.message }, status: :unprocessable_entity
        end

        def policy_class
          Api::Administration::AI::AssistantPolicy
        end
      end
    end
  end
end
