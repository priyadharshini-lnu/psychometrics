# frozen_string_literal: true

module Api
  module V2
    module Administration
      class AI::AssistantsController < BaseController
        skip_before_action :enforce_geo_restriction
        validate_crud_requests Api::V2::AI::Assistant::Schema

        before_action :load_campaign!, only: %i[render_prompt_template]

        def generate
          result = ::AI::AssistantService.call(
            params[:id],
            current_user,
            params.dig(:data, :attributes, :prompt),
            skip_default_params: true
          )
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
                           resource: Api::V2::Administration::AI::AssistantRevisionResource,
                           paginate: false
                         }
        rescue ActiveRecord::RecordNotFound
          render json: { error: 'Assistant not found' }, status: :not_found
        rescue StandardError => e
          render json: { error: e.message }, status: :unprocessable_entity
        end

        def destroy
          assistant = ::AI::Assistant.find(params[:id])
          return super unless assistant.assigned_to_idp_template?

          render json: { error: 'Cannot delete assistant assigned to an IDP template' }, status: :unprocessable_entity
        rescue StandardError => e
          render json: { error: e.message }, status: :unprocessable_entity
        end

        def render_prompt_template
          system_prompt = params.dig(:data, :attributes, :template)

          templater_renderer = ::AI::PromptTemplate::Renderer.new(
            system_prompt, campaign: @campaign, user: current_user
          )

          templater_renderer.on(:ok) do |rendered_prompt|
            render json: { attributes: { rendered_prompt: } }, status: :ok
          end.
            on(:error) do |error|
            jsonapi_render_errors [{ detail: error }], status: :unprocessable_entity
          end.
            call
        end

        def policy_class
          Api::Administration::AI::AssistantPolicy
        end

        private

        def load_campaign!
          @campaign = ::Campaign.find(params.dig(:data, :attributes, :campaign_id))
        end
      end
    end
  end
end
