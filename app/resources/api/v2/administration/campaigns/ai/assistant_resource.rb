# frozen_string_literal: true

module Api
  module V2
    module Administration
      class Campaigns::AI::AssistantResource < BaseResource
        model_name 'AI::Assistant'
        attributes :name, :dependencies, :advanced_prompting_enabled

        has_many :assistant_output_schema_keys, class_name: 'AssistantOutputSchemaKey'

        def self._type
          'ai_assistants'
        end
      end
    end
  end
end
