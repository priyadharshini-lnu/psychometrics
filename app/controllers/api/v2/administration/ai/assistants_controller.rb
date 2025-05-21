# frozen_string_literal: true

module Api
  module V2
    module Administration
      class AI::AssistantsController < BaseController
        validate_crud_requests Api::V2::AI::Assistant::Schema

        def policy_class
          Api::Administration::AI::AssistantPolicy
        end
      end
    end
  end
end
