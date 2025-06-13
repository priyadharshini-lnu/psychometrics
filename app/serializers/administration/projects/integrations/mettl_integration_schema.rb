# frozen_string_literal: true

module Administration
  module Projects
    module Integrations
      class MettlIntegrationSchema < ::BaseSchema
        def self.schema(_, _)
          Dry::Schema.JSON do
            config.validate_keys = true

            required(:public_key).filled(:str?)
            required(:private_key).filled(:str?)
            required(:api_base_url).filled(:str?)
            required(:completion_webhook_url).filled(:str?)
            required(:results_webhook_url).filled(:str?)
          end
        end
      end
    end
  end
end
