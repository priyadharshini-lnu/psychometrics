# frozen_string_literal: true

module Administration
  module Projects
    module Integrations
      class HoganIntegrationSchema < ::BaseSchema
        def self.schema(_, _)
          Dry::Schema.JSON do
            config.validate_keys = true

            required(:provider).filled(:str?)
          end
        end
      end
    end
  end
end
