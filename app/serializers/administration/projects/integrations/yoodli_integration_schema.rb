# frozen_string_literal: true

module Administration
  module Projects
    module Integrations
      class YoodliIntegrationSchema < ::BaseSchema
        def self.schema(_, _)
          Dry::Schema.JSON do
            config.validate_keys = true

            required(:platform_id).filled(:str?)
            required(:client_id).filled(:int?)
            required(:deployment_id).filled(:int?)
            required(:platform_public_keyset_url).filled(:str?)
            required(:platform_access_token_url).filled(:str?)
            required(:platform_authentication_request_url).filled(:str?)
            required(:platform_host_name).filled(:str?)
            required(:launch_url).filled(:str?)
            required(:login_url).filled(:str?)
            required(:keyset_url).filled(:str?)
          end
        end
      end
    end
  end
end
