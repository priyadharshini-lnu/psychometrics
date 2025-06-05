# frozen_string_literal: true

module Administration
  module Projects
    module Integrations
      class IihtIntegrationSchema < ::BaseSchema
        def self.schema(_, _)
          Dry::Schema.JSON do
            config.validate_keys = true

            required(:user).filled(:str?)
            required(:tenant_id).filled(:str?)
            required(:tenancy_name).filled(:str?)
            required(:webhook_url).filled(:str?)
          end
        end
      end
    end
  end
end
