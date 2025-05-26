# frozen_string_literal: true

module Api
  module V2
    module Administration
      class AI::AssistantsController < BaseController
        validate_crud_requests Api::V2::AI::Assistant::Schema

        def generate
          response = ::AI::Assistants::Service.call(params[:id])
          render json: { response: response }
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
