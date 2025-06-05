# frozen_string_literal: true

module Administration
  module Projects
    module Integrations
      class SkillvueIntegrationSchema < ::BaseSchema
        def self.schema(_response, _serializer)
          Dry::Schema.JSON do
            config.validate_keys = true

            required(:api_key).filled(:str?)
            required(:completion_webhook_url).maybe(:str?)
            required(:results_webhook_url).maybe(:str?)
          end
        end
      end
    end
  end
end
