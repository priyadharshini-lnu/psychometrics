# frozen_string_literal: true

module Administration
  module Projects
    class IntegrationSchema < BaseSchema
      def self.schema(_, _)
        Dry::Schema.JSON do
          config.validate_keys = true

          required(:id).filled(:int?)
          required(:name).filled(:str?)
          required(:active).filled(:bool?)
          required(:details).maybe do
            hash do
              optional(:provider).filled(:str?)
              optional(:webhook_url).filled(:str?)
              optional(:host).filled(:str?)
              optional(:subdomain).filled(:str?)
              optional(:protocol).filled(:str?)
              optional(:port).filled(:str?)
              optional(:project_id).filled(:str?)
            end
          end
          optional(:user).maybe(:str?)
          optional(:tenant_id).maybe(:str?)
          optional(:tenancy_name).maybe(:str?)
          optional(:provider).maybe(:str?)
        end
      end
    end
  end
end
