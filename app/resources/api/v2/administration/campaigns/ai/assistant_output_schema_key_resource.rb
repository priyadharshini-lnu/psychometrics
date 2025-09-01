# frozen_string_literal: true

module Api
  module V2
    module Administration
      module Campaigns
        class AI::AssistantOutputSchemaKeyResource < BaseResource
          model_name 'AI::AssistantOutputSchemaKey'
          attributes :key, :description, :key_type
        end
      end
    end
  end
end
